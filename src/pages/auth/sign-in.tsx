import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';

import { useCallback, useEffect } from 'react';
import { useAuth } from 'reactfire';
import { useRouter } from 'next/router';
import { Trans, useTranslation } from 'next-i18next';

import configuration from '~/configuration';
import { isBrowser } from '~/core/generic/is-browser';
import getClientQueryParams from '~/core/generic/get-client-query-params';
import { getRedirectPathWithoutSearchParam } from '~/core/generic/get-redirect-url';

import { withAuthProps } from '~/lib/props/with-auth-props';
import OAuthProviders from '~/components/auth/OAuthProviders';
import AuthPageLayout from '~/components/auth/AuthPageLayout';
import ClientOnly from '~/core/ui/ClientOnly';

const appHome = configuration.paths.appHome;

const FORCE_SIGN_OUT_QUERY_PARAM = 'signOut';

export const SignIn = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const onSignIn = useCallback(() => {
    const path = getRedirectPathWithoutSearchParam(appHome);

    return router.replace(path);
  }, [router]);

  return (
    <>
      <ClientOnly>
        <SignOutRedirectHandler />
      </ClientOnly>

      <AuthPageLayout heading={<Trans i18nKey={'auth:signInHeading'} />}>
        <Head>
          <title key={'title'}>{t(`auth:signIn`)}</title>
        </Head>

        <OAuthProviders onSignIn={onSignIn} />
      </AuthPageLayout>
    </>
  );
};

export default SignIn;

export function getServerSideProps(ctx: GetServerSidePropsContext) {
  return withAuthProps(ctx);
}

function SignOutRedirectHandler() {
  const auth = useAuth();
  const shouldSignOut = useShouldSignOut();

  // force user signOut if the query parameter has been passed
  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    if (shouldSignOut) {
      void auth.signOut();
    }
  }, [auth, shouldSignOut]);

  return null;
}

function useShouldSignOut() {
  return useQueryParam(FORCE_SIGN_OUT_QUERY_PARAM) === 'true';
}

function useQueryParam(param: string) {
  if (!isBrowser()) {
    return null;
  }

  const params = getClientQueryParams();

  return params.get(param);
}
