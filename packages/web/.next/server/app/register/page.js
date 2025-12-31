(() => {
  var e = {};
  ((e.id = 11),
    (e.ids = [11]),
    (e.modules = {
      2934: e => {
        'use strict';
        e.exports = require('next/dist/client/components/action-async-storage.external.js');
      },
      4580: e => {
        'use strict';
        e.exports = require('next/dist/client/components/request-async-storage.external.js');
      },
      5869: e => {
        'use strict';
        e.exports = require('next/dist/client/components/static-generation-async-storage.external.js');
      },
      399: e => {
        'use strict';
        e.exports = require('next/dist/compiled/next-server/app-page.runtime.prod.js');
      },
      1518: (e, t, r) => {
        'use strict';
        (r.r(t),
          r.d(t, {
            GlobalError: () => n.a,
            __next_app__: () => m,
            originalPathname: () => u,
            pages: () => d,
            routeModule: () => p,
            tree: () => c,
          }),
          r(6870),
          r(4773),
          r(7824));
        var s = r(3282),
          a = r(5736),
          i = r(3906),
          n = r.n(i),
          o = r(6880),
          l = {};
        for (let e in o)
          0 >
            [
              'default',
              'tree',
              'pages',
              'GlobalError',
              'originalPathname',
              '__next_app__',
              'routeModule',
            ].indexOf(e) && (l[e] = () => o[e]);
        r.d(t, l);
        let c = [
            '',
            {
              children: [
                'register',
                {
                  children: [
                    '__PAGE__',
                    {},
                    {
                      page: [
                        () => Promise.resolve().then(r.bind(r, 6870)),
                        '/Users/dustinober/Projects/pmp_application/packages/web/src/app/register/page.tsx',
                      ],
                    },
                  ],
                },
                {},
              ],
            },
            {
              layout: [
                () => Promise.resolve().then(r.bind(r, 4773)),
                '/Users/dustinober/Projects/pmp_application/packages/web/src/app/layout.tsx',
              ],
              'not-found': [
                () => Promise.resolve().then(r.t.bind(r, 7824, 23)),
                'next/dist/client/components/not-found-error',
              ],
            },
          ],
          d = ['/Users/dustinober/Projects/pmp_application/packages/web/src/app/register/page.tsx'],
          u = '/register/page',
          m = { require: r, loadChunk: () => Promise.resolve() },
          p = new s.AppPageRouteModule({
            definition: {
              kind: a.x.APP_PAGE,
              page: '/register/page',
              pathname: '/register',
              bundlePath: '',
              filename: '',
              appPaths: [],
            },
            userland: { loaderTree: c },
          });
      },
      9674: (e, t, r) => {
        (Promise.resolve().then(r.t.bind(r, 4424, 23)),
          Promise.resolve().then(r.t.bind(r, 7752, 23)),
          Promise.resolve().then(r.t.bind(r, 5275, 23)),
          Promise.resolve().then(r.t.bind(r, 9842, 23)),
          Promise.resolve().then(r.t.bind(r, 1633, 23)),
          Promise.resolve().then(r.t.bind(r, 9224, 23)));
      },
      5653: (e, t, r) => {
        Promise.resolve().then(r.bind(r, 3592));
      },
      3286: (e, t, r) => {
        Promise.resolve().then(r.bind(r, 2254));
      },
      649: (e, t, r) => {
        'use strict';
        r.d(t, { default: () => a.a });
        var s = r(6568),
          a = r.n(s);
      },
      1043: (e, t, r) => {
        'use strict';
        var s = r(2854);
        r.o(s, 'useRouter') &&
          r.d(t, {
            useRouter: function () {
              return s.useRouter;
            },
          });
      },
      3592: (e, t, r) => {
        'use strict';
        r.d(t, { Providers: () => i });
        var s = r(3227),
          a = r(2278);
        function i({ children: e }) {
          return s.jsx(a.H, { children: e });
        }
      },
      2254: (e, t, r) => {
        'use strict';
        (r.r(t), r.d(t, { default: () => l }));
        var s = r(3227),
          a = r(3677),
          i = r(1043),
          n = r(649),
          o = r(2278);
        function l() {
          let e = (0, i.useRouter)(),
            { register: t, isLoading: r } = (0, o.a)(),
            [l, c] = (0, a.useState)(''),
            [d, u] = (0, a.useState)(''),
            [m, p] = (0, a.useState)(''),
            [h, x] = (0, a.useState)(''),
            [f, g] = (0, a.useState)(''),
            [v, b] = (0, a.useState)(!1),
            j = async r => {
              if ((r.preventDefault(), g(''), m !== h)) {
                g('Passwords do not match');
                return;
              }
              if (m.length < 8) {
                g('Password must be at least 8 characters');
                return;
              }
              b(!0);
              try {
                (await t(d, m, l), e.push('/dashboard'));
              } catch (e) {
                g(e instanceof Error ? e.message : 'Registration failed');
              } finally {
                b(!1);
              }
            };
          return (0, s.jsxs)('div', {
            className: 'min-h-screen flex items-center justify-center px-4 py-12',
            children: [
              s.jsx('div', {
                className:
                  'absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-purple-600 to-indigo-800 opacity-5',
              }),
              (0, s.jsxs)('div', {
                className: 'card w-full max-w-md animate-slideUp relative',
                children: [
                  (0, s.jsxs)('div', {
                    className: 'text-center mb-8',
                    children: [
                      s.jsx(n.default, {
                        href: '/',
                        className: 'inline-flex items-center gap-2 mb-6',
                        children: s.jsx('div', {
                          className:
                            'w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center',
                          children: s.jsx('span', {
                            className: 'text-white font-bold',
                            children: 'PM',
                          }),
                        }),
                      }),
                      s.jsx('h1', {
                        className: 'text-2xl font-bold',
                        children: 'Create Your Account',
                      }),
                      s.jsx('p', {
                        className: 'text-[var(--foreground-muted)] mt-2',
                        children: 'Start your PMP certification journey today',
                      }),
                    ],
                  }),
                  (0, s.jsxs)('form', {
                    onSubmit: j,
                    className: 'space-y-4',
                    children: [
                      f &&
                        s.jsx('div', {
                          className:
                            'p-3 rounded-lg bg-[var(--error-light)] text-[var(--error)] text-sm',
                          children: f,
                        }),
                      (0, s.jsxs)('div', {
                        children: [
                          s.jsx('label', {
                            htmlFor: 'name',
                            className: 'block text-sm font-medium mb-1',
                            children: 'Full Name',
                          }),
                          s.jsx('input', {
                            id: 'name',
                            type: 'text',
                            value: l,
                            onChange: e => c(e.target.value),
                            className: 'input',
                            placeholder: 'John Doe',
                            required: !0,
                          }),
                        ],
                      }),
                      (0, s.jsxs)('div', {
                        children: [
                          s.jsx('label', {
                            htmlFor: 'email',
                            className: 'block text-sm font-medium mb-1',
                            children: 'Email',
                          }),
                          s.jsx('input', {
                            id: 'email',
                            type: 'email',
                            value: d,
                            onChange: e => u(e.target.value),
                            className: 'input',
                            placeholder: 'you@example.com',
                            required: !0,
                          }),
                        ],
                      }),
                      (0, s.jsxs)('div', {
                        children: [
                          s.jsx('label', {
                            htmlFor: 'password',
                            className: 'block text-sm font-medium mb-1',
                            children: 'Password',
                          }),
                          s.jsx('input', {
                            id: 'password',
                            type: 'password',
                            value: m,
                            onChange: e => p(e.target.value),
                            className: 'input',
                            placeholder: '••••••••',
                            required: !0,
                            minLength: 8,
                          }),
                          s.jsx('p', {
                            className: 'text-xs text-[var(--foreground-muted)] mt-1',
                            children: 'Minimum 8 characters',
                          }),
                        ],
                      }),
                      (0, s.jsxs)('div', {
                        children: [
                          s.jsx('label', {
                            htmlFor: 'confirmPassword',
                            className: 'block text-sm font-medium mb-1',
                            children: 'Confirm Password',
                          }),
                          s.jsx('input', {
                            id: 'confirmPassword',
                            type: 'password',
                            value: h,
                            onChange: e => x(e.target.value),
                            className: 'input',
                            placeholder: '••••••••',
                            required: !0,
                          }),
                        ],
                      }),
                      (0, s.jsxs)('div', {
                        className: 'flex items-start gap-2 text-sm',
                        children: [
                          s.jsx('input', {
                            type: 'checkbox',
                            className: 'rounded border-[var(--border)] mt-1',
                            required: !0,
                          }),
                          (0, s.jsxs)('span', {
                            className: 'text-[var(--foreground-muted)]',
                            children: [
                              'I agree to the',
                              ' ',
                              s.jsx(n.default, {
                                href: '/terms',
                                className: 'text-[var(--primary)] hover:underline',
                                children: 'Terms of Service',
                              }),
                              ' ',
                              'and',
                              ' ',
                              s.jsx(n.default, {
                                href: '/privacy',
                                className: 'text-[var(--primary)] hover:underline',
                                children: 'Privacy Policy',
                              }),
                            ],
                          }),
                        ],
                      }),
                      s.jsx('button', {
                        type: 'submit',
                        disabled: v || r,
                        className: 'btn btn-primary w-full',
                        children: v ? 'Creating account...' : 'Create Account',
                      }),
                    ],
                  }),
                  (0, s.jsxs)('p', {
                    className: 'text-center text-sm text-[var(--foreground-muted)] mt-6',
                    children: [
                      'Already have an account?',
                      ' ',
                      s.jsx(n.default, {
                        href: '/login',
                        className: 'text-[var(--primary)] font-medium hover:underline',
                        children: 'Sign in',
                      }),
                    ],
                  }),
                ],
              }),
            ],
          });
        }
      },
      2278: (e, t, r) => {
        'use strict';
        r.d(t, { H: () => o, a: () => l });
        var s = r(3227),
          a = r(3677);
        let i = (0, a.createContext)(void 0),
          n = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        function o({ children: e }) {
          let [t, r] = (0, a.useState)({
              user: null,
              token: null,
              isLoading: !0,
              isAuthenticated: !1,
            }),
            o = async e => {
              try {
                let t = await fetch(`${n}/auth/me`, { headers: { Authorization: `Bearer ${e}` } });
                if (t.ok) {
                  let s = await t.json();
                  r({ user: s.data.user, token: e, isLoading: !1, isAuthenticated: !0 });
                } else await u();
              } catch (e) {
                (console.error('Failed to fetch user:', e), d());
              }
            },
            l = async (e, t) => {
              let s = await fetch(`${n}/auth/login`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: e, password: t }),
                }),
                a = await s.json();
              if (!s.ok) throw Error(a.error?.message || 'Login failed');
              let { accessToken: i, refreshToken: o, user: l } = a.data;
              (localStorage.setItem('accessToken', i),
                localStorage.setItem('refreshToken', o),
                r({ user: l, token: i, isLoading: !1, isAuthenticated: !0 }));
            },
            c = async (e, t, s) => {
              let a = await fetch(`${n}/auth/register`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: e, password: t, name: s }),
                }),
                i = await a.json();
              if (!a.ok) throw Error(i.error?.message || 'Registration failed');
              let { accessToken: o, refreshToken: l, user: c } = i.data;
              (localStorage.setItem('accessToken', o),
                localStorage.setItem('refreshToken', l),
                r({ user: c, token: o, isLoading: !1, isAuthenticated: !0 }));
            },
            d = () => {
              (localStorage.removeItem('accessToken'),
                localStorage.removeItem('refreshToken'),
                r({ user: null, token: null, isLoading: !1, isAuthenticated: !1 }));
            },
            u = async () => {
              let e = localStorage.getItem('refreshToken');
              if (!e) {
                d();
                return;
              }
              try {
                let t = await fetch(`${n}/auth/refresh`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ refreshToken: e }),
                });
                if (t.ok) {
                  let { accessToken: e, refreshToken: r } = (await t.json()).data;
                  (localStorage.setItem('accessToken', e),
                    localStorage.setItem('refreshToken', r),
                    await o(e));
                } else d();
              } catch (e) {
                (console.error('Token refresh failed:', e), d());
              }
            };
          return s.jsx(i.Provider, {
            value: { ...t, login: l, register: c, logout: d, refreshToken: u },
            children: e,
          });
        }
        function l() {
          let e = (0, a.useContext)(i);
          if (void 0 === e) throw Error('useAuth must be used within an AuthProvider');
          return e;
        }
      },
      4773: (e, t, r) => {
        'use strict';
        (r.r(t), r.d(t, { default: () => l, metadata: () => o }));
        var s = r(9013),
          a = r(5900),
          i = r.n(a);
        r(5556);
        let n = (0, r(3189).createProxy)(
            String.raw`/Users/dustinober/Projects/pmp_application/packages/web/src/app/providers.tsx#Providers`
          ),
          o = {
            title: 'PMP Study Pro',
            description: 'Comprehensive study platform for the 2026 PMP certification exam',
            keywords: ['PMP', 'Project Management', 'Certification', 'Study', 'Exam Prep'],
          };
        function l({ children: e }) {
          return s.jsx('html', {
            lang: 'en',
            children: s.jsx('body', {
              className: i().className,
              children: s.jsx(n, { children: e }),
            }),
          });
        }
      },
      6870: (e, t, r) => {
        'use strict';
        (r.r(t), r.d(t, { default: () => s }));
        let s = (0, r(3189).createProxy)(
          String.raw`/Users/dustinober/Projects/pmp_application/packages/web/src/app/register/page.tsx#default`
        );
      },
      5556: () => {},
    }));
  var t = require('../../webpack-runtime.js');
  t.C(e);
  var r = e => t((t.s = e)),
    s = t.X(0, [136, 568], () => r(1518));
  module.exports = s;
})();
