(() => {
  var e = {};
  ((e.id = 47),
    (e.ids = [47]),
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
      6724: (e, t, s) => {
        'use strict';
        (s.r(t),
          s.d(t, {
            GlobalError: () => i.a,
            __next_app__: () => u,
            originalPathname: () => m,
            pages: () => c,
            routeModule: () => h,
            tree: () => d,
          }),
          s(384),
          s(4773),
          s(7824));
        var r = s(3282),
          a = s(5736),
          o = s(3906),
          i = s.n(o),
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
        let d = [
            '',
            {
              children: [
                'auth',
                {
                  children: [
                    'forgot-password',
                    {
                      children: [
                        '__PAGE__',
                        {},
                        {
                          page: [
                            () => Promise.resolve().then(s.bind(s, 384)),
                            '/Users/dustinober/Projects/pmp_application/packages/web/src/app/auth/forgot-password/page.tsx',
                          ],
                        },
                      ],
                    },
                    {},
                  ],
                },
                {},
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
          c = [
            '/Users/dustinober/Projects/pmp_application/packages/web/src/app/auth/forgot-password/page.tsx',
          ],
          m = '/auth/forgot-password/page',
          u = { require: s, loadChunk: () => Promise.resolve() },
          h = new r.AppPageRouteModule({
            definition: {
              kind: a.x.APP_PAGE,
              page: '/auth/forgot-password/page',
              pathname: '/auth/forgot-password',
              bundlePath: '',
              filename: '',
              appPaths: [],
            },
            userland: { loaderTree: d },
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
      5653: (e, t, s) => {
        Promise.resolve().then(s.bind(s, 3592));
      },
      8808: (e, t, s) => {
        Promise.resolve().then(s.bind(s, 2928));
      },
      649: (e, t, s) => {
        'use strict';
        s.d(t, { default: () => a.a });
        var r = s(6568),
          a = s.n(r);
      },
      2928: (e, t, s) => {
        'use strict';
        (s.r(t), s.d(t, { default: () => n }));
        var r = s(3227),
          a = s(3677),
          o = s(649),
          i = s(7674);
        function n() {
          let [e, t] = (0, a.useState)(''),
            [s, n] = (0, a.useState)('idle'),
            [l, d] = (0, a.useState)(''),
            c = async t => {
              if ((t.preventDefault(), e)) {
                (n('loading'), d(''));
                try {
                  (await (0, i.Nv)('/auth/forgot-password', { method: 'POST', body: { email: e } }),
                    n('success'));
                } catch (e) {
                  (console.error('Password reset request failed', e),
                    n('error'),
                    d(e.message || 'Failed to send password reset email. Please try again later.'));
                }
              }
            };
          return 'success' === s
            ? r.jsx('div', {
                className:
                  'min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8',
                children: (0, r.jsxs)('div', {
                  className:
                    'max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl border border-gray-700 text-center',
                  children: [
                    r.jsx('div', { className: 'text-5xl mb-4', children: '\uD83D\uDCE7' }),
                    r.jsx('h2', {
                      className: 'text-3xl font-extrabold text-white',
                      children: 'Check your email',
                    }),
                    (0, r.jsxs)('p', {
                      className: 'mt-2 text-sm text-gray-400',
                      children: [
                        'We have sent a password reset link to',
                        ' ',
                        r.jsx('span', { className: 'text-white font-medium', children: e }),
                        '. Please check your inbox (and spam folder) and follow the instructions.',
                      ],
                    }),
                    r.jsx('div', {
                      className: 'mt-6',
                      children: r.jsx(o.default, {
                        href: '/login',
                        className: 'font-medium text-primary-400 hover:text-primary-300 transition',
                        children: 'Return to Login',
                      }),
                    }),
                  ],
                }),
              })
            : r.jsx('div', {
                className:
                  'min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8',
                children: (0, r.jsxs)('div', {
                  className: 'max-w-md w-full space-y-8',
                  children: [
                    (0, r.jsxs)('div', {
                      children: [
                        r.jsx('h2', {
                          className: 'mt-6 text-center text-3xl font-extrabold text-white',
                          children: 'Reset your password',
                        }),
                        r.jsx('p', {
                          className: 'mt-2 text-center text-sm text-gray-400',
                          children:
                            "Enter your email address and we'll send you a link to reset your password.",
                        }),
                      ],
                    }),
                    (0, r.jsxs)('form', {
                      className: 'mt-8 space-y-6',
                      onSubmit: c,
                      children: [
                        r.jsx('div', {
                          className: 'rounded-md shadow-sm -space-y-px',
                          children: (0, r.jsxs)('div', {
                            children: [
                              r.jsx('label', {
                                htmlFor: 'email-address',
                                className: 'sr-only',
                                children: 'Email address',
                              }),
                              r.jsx('input', {
                                id: 'email-address',
                                name: 'email',
                                type: 'email',
                                autoComplete: 'email',
                                required: !0,
                                value: e,
                                onChange: e => t(e.target.value),
                                className:
                                  'appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-colors',
                                placeholder: 'Email address',
                              }),
                            ],
                          }),
                        }),
                        'error' === s &&
                          r.jsx('div', {
                            className: 'rounded-md bg-red-900/30 p-4 border border-red-800',
                            children: r.jsx('div', {
                              className: 'flex',
                              children: (0, r.jsxs)('div', {
                                className: 'ml-3',
                                children: [
                                  r.jsx('h3', {
                                    className: 'text-sm font-medium text-red-400',
                                    children: 'Error',
                                  }),
                                  r.jsx('div', {
                                    className: 'mt-2 text-sm text-red-300',
                                    children: r.jsx('p', { children: l }),
                                  }),
                                ],
                              }),
                            }),
                          }),
                        r.jsx('div', {
                          children: r.jsx('button', {
                            type: 'submit',
                            disabled: 'loading' === s,
                            className: `group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${'loading' === s ? 'bg-primary-700 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-primary-500'} transition-colors shadow-lg hover:shadow-primary-900/20`,
                            children:
                              'loading' === s
                                ? (0, r.jsxs)('span', {
                                    className: 'flex items-center',
                                    children: [
                                      (0, r.jsxs)('svg', {
                                        className: 'animate-spin -ml-1 mr-3 h-5 w-5 text-white',
                                        xmlns: 'http://www.w3.org/2000/svg',
                                        fill: 'none',
                                        viewBox: '0 0 24 24',
                                        children: [
                                          r.jsx('circle', {
                                            className: 'opacity-25',
                                            cx: '12',
                                            cy: '12',
                                            r: '10',
                                            stroke: 'currentColor',
                                            strokeWidth: '4',
                                          }),
                                          r.jsx('path', {
                                            className: 'opacity-75',
                                            fill: 'currentColor',
                                            d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z',
                                          }),
                                        ],
                                      }),
                                      'Sending...',
                                    ],
                                  })
                                : 'Send Reset Link',
                          }),
                        }),
                        r.jsx('div', {
                          className: 'text-center',
                          children: r.jsx(o.default, {
                            href: '/login',
                            className:
                              'font-medium text-primary-400 hover:text-primary-300 transition text-sm',
                            children: '← Back to Login',
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
              });
        }
      },
      3592: (e, t, s) => {
        'use strict';
        s.d(t, { Providers: () => o });
        var r = s(3227),
          a = s(2278);
        function o({ children: e }) {
          return r.jsx(a.H, { children: e });
        }
      },
      2278: (e, t, s) => {
        'use strict';
        s.d(t, { H: () => n, a: () => l });
        var r = s(3227),
          a = s(3677);
        let o = (0, a.createContext)(void 0),
          i = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        function n({ children: e }) {
          let [t, s] = (0, a.useState)({
              user: null,
              token: null,
              isLoading: !0,
              isAuthenticated: !1,
            }),
            n = async e => {
              try {
                let t = await fetch(`${i}/auth/me`, { headers: { Authorization: `Bearer ${e}` } });
                if (t.ok) {
                  let r = await t.json();
                  s({ user: r.data.user, token: e, isLoading: !1, isAuthenticated: !0 });
                } else await m();
              } catch (e) {
                (console.error('Failed to fetch user:', e), c());
              }
            },
            l = async (e, t) => {
              let r = await fetch(`${i}/auth/login`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: e, password: t }),
                }),
                a = await r.json();
              if (!r.ok) throw Error(a.error?.message || 'Login failed');
              let { accessToken: o, refreshToken: n, user: l } = a.data;
              (localStorage.setItem('accessToken', o),
                localStorage.setItem('refreshToken', n),
                s({ user: l, token: o, isLoading: !1, isAuthenticated: !0 }));
            },
            d = async (e, t, r) => {
              let a = await fetch(`${i}/auth/register`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: e, password: t, name: r }),
                }),
                o = await a.json();
              if (!a.ok) throw Error(o.error?.message || 'Registration failed');
              let { accessToken: n, refreshToken: l, user: d } = o.data;
              (localStorage.setItem('accessToken', n),
                localStorage.setItem('refreshToken', l),
                s({ user: d, token: n, isLoading: !1, isAuthenticated: !0 }));
            },
            c = () => {
              (localStorage.removeItem('accessToken'),
                localStorage.removeItem('refreshToken'),
                s({ user: null, token: null, isLoading: !1, isAuthenticated: !1 }));
            },
            m = async () => {
              let e = localStorage.getItem('refreshToken');
              if (!e) {
                c();
                return;
              }
              try {
                let t = await fetch(`${i}/auth/refresh`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ refreshToken: e }),
                });
                if (t.ok) {
                  let { accessToken: e, refreshToken: s } = (await t.json()).data;
                  (localStorage.setItem('accessToken', e),
                    localStorage.setItem('refreshToken', s),
                    await n(e));
                } else c();
              } catch (e) {
                (console.error('Token refresh failed:', e), c());
              }
            };
          return r.jsx(o.Provider, {
            value: { ...t, login: l, register: d, logout: c, refreshToken: m },
            children: e,
          });
        }
        function l() {
          let e = (0, a.useContext)(o);
          if (void 0 === e) throw Error('useAuth must be used within an AuthProvider');
          return e;
        }
      },
      7674: (e, t, s) => {
        'use strict';
        s.d(t, { Lc: () => n, Nv: () => o, Sh: () => c, kx: () => d, sA: () => i, tF: () => l });
        let r = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        async function a() {
          return null;
        }
        async function o(e, t = {}) {
          let { method: s = 'GET', body: o, token: i } = t,
            n = i ?? (await a()),
            l = { 'Content-Type': 'application/json' };
          n && (l.Authorization = `Bearer ${n}`);
          let d = await fetch(`${r}${e}`, {
              method: s,
              headers: l,
              body: o ? JSON.stringify(o) : void 0,
            }),
            c = await d.json();
          if (!d.ok) throw Error(c.error?.message || 'Request failed');
          return c;
        }
        let i = {
            getDomains: () => o('/domains'),
            getDomain: e => o(`/domains/${e}`),
            getTasks: e => o(`/domains/${e}/tasks`),
            getStudyGuide: e => o(`/domains/tasks/${e}/study-guide`),
            markSectionComplete: e =>
              o(`/domains/progress/sections/${e}/complete`, { method: 'POST' }),
            getProgress: () => o('/domains/progress'),
          },
          n = {
            getFlashcards: e => {
              let t = new URLSearchParams();
              return (
                e?.domainId && t.set('domainId', e.domainId),
                e?.taskId && t.set('taskId', e.taskId),
                e?.limit && t.set('limit', String(e.limit)),
                o(`/flashcards?${t}`)
              );
            },
            getDueForReview: e => o(`/flashcards/review${e ? `?limit=${e}` : ''}`),
            getStats: () => o('/flashcards/stats'),
            startSession: e => o('/flashcards/sessions', { method: 'POST', body: e }),
            recordResponse: (e, t, s, r) =>
              o(`/flashcards/sessions/${e}/responses/${t}`, {
                method: 'POST',
                body: { rating: s, timeSpentMs: r },
              }),
            completeSession: e => o(`/flashcards/sessions/${e}/complete`, { method: 'POST' }),
            createCustom: e => o('/flashcards/custom', { method: 'POST', body: e }),
          },
          l = {
            startSession: e => o('/practice/sessions', { method: 'POST', body: e }),
            submitAnswer: (e, t, s, r) =>
              o(`/practice/sessions/${e}/answers/${t}`, {
                method: 'POST',
                body: { selectedOptionId: s, timeSpentMs: r },
              }),
            completeSession: e => o(`/practice/sessions/${e}/complete`, { method: 'POST' }),
            startMockExam: () => o('/practice/mock-exams', { method: 'POST' }),
            getFlagged: () => o('/practice/flagged'),
            flagQuestion: e => o(`/practice/questions/${e}/flag`, { method: 'POST' }),
            unflagQuestion: e => o(`/practice/questions/${e}/flag`, { method: 'DELETE' }),
            getStats: () => o('/practice/stats'),
          },
          d = {
            getDashboard: () => o('/dashboard'),
            getStreak: () => o('/dashboard/streak'),
            getProgress: () => o('/dashboard/progress'),
            getActivity: e => o(`/dashboard/activity${e ? `?limit=${e}` : ''}`),
            getReviews: e => o(`/dashboard/reviews${e ? `?limit=${e}` : ''}`),
            getWeakAreas: () => o('/dashboard/weak-areas'),
            getReadiness: () => o('/dashboard/readiness'),
            getRecommendations: () => o('/dashboard/recommendations'),
          },
          c = {
            getFormulas: e => o(`/formulas${e ? `?category=${e}` : ''}`),
            getFormula: e => o(`/formulas/${e}`),
            calculate: (e, t) =>
              o(`/formulas/${e}/calculate`, { method: 'POST', body: { inputs: t } }),
            getVariables: () => o('/formulas/variables'),
          };
      },
      384: (e, t, s) => {
        'use strict';
        (s.r(t), s.d(t, { default: () => r }));
        let r = (0, s(3189).createProxy)(
          String.raw`/Users/dustinober/Projects/pmp_application/packages/web/src/app/auth/forgot-password/page.tsx#default`
        );
      },
      4773: (e, t, s) => {
        'use strict';
        (s.r(t), s.d(t, { default: () => l, metadata: () => n }));
        var r = s(9013),
          a = s(5900),
          o = s.n(a);
        s(5556);
        let i = (0, s(3189).createProxy)(
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
              className: o().className,
              children: r.jsx(i, { children: e }),
            }),
          });
        }
      },
      5556: () => {},
    }));
  var t = require('../../../webpack-runtime.js');
  t.C(e);
  var s = e => t((t.s = e)),
    r = t.X(0, [136, 568], () => s(6724));
  module.exports = r;
})();
