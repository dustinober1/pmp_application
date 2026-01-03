if (!self.define) {
  let e,
    a = {};
  const s = (s, n) => (
    (s = new URL(s + '.js', n).href),
    a[s] ||
      new Promise(a => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = s), (e.onload = a), document.head.appendChild(e));
        } else ((e = s), importScripts(s), a());
      }).then(() => {
        let e = a[s];
        if (!e) throw new Error(`Module ${s} didn’t register its module`);
        return e;
      })
  );
  self.define = (n, i) => {
    const t = e || ('document' in self ? document.currentScript.src : '') || location.href;
    if (a[t]) return;
    let c = {};
    const r = e => s(e, t),
      d = { module: { uri: t }, exports: c, require: r };
    a[t] = Promise.all(n.map(e => d[e] || r(e))).then(e => (i(...e), c));
  };
}
define(['./workbox-495fd258'], function (e) {
  'use strict';
  (importScripts('fallback-XnKRJwdfWW5OJaoi8Mdae.js'),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: '/_next/app-build-manifest.json', revision: '5ef832b95ad378067b29f1bcd6728b15' },
        {
          url: '/_next/static/XnKRJwdfWW5OJaoi8Mdae/_buildManifest.js',
          revision: 'faaa18916828f796d1c86f67e67dae84',
        },
        {
          url: '/_next/static/XnKRJwdfWW5OJaoi8Mdae/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/1dd3208c-2342872fb12f1049.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        { url: '/_next/static/chunks/262-02b992eec362c218.js', revision: 'XnKRJwdfWW5OJaoi8Mdae' },
        { url: '/_next/static/chunks/340-6c998449bfcd4b4d.js', revision: 'XnKRJwdfWW5OJaoi8Mdae' },
        { url: '/_next/static/chunks/491-5743674e7a509086.js', revision: 'XnKRJwdfWW5OJaoi8Mdae' },
        { url: '/_next/static/chunks/528-49e210944e9872ad.js', revision: 'XnKRJwdfWW5OJaoi8Mdae' },
        { url: '/_next/static/chunks/610-e8b4339857a9ea6c.js', revision: 'XnKRJwdfWW5OJaoi8Mdae' },
        { url: '/_next/static/chunks/818-cf886bcab686b93b.js', revision: 'XnKRJwdfWW5OJaoi8Mdae' },
        { url: '/_next/static/chunks/826-f796bf0c23b1241c.js', revision: 'XnKRJwdfWW5OJaoi8Mdae' },
        {
          url: '/_next/static/chunks/app/_not-found/page-29d399e0bbae8f09.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/auth/forgot-password/page-1ca17487dda07fc9.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/auth/loading-bf58301ab620b8aa.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/auth/login/page-94eff3e692e17260.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/auth/register/page-a0550a9d3306fc12.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/auth/reset-password/page-17442f9ba8e46d7b.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/auth/verify-email/page-b934db31983dcab9.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/blog/page-bbd84f6ea99f156e.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/checkout/page-7759d23636851b5b.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/contact/page-b30857b9b046667d.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/dashboard/page-3674158fc0af4e99.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/faq/page-512fa8f2ea9e58ff.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/flashcards/create/page-cc8ad78ec4c2f14d.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/flashcards/page-b5ae6e5bba49162c.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/flashcards/session/%5BsessionId%5D/page-8f3974ee7b93a875.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/formulas/page-038efe561a82d79a.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/layout-cbc0c67325b698c2.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/offline/page-c43261c00facc6d5.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/page-6146e66e85ec244f.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/practice/flagged/page-cfef9d36312b7bd7.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/practice/mock/session/%5BsessionId%5D/page-b92fc9364cbb329f.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/practice/page-cf9d033eeba5f3ed.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/practice/session/%5BsessionId%5D/page-39c369aaa43cf579.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/pricing/page-7f3dea91a8c8de94.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/privacy/page-975a7526f9704e61.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/study-guide/page-50c3f8a073c86d27.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/study/%5BtaskId%5D/page-ddcbef6de5643fc8.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/study/page-06dd0a11d49b8cf3.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/team/dashboard/page-116e55d9ccbff8f7.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/app/terms/page-9070191bbe3c6fc2.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/framework-3664cab31236a9fa.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        { url: '/_next/static/chunks/main-85baab5b887b4f49.js', revision: 'XnKRJwdfWW5OJaoi8Mdae' },
        {
          url: '/_next/static/chunks/main-app-54f5ec5a29ee1a52.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/pages/_app-10a93ab5b7c32eb3.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/pages/_error-2d792b2a41857be4.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-e32b6bfe351b0ba5.js',
          revision: 'XnKRJwdfWW5OJaoi8Mdae',
        },
        { url: '/_next/static/css/1394c447bf9e5ce4.css', revision: '1394c447bf9e5ce4' },
        { url: '/_next/static/css/a1e49689b47f4865.css', revision: 'a1e49689b47f4865' },
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
        { url: '/favicon.ico', revision: '696cefb0103b5884bb01ae6b6e1e0d00' },
        { url: '/icon-192.png', revision: 'c171e456296281e8e931cdf598fa3432' },
        { url: '/icon-512.png', revision: '04461ca6410599c54b7a7e2593f5df0c' },
        { url: '/manifest.json', revision: '0c9a4a730cac55128476b0893d9f1539' },
        { url: '/offline', revision: 'XnKRJwdfWW5OJaoi8Mdae' },
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
            cacheWillUpdate: async ({ request: e, response: a, event: s, state: n }) =>
              a && 'opaqueredirect' === a.type
                ? new Response(a.body, { status: 200, statusText: 'OK', headers: a.headers })
                : a,
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
        const a = e.pathname;
        return !a.startsWith('/api/auth/') && !!a.startsWith('/api/');
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
