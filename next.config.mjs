import withBundleAnalyzer from '@next/bundle-analyzer';
import i18nConfig from './next-i18next.config.js';

const analyzeBundleEnabled = process.env.ANALYZE === 'true';
const isProduction = process.env.NODE_ENV === 'production';

const MS_PER_SECOND = 1000;
const SECONDS_PER_DAY = 86400;

/**
 * @type {import("next").NextConfig}
 */
const config = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  swcMinify: false,
  reactStrictMode: true,
  images: {
    domains: getConfiguredDomains(),
    unoptimized: true,
  },
  onDemandEntries: {
    maxInactiveAge: SECONDS_PER_DAY * MS_PER_SECOND,
    pagesBufferLength: 100,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }

    if (isProduction) {
      decorateConfigWithFirebaseExternals(config);
    }

    return config;
  },
  async rewrites() {
    return [
      {
        source: '/__/auth/:path*',
        destination: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com/__/auth/:path*`,
      },
    ];
  },
  i18n: i18nConfig.i18n,
};

const nextConfig = withBundleAnalyzer({
  enabled: analyzeBundleEnabled,
})(config);

export default nextConfig;

function getConfiguredDomains() {
  const firebaseStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  return [isProduction ? firebaseStorageBucket : 'localhost'].filter(Boolean);
}

function decorateConfigWithFirebaseExternals(config) {
  config.externals = [
    ...(config.externals ?? []),
    {
      'firebase/functions': 'root Math',
      'firebase/database': 'root Math',
      'firebase/performance': 'root Math',
      'firebase/remote-config': 'root Math',
    },
  ];
}
