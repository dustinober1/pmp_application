(() => {
  var e = {};
  ((e.id = 616),
    (e.ids = [616]),
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
      8096: (e, t, s) => {
        'use strict';
        (s.r(t),
          s.d(t, {
            GlobalError: () => i.a,
            __next_app__: () => m,
            originalPathname: () => u,
            pages: () => c,
            routeModule: () => h,
            tree: () => d,
          }),
          s(3216),
          s(4773),
          s(7824));
        var a = s(3282),
          r = s(5736),
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
                    'verify-email',
                    {
                      children: [
                        '__PAGE__',
                        {},
                        {
                          page: [
                            () => Promise.resolve().then(s.bind(s, 3216)),
                            '/Users/dustinober/Projects/pmp_application/packages/web/src/app/auth/verify-email/page.tsx',
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
            '/Users/dustinober/Projects/pmp_application/packages/web/src/app/auth/verify-email/page.tsx',
          ],
          u = '/auth/verify-email/page',
          m = { require: s, loadChunk: () => Promise.resolve() },
          h = new a.AppPageRouteModule({
            definition: {
              kind: r.x.APP_PAGE,
              page: '/auth/verify-email/page',
              pathname: '/auth/verify-email',
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
      6467: (e, t, s) => {
        Promise.resolve().then(s.bind(s, 6581));
      },
      649: (e, t, s) => {
        'use strict';
        s.d(t, { default: () => r.a });
        var a = s(6568),
          r = s.n(a);
      },
      1043: (e, t, s) => {
        'use strict';
        var a = s(2854);
        (s.o(a, 'useParams') &&
          s.d(t, {
            useParams: function () {
              return a.useParams;
            },
          }),
          s.o(a, 'useRouter') &&
            s.d(t, {
              useRouter: function () {
                return a.useRouter;
              },
            }),
          s.o(a, 'useSearchParams') &&
            s.d(t, {
              useSearchParams: function () {
                return a.useSearchParams;
              },
            }));
      },
      6581: (e, t, s) => {
        'use strict';
        (s.r(t), s.d(t, { default: () => l }));
        var a = s(3227),
          r = s(3677),
          o = s(649),
          i = s(1043);
        function n() {
          (0, i.useSearchParams)().get('token');
          let [e, t] = (0, r.useState)('verifying'),
            [s, n] = (0, r.useState)('');
          return (0, a.jsxs)('div', {
            className:
              'max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl border border-gray-700 text-center shadow-xl',
            children: [
              'verifying' === e &&
                (0, a.jsxs)(a.Fragment, {
                  children: [
                    a.jsx('div', {
                      className: 'flex justify-center mb-6',
                      children: a.jsx('div', {
                        className:
                          'animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500',
                      }),
                    }),
                    a.jsx('h2', {
                      className: 'text-2xl font-bold text-white mb-2',
                      children: 'Verifying Email...',
                    }),
                    a.jsx('p', {
                      className: 'text-gray-400',
                      children: 'Please wait while we verify your email address.',
                    }),
                  ],
                }),
              'success' === e &&
                (0, a.jsxs)(a.Fragment, {
                  children: [
                    a.jsx('div', { className: 'text-5xl mb-4', children: '\uD83C\uDF89' }),
                    a.jsx('h2', {
                      className: 'text-2xl font-bold text-white mb-2',
                      children: 'Email Verified!',
                    }),
                    a.jsx('p', {
                      className: 'text-gray-400 mb-6',
                      children:
                        'Your email address has been successfully verified. You can now access all features of your account.',
                    }),
                    a.jsx(o.default, {
                      href: '/dashboard',
                      className:
                        'block w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition shadow-lg',
                      children: 'Continue to Dashboard',
                    }),
                  ],
                }),
              'error' === e &&
                (0, a.jsxs)(a.Fragment, {
                  children: [
                    a.jsx('div', { className: 'text-5xl mb-4', children: '❌' }),
                    a.jsx('h2', {
                      className: 'text-2xl font-bold text-white mb-2',
                      children: 'Verification Failed',
                    }),
                    a.jsx('p', {
                      className:
                        'text-red-300 mb-6 bg-red-900/20 p-3 rounded-lg border border-red-800/50',
                      children: s,
                    }),
                    (0, a.jsxs)('div', {
                      className: 'space-y-3',
                      children: [
                        a.jsx(o.default, {
                          href: '/auth/forgot-password',
                          className:
                            'block w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition',
                          children: 'Resend Verification Email',
                        }),
                        a.jsx(o.default, {
                          href: '/dashboard',
                          className:
                            'block w-full text-sm text-gray-400 hover:text-white transition',
                          children: 'Back to Dashboard',
                        }),
                      ],
                    }),
                  ],
                }),
            ],
          });
        }
        function l() {
          return a.jsx('div', {
            className:
              'min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8',
            children: a.jsx(r.Suspense, {
              fallback: a.jsx('div', { className: 'text-white', children: 'Loading...' }),
              children: a.jsx(n, {}),
            }),
          });
        }
        s(7674);
      },
      3592: (e, t, s) => {
        'use strict';
        s.d(t, { Providers: () => o });
        var a = s(3227),
          r = s(2278);
        function o({ children: e }) {
          return a.jsx(r.H, { children: e });
        }
      },
      2278: (e, t, s) => {
        'use strict';
        s.d(t, { H: () => n, a: () => l });
        var a = s(3227),
          r = s(3677);
        let o = (0, r.createContext)(void 0),
          i = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        function n({ children: e }) {
          let [t, s] = (0, r.useState)({
              user: null,
              token: null,
              isLoading: !0,
              isAuthenticated: !1,
            }),
            n = async e => {
              try {
                let t = await fetch(`${i}/auth/me`, { headers: { Authorization: `Bearer ${e}` } });
                if (t.ok) {
                  let a = await t.json();
                  s({ user: a.data.user, token: e, isLoading: !1, isAuthenticated: !0 });
                } else await u();
              } catch (e) {
                (console.error('Failed to fetch user:', e), c());
              }
            },
            l = async (e, t) => {
              let a = await fetch(`${i}/auth/login`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: e, password: t }),
                }),
                r = await a.json();
              if (!a.ok) throw Error(r.error?.message || 'Login failed');
              let { accessToken: o, refreshToken: n, user: l } = r.data;
              (localStorage.setItem('accessToken', o),
                localStorage.setItem('refreshToken', n),
                s({ user: l, token: o, isLoading: !1, isAuthenticated: !0 }));
            },
            d = async (e, t, a) => {
              let r = await fetch(`${i}/auth/register`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: e, password: t, name: a }),
                }),
                o = await r.json();
              if (!r.ok) throw Error(o.error?.message || 'Registration failed');
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
            u = async () => {
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
          return a.jsx(o.Provider, {
            value: { ...t, login: l, register: d, logout: c, refreshToken: u },
            children: e,
          });
        }
        function l() {
          let e = (0, r.useContext)(o);
          if (void 0 === e) throw Error('useAuth must be used within an AuthProvider');
          return e;
        }
      },
      7674: (e, t, s) => {
        'use strict';
        s.d(t, { Lc: () => n, Nv: () => o, Sh: () => c, kx: () => d, sA: () => i, tF: () => l });
        let a = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        async function r() {
          return null;
        }
        async function o(e, t = {}) {
          let { method: s = 'GET', body: o, token: i } = t,
            n = i ?? (await r()),
            l = { 'Content-Type': 'application/json' };
          n && (l.Authorization = `Bearer ${n}`);
          let d = await fetch(`${a}${e}`, {
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
            recordResponse: (e, t, s, a) =>
              o(`/flashcards/sessions/${e}/responses/${t}`, {
                method: 'POST',
                body: { rating: s, timeSpentMs: a },
              }),
            completeSession: e => o(`/flashcards/sessions/${e}/complete`, { method: 'POST' }),
            createCustom: e => o('/flashcards/custom', { method: 'POST', body: e }),
          },
          l = {
            startSession: e => o('/practice/sessions', { method: 'POST', body: e }),
            submitAnswer: (e, t, s, a) =>
              o(`/practice/sessions/${e}/answers/${t}`, {
                method: 'POST',
                body: { selectedOptionId: s, timeSpentMs: a },
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
      3216: (e, t, s) => {
        'use strict';
        (s.r(t), s.d(t, { default: () => a }));
        let a = (0, s(3189).createProxy)(
          String.raw`/Users/dustinober/Projects/pmp_application/packages/web/src/app/auth/verify-email/page.tsx#default`
        );
      },
      4773: (e, t, s) => {
        'use strict';
        (s.r(t), s.d(t, { default: () => l, metadata: () => n }));
        var a = s(9013),
          r = s(5900),
          o = s.n(r);
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
          return a.jsx('html', {
            lang: 'en',
            children: a.jsx('body', {
              className: o().className,
              children: a.jsx(i, { children: e }),
            }),
          });
        }
      },
      5556: () => {},
    }));
  var t = require('../../../webpack-runtime.js');
  t.C(e);
  var s = e => t((t.s = e)),
    a = t.X(0, [136, 568], () => s(8096));
  module.exports = a;
})();
