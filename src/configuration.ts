import { LayoutStyle } from '~/core/layout-style';
import { GoogleAuthProvider } from 'firebase/auth';

enum Themes {
  Light = 'light',
  Dark = 'dark',
}

const configuration = {
  site: {
    name: 'Chexy - Fullstack Challenge',
    description: 'Your SaaS Description',
    themeColor: '#ffffff',
    themeColorDark: '#0a0a0a',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL as string,
    siteName: 'Chexy',
    twitterHandle: '',
    githubHandle: '',
    convertKitFormId: '',
    locale: process.env.DEFAULT_LOCALE,
  },
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  },
  auth: {
    enableMultiFactorAuth: true,
    requireEmailVerification:
      process.env.NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION === 'true',
    providers: {
      emailPassword: false,
      phoneNumber: false,
      emailLink: false,
      oAuth: [GoogleAuthProvider],
    },
    useRedirectStrategy: true,
  },
  environment: process.env.NODE_ENV ?? 'development',
  emulatorHost: process.env.NEXT_PUBLIC_EMULATOR_HOST,
  emulator: process.env.NEXT_PUBLIC_EMULATOR === 'true',
  production: process.env.NODE_ENV === 'production',
  theme: Themes.Light,
  features: {
    enableThemeSwitcher: true,
    enableAccountDeletion: getBoolean(
      process.env.NEXT_PUBLIC_ENABLE_ACCOUNT_DELETION,
      false,
    ),
    enableOrganizationDeletion: getBoolean(
      process.env.NEXT_PUBLIC_ENABLE_ORGANIZATION_DELETION,
      false,
    ),
  },
  paths: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    appHome: '/dashboard',
  },
  navigation: {
    style: LayoutStyle.Sidebar,
  },
  appCheckSiteKey: process.env.NEXT_PUBLIC_APPCHECK_KEY,
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
};

export default configuration;

function getBoolean(value: unknown, defaultValue: boolean) {
  if (typeof value === 'string') {
    return value === 'true';
  }

  return defaultValue;
}
