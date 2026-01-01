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
    const i = e || ('document' in self ? document.currentScript.src : '') || location.href;
    if (s[i]) return;
    let c = {};
    const o = e => t(e, i),
      r = { module: { uri: i }, exports: c, require: o };
    s[i] = Promise.all(a.map(e => r[e] || o(e))).then(e => (n(...e), c));
  };
}
define(['./workbox-495fd258'], function (e) {
  'use strict';
  (importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: '/_next/app-build-manifest.json', revision: '41801548ff9670382fd2dc44cdf8039f' },
        {
          url: '/_next/static/chunks/1dd3208c-ae4cbf6a569521ed.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        { url: '/_next/static/chunks/340-3b5055cb4808afe3.js', revision: 'yHzqAtBWP_78oYu5gGY1I' },
        { url: '/_next/static/chunks/528-7de1cccc99b7179f.js', revision: 'yHzqAtBWP_78oYu5gGY1I' },
        { url: '/_next/static/chunks/93-bd8bc97f5a22fe55.js', revision: 'yHzqAtBWP_78oYu5gGY1I' },
        { url: '/_next/static/chunks/973-ee3c97a4681f9e7f.js', revision: 'yHzqAtBWP_78oYu5gGY1I' },
        {
          url: '/_next/static/chunks/app/_not-found/page-60318f4fb8106f0c.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/app/auth/forgot-password/page-9e3cf284ae29d6f6.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/app/auth/reset-password/page-d83264a37a38df53.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/app/auth/verify-email/page-29a41b1852ecd3fa.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/app/checkout/page-d9667ea73768d25b.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/app/dashboard/page-14f9bca60f83159f.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/app/flashcards/create/page-150a722a881d5e6c.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/app/flashcards/page-fb7803e4f0bff810.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/app/flashcards/session/%5BsessionId%5D/page-25e08837c5974e05.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/app/formulas/page-cdd733f257989658.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/app/layout-21855db3e5bdbc8d.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/app/login/page-fff606afe802eeab.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/app/offline/page-128f9885b6a87eba.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/app/page-72cc3e2610348973.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/app/practice/flagged/page-d4da21e2ed1a8596.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/app/practice/mock/session/%5BsessionId%5D/page-9d819e9c0bba56ee.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/app/practice/page-df1c7177cb077446.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/app/practice/session/%5BsessionId%5D/page-126c76a084337c7e.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/app/pricing/page-3436c6c83542d29f.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/app/register/page-8dc671f35f217d53.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/app/study/%5BtaskId%5D/page-52ff1262992d179f.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/app/study/page-0a0ff39de1d3b8b4.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/app/team/dashboard/page-fde011a221ec6e7c.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/framework-3664cab31236a9fa.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        { url: '/_next/static/chunks/main-a3fd4242b8483deb.js', revision: 'yHzqAtBWP_78oYu5gGY1I' },
        {
          url: '/_next/static/chunks/main-app-54f5ec5a29ee1a52.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/pages/_app-10a93ab5b7c32eb3.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/pages/_error-2d792b2a41857be4.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-f429638b3b64c980.js',
          revision: 'yHzqAtBWP_78oYu5gGY1I',
        },
        { url: '/_next/static/css/2d1358c154fcc217.css', revision: '2d1358c154fcc217' },
        {
          url: '/_next/static/media/19cfc7226ec3afaa-s.woff2',
          revision: '9dda5cfc9a46f256d0e131bb535e46f8',
        },
        {
          url: '/_next/static/media/21350d82a1f187e9-s.woff2',
          revision: '4e2553027f1d60eff32898367dd4d541',
        },
        {
          url: '/_next/static/media/8e9860b6e62d6359-s.woff2',
          revision: '01ba6c2a184b8cba08b0d57167664d75',
        },
        {
          url: '/_next/static/media/ba9851c3c22cd980-s.woff2',
          revision: '9e494903d6b0ffec1a1e14d34427d44d',
        },
        {
          url: '/_next/static/media/c5fe6dc8356a8c31-s.woff2',
          revision: '027a89e9ab733a145db70f09b8a18b42',
        },
        {
          url: '/_next/static/media/df0a9ae256c0569c-s.woff2',
          revision: 'd54db44de5ccb18886ece2fda72bdfe0',
        },
        {
          url: '/_next/static/media/e4af272ccee01ff0-s.p.woff2',
          revision: '65850a373e258f1c897a2b3d75eb74de',
        },
        {
          url: '/_next/static/yHzqAtBWP_78oYu5gGY1I/_buildManifest.js',
          revision: 'faaa18916828f796d1c86f67e67dae84',
        },
        {
          url: '/_next/static/yHzqAtBWP_78oYu5gGY1I/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        { url: '/manifest.json', revision: '469a30e6f7291e3fa7af2f2e95354261' },
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
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
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
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
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
        plugins: [new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 })],
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
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 })],
      }),
      'GET'
    ));
});
