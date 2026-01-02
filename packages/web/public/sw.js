if (!self.define) {
  let e,
    s = {};
  const t = (t, a) => (
    (t = new URL(t + '.js', a).href),
    s[t] ||
      new Promise(s => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = t), (e.onload = s), document.head.appendChild(e));
        } else ((e = t), importScripts(t), s());
      }).then(() => {
        let e = s[t];
        if (!e) throw new Error(`Module ${t} didn’t register its module`);
        return e;
      })
  );
  self.define = (a, n) => {
    const r = e || ('document' in self ? document.currentScript.src : '') || location.href;
    if (s[r]) return;
    let i = {};
    const c = e => t(e, r),
      o = { module: { uri: r }, exports: i, require: c };
    s[r] = Promise.all(a.map(e => o[e] || c(e))).then(e => (n(...e), i));
  };
}
define(['./workbox-495fd258'], function (e) {
  'use strict';
  (importScripts('fallback-ttWSBw5A0XmrsRSJ4Tky5.js'),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: '/_next/app-build-manifest.json', revision: '2ffdd29b3e6912ecc7328f9f38e30ad6' },
        { url: '/_next/static/chunks/146-ed31d7c2b0a2a003.js', revision: 'ttWSBw5A0XmrsRSJ4Tky5' },
        {
          url: '/_next/static/chunks/1dd3208c-2342872fb12f1049.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        { url: '/_next/static/chunks/491-5743674e7a509086.js', revision: 'ttWSBw5A0XmrsRSJ4Tky5' },
        { url: '/_next/static/chunks/528-9ae99d9cf7ebdaf4.js', revision: 'ttWSBw5A0XmrsRSJ4Tky5' },
        { url: '/_next/static/chunks/610-c41423d264491baf.js', revision: 'ttWSBw5A0XmrsRSJ4Tky5' },
        { url: '/_next/static/chunks/628-f20e88e0b814f189.js', revision: 'ttWSBw5A0XmrsRSJ4Tky5' },
        { url: '/_next/static/chunks/818-63d76025ee3a0235.js', revision: 'ttWSBw5A0XmrsRSJ4Tky5' },
        { url: '/_next/static/chunks/826-32fae4f25169632a.js', revision: 'ttWSBw5A0XmrsRSJ4Tky5' },
        {
          url: '/_next/static/chunks/app/_not-found/page-29d399e0bbae8f09.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/app/auth/forgot-password/page-693eb0c1b160d548.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/app/auth/login/page-6e0d18ae4eeb071e.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/app/auth/register/page-6dd49f2fed8da9a6.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/app/auth/reset-password/page-2c7a99938b6a4974.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/app/auth/verify-email/page-476da1d9d39f21ff.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/app/checkout/page-5111745bae11124a.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/app/dashboard/page-45657d6cc1705ac4.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/app/flashcards/create/page-6b2d360194a7f804.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/app/flashcards/page-cf908bc11971e76a.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/app/flashcards/session/%5BsessionId%5D/page-5e7521e34e029d68.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/app/formulas/page-6779965be9c9df16.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/app/layout-08af01e6f212c76a.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/app/offline/page-7e36452d647ec4b1.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/app/page-3cb89cc7a6057086.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/app/practice/flagged/page-e4eb0f8118a41982.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/app/practice/mock/session/%5BsessionId%5D/page-b92fc9364cbb329f.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/app/practice/page-ee3bf6a65e009cc1.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/app/practice/session/%5BsessionId%5D/page-db9976b00426c056.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/app/pricing/page-47b370b7214d4a47.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/app/study/%5BtaskId%5D/page-acb961fe963852a1.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/app/study/page-7087f8b0d9dc72bd.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/app/team/dashboard/page-116e55d9ccbff8f7.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/framework-3664cab31236a9fa.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        { url: '/_next/static/chunks/main-8f70b0352abe2450.js', revision: 'ttWSBw5A0XmrsRSJ4Tky5' },
        {
          url: '/_next/static/chunks/main-app-54f5ec5a29ee1a52.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/pages/_app-10a93ab5b7c32eb3.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/pages/_error-2d792b2a41857be4.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-8a3798cbcbf23742.js',
          revision: 'ttWSBw5A0XmrsRSJ4Tky5',
        },
        { url: '/_next/static/css/92e3033531a7abdf.css', revision: '92e3033531a7abdf' },
        {
          url: '/_next/static/media/24c15609eaa28576-s.woff2',
          revision: 'be8ee93a8cf390eb9cb6e6aadf1a3bf0',
        },
        {
          url: '/_next/static/media/2c07349e02a7b712-s.woff2',
          revision: '399fb80a20ea7d2a53a1d6dc1e5f392a',
        },
        {
          url: '/_next/static/media/456105d6ea6d39e0-s.woff2',
          revision: '7dd9a80944f5a408172dff15b0020357',
        },
        {
          url: '/_next/static/media/47cbc4e2adbc5db9-s.p.woff2',
          revision: '4746809ed1c17447d45d2a96c64796d4',
        },
        {
          url: '/_next/static/media/4f77bef990aad698-s.woff2',
          revision: '7072622b195592e866ed97cb26005e27',
        },
        {
          url: '/_next/static/media/627d916fd739a539-s.woff2',
          revision: 'c46f88e9518178fd56311db461452f8d',
        },
        {
          url: '/_next/static/media/63b255f18bea0ca9-s.woff2',
          revision: 'd7595e609e29ce4f4f1984f0b2b29015',
        },
        {
          url: '/_next/static/media/70bd82ac89b4fa42-s.woff2',
          revision: 'a243fd759c7ef48545d096f23dccf1df',
        },
        {
          url: '/_next/static/media/84602850c8fd81c3-s.woff2',
          revision: 'bdf2a9a2d904dc21d9b593b82887af52',
        },
        {
          url: '/_next/static/ttWSBw5A0XmrsRSJ4Tky5/_buildManifest.js',
          revision: 'faaa18916828f796d1c86f67e67dae84',
        },
        {
          url: '/_next/static/ttWSBw5A0XmrsRSJ4Tky5/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        { url: '/favicon.ico', revision: '696cefb0103b5884bb01ae6b6e1e0d00' },
        { url: '/icon-192.png', revision: 'c171e456296281e8e931cdf598fa3432' },
        { url: '/icon-512.png', revision: '04461ca6410599c54b7a7e2593f5df0c' },
        { url: '/manifest.json', revision: '0c9a4a730cac55128476b0893d9f1539' },
        { url: '/offline', revision: 'ttWSBw5A0XmrsRSJ4Tky5' },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({ request: e, response: s, event: t, state: a }) =>
              s && 'opaqueredirect' === s.type
                ? new Response(s.body, { status: 200, statusText: 'OK', headers: s.headers })
                : s,
          },
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const s = e.pathname;
        return !s.startsWith('/api/auth/') && !!s.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET'
    ));
});
