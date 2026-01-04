/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
let apiOrigin = "http://localhost:3001";
try {
  apiOrigin = new URL(apiUrl).origin;
} catch {
  // Ignore invalid URL at build-time; default localhost origin above.
}

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const plausibleSrc =
  process.env.NEXT_PUBLIC_PLAUSIBLE_SRC || "https://plausible.io/js/script.js";
let plausibleOrigin = null;
try {
  plausibleOrigin = plausibleDomain ? new URL(plausibleSrc).origin : null;
} catch {
  plausibleOrigin = null;
}

const isDev = process.env.NODE_ENV !== "production";
const scriptSrc = [
  "script-src 'self'",
  ...(isDev ? ["'unsafe-eval'"] : []),
  "'unsafe-inline'",
  ...(plausibleOrigin ? [plausibleOrigin] : []),
  "https://js.stripe.com",
].join(" ");

const connectSrc = [
  "connect-src 'self'",
  apiOrigin,
  ...(plausibleOrigin ? [plausibleOrigin] : []),
  "https://api.stripe.com",
].join(" ");

const frameSrc = [
  "frame-src 'self'",
  "https://js.stripe.com",
  "https://hooks.stripe.com",
].join(" ");

const ContentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob: https://*.stripe.com",
  "font-src 'self' data: fonts.gstatic.com",
  scriptSrc,
  "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
  connectSrc,
  frameSrc,
].join("; ");

const nextConfig = {
  reactStrictMode: true,
  // Standalone output reduces memory footprint for 512MB RAM limit
  output: "standalone",
  trailingSlash: true,
  transpilePackages: ["@pmp/shared"],
  async redirects() {
    return [
      { source: "/login", destination: "/auth/login", permanent: false },
      { source: "/register", destination: "/auth/register", permanent: false },
      {
        source: "/forgot-password",
        destination: "/auth/forgot-password",
        permanent: false,
      },
      {
        source: "/reset-password",
        destination: "/auth/reset-password",
        permanent: false,
      },
      {
        source: "/verify-email",
        destination: "/auth/verify-email",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: ContentSecurityPolicy },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: "/offline",
  },
});

module.exports = withPWA(nextConfig);
