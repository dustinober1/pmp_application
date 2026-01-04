/** @type {import('next').NextConfig} */
// Base path for GitHub Pages deployment (e.g., "/pmp_application")
// Empty for local development and standard hosting
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  // Static export for GitHub Pages
  output: "export",
  trailingSlash: true,
  // Base path for GitHub Pages (empty for local dev)
  basePath: basePath,
  // Asset prefix must match basePath for GitHub Pages
  assetPrefix: basePath,

  transpilePackages: ["@pmp/shared"],

  // Enable SWC minification (faster than Terser)
  swcMinify: true,

  // Disable image optimization for static export
  // GitHub Pages cannot use Next.js Image Optimization API
  images: {
    unoptimized: true,
  },

  // Enable compression
  compress: true,

  // Optimize production builds
  productionBrowserSourceMaps: false,

  // Enable type checking in CI/CD (not during build for speed)
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Enable modern JavaScript optimizations
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },
  // NOTE: redirects() and headers() are removed because they cannot be used
  // with static export mode. GitHub Pages cannot apply server-side redirects or headers.
  // Client-side redirects should be handled in the application code.
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

// PWA is disabled for static export mode
// GitHub Pages does not support service workers for static exports
// Uncomment below if you want to re-enable PWA for non-static deployments
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const withPWA = require("next-pwa")({
//   dest: "public",
//   disable: process.env.NODE_ENV === "development",
//   register: true,
//   skipWaiting: true,
//   fallbacks: {
//     document: "/offline",
//   },
// });

module.exports = withBundleAnalyzer(nextConfig);
