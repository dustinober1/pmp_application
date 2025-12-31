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
            GlobalError: () => o.a,
            __next_app__: () => h,
            originalPathname: () => u,
            pages: () => d,
            routeModule: () => m,
            tree: () => c,
          }),
          s(3216),
          s(4773),
          s(7824));
        var a = s(3282),
          r = s(5736),
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
          d = [
            '/Users/dustinober/Projects/pmp_application/packages/web/src/app/auth/verify-email/page.tsx',
          ],
          u = '/auth/verify-email/page',
          h = { require: s, loadChunk: () => Promise.resolve() },
          m = new a.AppPageRouteModule({
            definition: {
              kind: r.x.APP_PAGE,
              page: '/auth/verify-email/page',
              pathname: '/auth/verify-email',
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
      5653: (e, t, s) => {
        Promise.resolve().then(s.bind(s, 4076));
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
          i = s(649),
          o = s(1043);
        function n() {
          (0, o.useSearchParams)().get('token');
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
                    a.jsx(i.default, {
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
                        a.jsx(i.default, {
                          href: '/auth/forgot-password',
                          className:
                            'block w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition',
                          children: 'Resend Verification Email',
                        }),
                        a.jsx(i.default, {
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
      4076: (e, t, s) => {
        'use strict';
        s.d(t, { Providers: () => l });
        var a = s(3227),
          r = s(2278),
          i = s(7674);
        let o = 'pmp_offline_sync_queue';
        class n {
          constructor() {
            ((this.queue = []), (this.isSyncing = !1));
          }
          loadQueue() {
            let e = localStorage.getItem(o);
            e && (this.queue = JSON.parse(e));
          }
          saveQueue() {
            localStorage.setItem(o, JSON.stringify(this.queue));
          }
          async queueAction(e, t) {
            let s = { id: crypto.randomUUID(), type: e, payload: t, timestamp: Date.now() };
            (this.queue.push(s), this.saveQueue(), navigator.onLine && (await this.sync()));
          }
          async sync() {
            if (this.isSyncing || 0 === this.queue.length || !navigator.onLine) return;
            this.isSyncing = !0;
            let e = [],
              t = [...this.queue];
            for (let s of (console.log(`[Sync] Processing ${t.length} actions...`), t))
              try {
                await this.processAction(s);
              } catch (t) {
                (console.error(`[Sync] Failed to process action ${s.id}`, t), e.push(s));
              }
            ((this.queue = e),
              this.saveQueue(),
              (this.isSyncing = !1),
              0 === e.length
                ? console.log('[Sync] Synchronization complete.')
                : console.warn(`[Sync] Completed with ${e.length} failures.`));
          }
          async processAction(e) {
            switch (e.type) {
              case 'MARK_SECTION_COMPLETE':
                await (0, i.Nv)(`/study/sections/${e.payload.sectionId}/complete`, {
                  method: 'POST',
                });
                break;
              case 'SUBMIT_FLASHCARD_RESULT':
                await (0, i.Nv)(`/flashcards/${e.payload.flashcardId}/review`, {
                  method: 'POST',
                  body: JSON.stringify({ quality: e.payload.quality }),
                });
                break;
              default:
                console.warn('Unknown action type', e.type);
            }
          }
        }
        function l({ children: e }) {
          return a.jsx(r.H, { children: e });
        }
        new n();
      },
      2278: (e, t, s) => {
        'use strict';
        s.d(t, { H: () => n, a: () => l });
        var a = s(3227),
          r = s(3677);
        let i = (0, r.createContext)(void 0),
          o = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        function n({ children: e }) {
          let [t, s] = (0, r.useState)({
              user: null,
              token: null,
              isLoading: !0,
              isAuthenticated: !1,
            }),
            n = async e => {
              try {
                let t = await fetch(`${o}/auth/me`, { headers: { Authorization: `Bearer ${e}` } });
                if (t.ok) {
                  let a = await t.json();
                  s({ user: a.data.user, token: e, isLoading: !1, isAuthenticated: !0 });
                } else await u();
              } catch (e) {
                (console.error('Failed to fetch user:', e), d());
              }
            },
            l = async (e, t) => {
              let a = await fetch(`${o}/auth/login`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: e, password: t }),
                }),
                r = await a.json();
              if (!a.ok) throw Error(r.error?.message || 'Login failed');
              let { accessToken: i, refreshToken: n, user: l } = r.data;
              (localStorage.setItem('accessToken', i),
                localStorage.setItem('refreshToken', n),
                s({ user: l, token: i, isLoading: !1, isAuthenticated: !0 }));
            },
            c = async (e, t, a) => {
              let r = await fetch(`${o}/auth/register`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: e, password: t, name: a }),
                }),
                i = await r.json();
              if (!r.ok) throw Error(i.error?.message || 'Registration failed');
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
            u = async () => {
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
          return a.jsx(i.Provider, {
            value: { ...t, login: l, register: c, logout: d, refreshToken: u },
            children: e,
          });
        }
        function l() {
          let e = (0, r.useContext)(i);
          if (void 0 === e) throw Error('useAuth must be used within an AuthProvider');
          return e;
        }
      },
      7674: (e, t, s) => {
        'use strict';
        s.d(t, { Lc: () => n, Nv: () => i, Sh: () => d, kx: () => c, sA: () => o, tF: () => l });
        let a = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        async function r() {
          return null;
        }
        async function i(e, t = {}) {
          let { method: s = 'GET', body: i, token: o } = t,
            n = o ?? (await r()),
            l = { 'Content-Type': 'application/json' };
          n && (l.Authorization = `Bearer ${n}`);
          let c = await fetch(`${a}${e}`, {
              method: s,
              headers: l,
              body: i ? JSON.stringify(i) : void 0,
            }),
            d = await c.json();
          if (!c.ok) throw Error(d.error?.message || 'Request failed');
          return d;
        }
        let o = {
            getDomains: () => i('/domains'),
            getDomain: e => i(`/domains/${e}`),
            getTasks: e => i(`/domains/${e}/tasks`),
            getStudyGuide: e => i(`/domains/tasks/${e}/study-guide`),
            markSectionComplete: e =>
              i(`/domains/progress/sections/${e}/complete`, { method: 'POST' }),
            getProgress: () => i('/domains/progress'),
          },
          n = {
            getFlashcards: e => {
              let t = new URLSearchParams();
              return (
                e?.domainId && t.set('domainId', e.domainId),
                e?.taskId && t.set('taskId', e.taskId),
                e?.limit && t.set('limit', String(e.limit)),
                i(`/flashcards?${t}`)
              );
            },
            getDueForReview: e => i(`/flashcards/review${e ? `?limit=${e}` : ''}`),
            getStats: () => i('/flashcards/stats'),
            startSession: e => i('/flashcards/sessions', { method: 'POST', body: e }),
            recordResponse: (e, t, s, a) =>
              i(`/flashcards/sessions/${e}/responses/${t}`, {
                method: 'POST',
                body: { rating: s, timeSpentMs: a },
              }),
            completeSession: e => i(`/flashcards/sessions/${e}/complete`, { method: 'POST' }),
            createCustom: e => i('/flashcards/custom', { method: 'POST', body: e }),
          },
          l = {
            startSession: e => i('/practice/sessions', { method: 'POST', body: e }),
            submitAnswer: (e, t, s, a) =>
              i(`/practice/sessions/${e}/answers/${t}`, {
                method: 'POST',
                body: { selectedOptionId: s, timeSpentMs: a },
              }),
            completeSession: e => i(`/practice/sessions/${e}/complete`, { method: 'POST' }),
            startMockExam: () => i('/practice/mock-exams', { method: 'POST' }),
            getFlagged: () => i('/practice/flagged'),
            flagQuestion: e => i(`/practice/questions/${e}/flag`, { method: 'POST' }),
            unflagQuestion: e => i(`/practice/questions/${e}/flag`, { method: 'DELETE' }),
            getStats: () => i('/practice/stats'),
          },
          c = {
            getDashboard: () => i('/dashboard'),
            getStreak: () => i('/dashboard/streak'),
            getProgress: () => i('/dashboard/progress'),
            getActivity: e => i(`/dashboard/activity${e ? `?limit=${e}` : ''}`),
            getReviews: e => i(`/dashboard/reviews${e ? `?limit=${e}` : ''}`),
            getWeakAreas: () => i('/dashboard/weak-areas'),
            getReadiness: () => i('/dashboard/readiness'),
            getRecommendations: () => i('/dashboard/recommendations'),
          },
          d = {
            getFormulas: e => i(`/formulas${e ? `?category=${e}` : ''}`),
            getFormula: e => i(`/formulas/${e}`),
            calculate: (e, t) =>
              i(`/formulas/${e}/calculate`, { method: 'POST', body: { inputs: t } }),
            getVariables: () => i('/formulas/variables'),
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
          i = s.n(r);
        s(5556);
        let o = (0, s(3189).createProxy)(
            String.raw`/Users/dustinober/Projects/pmp_application/packages/web/src/app/providers.tsx#Providers`
          ),
          n = {
            title: 'PMP Study Pro',
            description: 'Comprehensive study platform for the 2026 PMP certification exam',
            keywords: ['PMP', 'Project Management', 'Certification', 'Study', 'Exam Prep'],
            manifest: '/manifest.json',
            themeColor: '#7c3aed',
            viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
            appleWebApp: { capable: !0, statusBarStyle: 'default', title: 'PMP Pro' },
          };
        function l({ children: e }) {
          return a.jsx('html', {
            lang: 'en',
            children: a.jsx('body', {
              className: i().className,
              children: a.jsx(o, { children: e }),
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
