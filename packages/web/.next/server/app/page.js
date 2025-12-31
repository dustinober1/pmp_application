(() => {
  var e = {};
  ((e.id = 931),
    (e.ids = [931]),
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
      6497: (e, t, s) => {
        'use strict';
        (s.r(t),
          s.d(t, {
            GlobalError: () => o.a,
            __next_app__: () => h,
            originalPathname: () => m,
            pages: () => d,
            routeModule: () => p,
            tree: () => c,
          }),
          s(7846),
          s(4773),
          s(7824));
        var r = s(3282),
          a = s(5736),
          i = s(3906),
          o = s.n(i),
          n = s(6880),
          l = {};
        for (let e in n)
          0 >
            [
              'default',
              'tree',
              'pages',
              'GlobalError',
              'originalPathname',
              '__next_app__',
              'routeModule',
            ].indexOf(e) && (l[e] = () => n[e]);
        s.d(t, l);
        let c = [
            '',
            {
              children: [
                '__PAGE__',
                {},
                {
                  page: [
                    () => Promise.resolve().then(s.bind(s, 7846)),
                    '/Users/dustinober/Projects/pmp_application/packages/web/src/app/page.tsx',
                  ],
                },
              ],
            },
            {
              layout: [
                () => Promise.resolve().then(s.bind(s, 4773)),
                '/Users/dustinober/Projects/pmp_application/packages/web/src/app/layout.tsx',
              ],
              'not-found': [
                () => Promise.resolve().then(s.t.bind(s, 7824, 23)),
                'next/dist/client/components/not-found-error',
              ],
            },
          ],
          d = ['/Users/dustinober/Projects/pmp_application/packages/web/src/app/page.tsx'],
          m = '/page',
          h = { require: s, loadChunk: () => Promise.resolve() },
          p = new r.AppPageRouteModule({
            definition: {
              kind: a.x.APP_PAGE,
              page: '/page',
              pathname: '/',
              bundlePath: '',
              filename: '',
              appPaths: [],
            },
            userland: { loaderTree: c },
          });
      },
      9674: (e, t, s) => {
        (Promise.resolve().then(s.t.bind(s, 4424, 23)),
          Promise.resolve().then(s.t.bind(s, 7752, 23)),
          Promise.resolve().then(s.t.bind(s, 5275, 23)),
          Promise.resolve().then(s.t.bind(s, 9842, 23)),
          Promise.resolve().then(s.t.bind(s, 1633, 23)),
          Promise.resolve().then(s.t.bind(s, 9224, 23)));
      },
      586: (e, t, s) => {
        Promise.resolve().then(s.t.bind(s, 6568, 23));
      },
      5653: (e, t, s) => {
        Promise.resolve().then(s.bind(s, 3592));
      },
      3592: (e, t, s) => {
        'use strict';
        s.d(t, { Providers: () => i });
        var r = s(3227),
          a = s(2278);
        function i({ children: e }) {
          return r.jsx(a.H, { children: e });
        }
      },
      2278: (e, t, s) => {
        'use strict';
        s.d(t, { H: () => n, a: () => l });
        var r = s(3227),
          a = s(3677);
        let i = (0, a.createContext)(void 0),
          o = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        function n({ children: e }) {
          let [t, s] = (0, a.useState)({
              user: null,
              token: null,
              isLoading: !0,
              isAuthenticated: !1,
            }),
            n = async e => {
              try {
                let t = await fetch(`${o}/auth/me`, { headers: { Authorization: `Bearer ${e}` } });
                if (t.ok) {
                  let r = await t.json();
                  s({ user: r.data.user, token: e, isLoading: !1, isAuthenticated: !0 });
                } else await m();
              } catch (e) {
                (console.error('Failed to fetch user:', e), d());
              }
            },
            l = async (e, t) => {
              let r = await fetch(`${o}/auth/login`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: e, password: t }),
                }),
                a = await r.json();
              if (!r.ok) throw Error(a.error?.message || 'Login failed');
              let { accessToken: i, refreshToken: n, user: l } = a.data;
              (localStorage.setItem('accessToken', i),
                localStorage.setItem('refreshToken', n),
                s({ user: l, token: i, isLoading: !1, isAuthenticated: !0 }));
            },
            c = async (e, t, r) => {
              let a = await fetch(`${o}/auth/register`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: e, password: t, name: r }),
                }),
                i = await a.json();
              if (!a.ok) throw Error(i.error?.message || 'Registration failed');
              let { accessToken: n, refreshToken: l, user: c } = i.data;
              (localStorage.setItem('accessToken', n),
                localStorage.setItem('refreshToken', l),
                s({ user: c, token: n, isLoading: !1, isAuthenticated: !0 }));
            },
            d = () => {
              (localStorage.removeItem('accessToken'),
                localStorage.removeItem('refreshToken'),
                s({ user: null, token: null, isLoading: !1, isAuthenticated: !1 }));
            },
            m = async () => {
              let e = localStorage.getItem('refreshToken');
              if (!e) {
                d();
                return;
              }
              try {
                let t = await fetch(`${o}/auth/refresh`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ refreshToken: e }),
                });
                if (t.ok) {
                  let { accessToken: e, refreshToken: s } = (await t.json()).data;
                  (localStorage.setItem('accessToken', e),
                    localStorage.setItem('refreshToken', s),
                    await n(e));
                } else d();
              } catch (e) {
                (console.error('Token refresh failed:', e), d());
              }
            };
          return r.jsx(i.Provider, {
            value: { ...t, login: l, register: c, logout: d, refreshToken: m },
            children: e,
          });
        }
        function l() {
          let e = (0, a.useContext)(i);
          if (void 0 === e) throw Error('useAuth must be used within an AuthProvider');
          return e;
        }
      },
      277: (e, t, s) => {
        'use strict';
        let { createProxy: r } = s(3189);
        e.exports = r(
          '/Users/dustinober/Projects/pmp_application/node_modules/next/dist/client/link.js'
        );
      },
      4773: (e, t, s) => {
        'use strict';
        (s.r(t), s.d(t, { default: () => l, metadata: () => n }));
        var r = s(9013),
          a = s(5900),
          i = s.n(a);
        s(5556);
        let o = (0, s(3189).createProxy)(
            String.raw`/Users/dustinober/Projects/pmp_application/packages/web/src/app/providers.tsx#Providers`
          ),
          n = {
            title: 'PMP Study Pro',
            description: 'Comprehensive study platform for the 2026 PMP certification exam',
            keywords: ['PMP', 'Project Management', 'Certification', 'Study', 'Exam Prep'],
          };
        function l({ children: e }) {
          return r.jsx('html', {
            lang: 'en',
            children: r.jsx('body', {
              className: i().className,
              children: r.jsx(o, { children: e }),
            }),
          });
        }
      },
      7846: (e, t, s) => {
        'use strict';
        (s.r(t), s.d(t, { default: () => o }));
        var r = s(9013),
          a = s(277),
          i = s.n(a);
        function o() {
          return (0, r.jsxs)('div', {
            className: 'min-h-screen',
            children: [
              (0, r.jsxs)('section', {
                className: 'relative overflow-hidden',
                children: [
                  r.jsx('div', {
                    className:
                      'absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-purple-600 to-indigo-800 opacity-10',
                  }),
                  r.jsx('div', {
                    className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32',
                    children: (0, r.jsxs)('div', {
                      className: 'text-center animate-slideUp',
                      children: [
                        (0, r.jsxs)('h1', {
                          className: 'text-4xl sm:text-5xl lg:text-6xl font-bold mb-6',
                          children: [
                            'Pass the ',
                            r.jsx('span', {
                              className: 'gradient-text',
                              children: '2026 PMP Exam',
                            }),
                            r.jsx('br', {}),
                            'with Confidence',
                          ],
                        }),
                        r.jsx('p', {
                          className:
                            'text-xl text-[var(--foreground-muted)] max-w-2xl mx-auto mb-8',
                          children:
                            'Comprehensive study materials, practice questions, and AI-powered insights designed to help you succeed on your first attempt.',
                        }),
                        (0, r.jsxs)('div', {
                          className: 'flex flex-wrap gap-4 justify-center',
                          children: [
                            r.jsx(i(), {
                              href: '/register',
                              className: 'btn btn-primary text-lg px-8 py-3',
                              children: 'Start Free Trial',
                            }),
                            r.jsx(i(), {
                              href: '/login',
                              className: 'btn btn-outline text-lg px-8 py-3',
                              children: 'Sign In',
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                ],
              }),
              r.jsx('section', {
                className: 'py-20 bg-[var(--background-alt)]',
                children: (0, r.jsxs)('div', {
                  className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
                  children: [
                    r.jsx('h2', {
                      className: 'text-3xl font-bold text-center mb-12',
                      children: 'Everything You Need to Pass',
                    }),
                    r.jsx('div', {
                      className: 'grid md:grid-cols-2 lg:grid-cols-3 gap-6',
                      children: n.map((e, t) =>
                        (0, r.jsxs)(
                          'div',
                          {
                            className: 'card hover:border-[var(--primary)] transition-colors',
                            children: [
                              r.jsx('div', {
                                className:
                                  'w-12 h-12 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center mb-4',
                                children: e.icon,
                              }),
                              r.jsx('h3', {
                                className: 'text-lg font-semibold mb-2',
                                children: e.title,
                              }),
                              r.jsx('p', {
                                className: 'text-[var(--foreground-muted)]',
                                children: e.description,
                              }),
                            ],
                          },
                          t
                        )
                      ),
                    }),
                  ],
                }),
              }),
              r.jsx('section', {
                className: 'py-20',
                children: r.jsx('div', {
                  className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
                  children: r.jsx('div', {
                    className: 'grid grid-cols-2 lg:grid-cols-4 gap-8 text-center',
                    children: l.map((e, t) =>
                      (0, r.jsxs)(
                        'div',
                        {
                          children: [
                            r.jsx('p', {
                              className: 'text-4xl font-bold gradient-text',
                              children: e.value,
                            }),
                            r.jsx('p', {
                              className: 'text-[var(--foreground-muted)] mt-2',
                              children: e.label,
                            }),
                          ],
                        },
                        t
                      )
                    ),
                  }),
                }),
              }),
              r.jsx('section', {
                className: 'py-20 bg-[var(--background-alt)]',
                children: (0, r.jsxs)('div', {
                  className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
                  children: [
                    r.jsx('h2', {
                      className: 'text-3xl font-bold text-center mb-4',
                      children: 'Simple, Transparent Pricing',
                    }),
                    r.jsx('p', {
                      className:
                        'text-[var(--foreground-muted)] text-center mb-12 max-w-2xl mx-auto',
                      children:
                        'Choose the plan that fits your study needs. Upgrade or downgrade anytime.',
                    }),
                    r.jsx('div', {
                      className: 'grid md:grid-cols-2 lg:grid-cols-4 gap-6',
                      children: c.map((e, t) =>
                        (0, r.jsxs)(
                          'div',
                          {
                            className: `card ${e.popular ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]' : ''}`,
                            children: [
                              e.popular &&
                                r.jsx('span', {
                                  className: 'badge badge-primary mb-4',
                                  children: 'Most Popular',
                                }),
                              r.jsx('h3', { className: 'text-xl font-bold', children: e.name }),
                              (0, r.jsxs)('p', {
                                className: 'text-3xl font-bold mt-4',
                                children: [
                                  '$',
                                  e.price,
                                  r.jsx('span', {
                                    className: 'text-sm font-normal text-[var(--foreground-muted)]',
                                    children: '/mo',
                                  }),
                                ],
                              }),
                              r.jsx('ul', {
                                className: 'mt-6 space-y-3',
                                children: e.features.map((e, t) =>
                                  (0, r.jsxs)(
                                    'li',
                                    {
                                      className: 'flex items-center gap-2 text-sm',
                                      children: [
                                        r.jsx('svg', {
                                          className: 'w-5 h-5 text-[var(--success)]',
                                          fill: 'none',
                                          stroke: 'currentColor',
                                          viewBox: '0 0 24 24',
                                          children: r.jsx('path', {
                                            strokeLinecap: 'round',
                                            strokeLinejoin: 'round',
                                            strokeWidth: 2,
                                            d: 'M5 13l4 4L19 7',
                                          }),
                                        }),
                                        e,
                                      ],
                                    },
                                    t
                                  )
                                ),
                              }),
                              r.jsx(i(), {
                                href: '/register',
                                className: `btn w-full mt-6 ${e.popular ? 'btn-primary' : 'btn-secondary'}`,
                                children: 'Get Started',
                              }),
                            ],
                          },
                          t
                        )
                      ),
                    }),
                  ],
                }),
              }),
              r.jsx('section', {
                className: 'py-20',
                children: (0, r.jsxs)('div', {
                  className: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center',
                  children: [
                    r.jsx('h2', {
                      className: 'text-3xl font-bold mb-4',
                      children: 'Ready to Ace Your PMP Exam?',
                    }),
                    r.jsx('p', {
                      className: 'text-[var(--foreground-muted)] mb-8',
                      children:
                        'Join thousands of successful PMP-certified professionals who studied with us.',
                    }),
                    r.jsx(i(), {
                      href: '/register',
                      className: 'btn btn-primary text-lg px-8 py-3',
                      children: 'Start Your Free Trial Today',
                    }),
                  ],
                }),
              }),
              r.jsx('footer', {
                className: 'border-t border-[var(--border)] py-12',
                children: r.jsx('div', {
                  className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
                  children: (0, r.jsxs)('div', {
                    className: 'flex flex-col md:flex-row justify-between items-center gap-4',
                    children: [
                      (0, r.jsxs)('div', {
                        className: 'flex items-center gap-2',
                        children: [
                          r.jsx('div', {
                            className:
                              'w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center',
                            children: r.jsx('span', {
                              className: 'text-white font-bold text-sm',
                              children: 'PM',
                            }),
                          }),
                          r.jsx('span', { className: 'font-semibold', children: 'PMP Study Pro' }),
                        ],
                      }),
                      r.jsx('p', {
                        className: 'text-[var(--foreground-muted)] text-sm',
                        children: '\xa9 2024 PMP Study Pro. All rights reserved.',
                      }),
                    ],
                  }),
                }),
              }),
            ],
          });
        }
        let n = [
            {
              icon: r.jsx('svg', {
                className: 'w-6 h-6',
                fill: 'none',
                stroke: 'currentColor',
                viewBox: '0 0 24 24',
                children: r.jsx('path', {
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  strokeWidth: 2,
                  d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
                }),
              }),
              title: 'Comprehensive Study Guides',
              description: 'In-depth coverage of all PMP domains aligned with the 2026 ECO.',
            },
            {
              icon: r.jsx('svg', {
                className: 'w-6 h-6',
                fill: 'none',
                stroke: 'currentColor',
                viewBox: '0 0 24 24',
                children: r.jsx('path', {
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  strokeWidth: 2,
                  d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
                }),
              }),
              title: '1,800+ Practice Questions',
              description: 'Realistic exam questions with detailed explanations and rationales.',
            },
            {
              icon: r.jsx('svg', {
                className: 'w-6 h-6',
                fill: 'none',
                stroke: 'currentColor',
                viewBox: '0 0 24 24',
                children: r.jsx('path', {
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  strokeWidth: 2,
                  d: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
                }),
              }),
              title: 'Spaced Repetition Flashcards',
              description: 'Optimize your memory with our SM-2 algorithm-powered flashcards.',
            },
            {
              icon: r.jsx('svg', {
                className: 'w-6 h-6',
                fill: 'none',
                stroke: 'currentColor',
                viewBox: '0 0 24 24',
                children: r.jsx('path', {
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  strokeWidth: 2,
                  d: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
                }),
              }),
              title: 'Formula Calculator',
              description: 'Interactive EVM and PERT calculators with step-by-step solutions.',
            },
            {
              icon: r.jsx('svg', {
                className: 'w-6 h-6',
                fill: 'none',
                stroke: 'currentColor',
                viewBox: '0 0 24 24',
                children: r.jsx('path', {
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  strokeWidth: 2,
                  d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                }),
              }),
              title: 'Analytics Dashboard',
              description: 'Track your progress and identify areas needing improvement.',
            },
            {
              icon: r.jsx('svg', {
                className: 'w-6 h-6',
                fill: 'none',
                stroke: 'currentColor',
                viewBox: '0 0 24 24',
                children: r.jsx('path', {
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  strokeWidth: 2,
                  d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
                }),
              }),
              title: 'Full Mock Exams',
              description: 'Simulate the real exam experience with timed 180-question tests.',
            },
          ],
          l = [
            { value: '95%', label: 'Pass Rate' },
            { value: '1,800+', label: 'Practice Questions' },
            { value: '500+', label: 'Flashcards' },
            { value: '50K+', label: 'Students' },
          ],
          c = [
            {
              name: 'Free',
              price: 0,
              features: [
                'Basic study guides',
                '100 practice questions',
                '50 flashcards',
                'Progress tracking',
              ],
            },
            {
              name: 'Mid-Level',
              price: 19,
              features: [
                'All Free features',
                '500+ questions',
                'Exam readiness score',
                'Weak area analysis',
              ],
            },
            {
              name: 'High-End',
              price: 39,
              popular: !0,
              features: [
                'All Mid-Level features',
                '1,800+ questions',
                'Mock exams',
                'Formula calculator',
                'AI recommendations',
              ],
            },
            {
              name: 'Corporate',
              price: 79,
              features: [
                'All High-End features',
                'Team management',
                'Progress reports',
                'Dedicated support',
              ],
            },
          ];
      },
      5556: () => {},
    }));
  var t = require('../webpack-runtime.js');
  t.C(e);
  var s = e => t((t.s = e)),
    r = t.X(0, [136, 568], () => s(6497));
  module.exports = r;
})();
