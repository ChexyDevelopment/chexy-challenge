import { GetServerSidePropsContext } from 'next';
import { setCookie, parseCookies } from 'nookies';

import configuration from '~/configuration';
import { getUserInfoById } from '~/core/firebase/admin/auth/get-user-info-by-id';
import { getLoggedInUser } from '~/core/firebase/admin/auth/get-logged-in-user';
import { initializeFirebaseAdminApp } from '~/core/firebase/admin/initialize-firebase-admin-app';

import { getCurrentOrganization } from '~/lib/server/organizations/get-current-organization';
import { withTranslationProps } from '~/lib/props/with-translation-props';
import { getUserData } from '~/lib/server/queries';

import createCsrfCookie from '~/core/generic/create-csrf-token';
import { signOutServerSession } from '~/core/session/sign-out-server-session';
import logger from '~/core/logger';
import { getAllPosts } from '~/core/blog/api';

const ORGANIZATION_ID_COOKIE_NAME = 'organizationId';

const DEFAULT_OPTIONS = {
  redirectPath: configuration.paths.signIn,
  locale: configuration.site.locale ?? 'en',
  localeNamespaces: <string[]>[],
};

const requireEmailVerification = configuration.auth.requireEmailVerification;

/**
 * @description A server props pipe to fetch the selected user and the organization
 * @param ctx
 * @param options
 */
export async function withAppProps(
  ctx: GetServerSidePropsContext,
  options: Partial<typeof DEFAULT_OPTIONS> = DEFAULT_OPTIONS,
) {
  const mergedOptions = getAppPropsOptions(ctx.locale, options);
  const { redirectPath } = mergedOptions;

  const forceSignOut = async () => {
    // clear session cookies to avoid stale data
    await signOutServerSession(ctx.req, ctx.res);

    return redirectToLogin({
      returnUrl: ctx.resolvedUrl,
      redirectPath,
      signOut: true,
    });
  };

  await initializeFirebaseAdminApp();

  let metadata: Awaited<ReturnType<typeof getUserAuthMetadata>>;

  try {
    metadata = await getUserAuthMetadata(ctx);
  } catch (error) {
    logger.debug(
      {
        error,
      },
      'Encountered an error while retrieving user metadata. Forcing sign out...',
    );

    return forceSignOut();
  }

  // if for any reason we're not able to fetch the user's data, we redirect
  // back to the login page
  if (!metadata) {
    return forceSignOut();
  }

  try {
    const userId = metadata.uid;
    const isEmailVerified = metadata.emailVerified;

    // check if the user has an email/password provider linked to their account
    // if they don't, we don't need to verify their email
    const userHasProviderWithEmailVerification =
      metadata.signInProvider === 'password';

    // we check if the user needs to verify their email
    if (requireEmailVerification) {
      // if the user is not yet verified, we redirect them back to the login
      if (!isEmailVerified && userHasProviderWithEmailVerification) {
        return redirectToLogin({
          returnUrl: ctx.resolvedUrl,
          redirectPath,
          needsEmailVerification: true,
          signOut: true,
        });
      }
    }

    const currentOrganizationId = ctx.req.cookies[ORGANIZATION_ID_COOKIE_NAME];

    // we fetch the user and organization records from Firestore
    // which is a separate object from the auth metadata
    const [user, organization] = await Promise.all([
      getUserData(userId),
      getCurrentOrganization(userId, currentOrganizationId),
    ]);

    // if the user wasn't found, force sign out
    if (!user || !organization) {
      return forceSignOut();
    }

    // if the organization is found, save the ID in a cookie
    // so that we can fetch it on the next request
    if (organization) {
      saveOrganizationInCookies(ctx, organization.id);
    }

    const csrfToken = await createCsrfCookie(ctx);

    const { props: translationProps } =
      await withTranslationProps(mergedOptions);

    const ui = getUiProps(ctx);

    return {
      props: {
        session: metadata,
        user,
        organization,
        csrfToken,
        ui,
        posts: getAllPosts(),
        ...translationProps,
      },
    };
  } catch (error) {
    logger.warn(
      {
        error,
      },
      'Encountered an error while retrieving app data. Forcing sign out...',
    );

    return forceSignOut();
  }
}

/**
 * @name redirectToLogin
 */
function redirectToLogin({
  returnUrl,
  redirectPath,
  needsEmailVerification,
  signOut,
}: {
  returnUrl: string;
  redirectPath: string;
  needsEmailVerification?: boolean;
  signOut: boolean;
}) {
  const cleanReturnUrl = getPathFromReturnUrl(returnUrl);

  const params: StringObject = {
    returnUrl: cleanReturnUrl ?? '/',
  };

  if (needsEmailVerification) {
    params.needsEmailVerification = 'true';
  }

  if (signOut) {
    params.signOut = 'true';
  }

  const queryParams = new URLSearchParams(params);

  // we build the sign in URL
  // appending the "returnUrl" query parameter so that we can redirect the user
  // straight to where they were headed and the "signOut" parameter
  // to force the client to sign the user out from the client SDK
  const destination = `${redirectPath}?${queryParams}`;

  return {
    redirect: {
      permanent: false,
      destination,
    },
  };
}

async function getUserAuthMetadata(ctx: GetServerSidePropsContext) {
  const user = await getLoggedInUser(ctx);
  const data = await getUserInfoById(user.uid);

  if (!data) {
    return;
  }

  const signInProvider = user.firebase.sign_in_provider;

  return {
    ...data,
    signInProvider,
  };
}

function saveOrganizationInCookies(
  ctx: GetServerSidePropsContext,
  organizationId: string,
) {
  setCookie(ctx, ORGANIZATION_ID_COOKIE_NAME, organizationId, {
    path: '/',
    httpOnly: true,
  });
}

function getAppPropsOptions(
  locale: string | undefined,
  options: Partial<typeof DEFAULT_OPTIONS>,
) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  return {
    ...mergedOptions,
    locale: locale ?? mergedOptions.locale,
  };
}

function getUiProps(ctx: GetServerSidePropsContext) {
  const cookies = parseCookies(ctx);
  const sidebarState = cookies['sidebarState'] ?? 'expanded';
  const theme = cookies['theme'] ?? configuration.theme;

  return {
    sidebarState,
    theme,
  };
}

function getPathFromReturnUrl(returnUrl: string) {
  try {
    return new URL(returnUrl).pathname;
  } catch (e) {
    return returnUrl.split('?')[0];
  }
}
