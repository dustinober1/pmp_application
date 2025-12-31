(() => {
  var e = {};
  ((e.id = 48),
    (e.ids = [48]),
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
      5323: (e, t, s) => {
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
          s(4934),
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
                    'reset-password',
                    {
                      children: [
                        '__PAGE__',
                        {},
                        {
                          page: [
                            () => Promise.resolve().then(s.bind(s, 4934)),
                            '/Users/dustinober/Projects/pmp_application/packages/web/src/app/auth/reset-password/page.tsx',
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
            '/Users/dustinober/Projects/pmp_application/packages/web/src/app/auth/reset-password/page.tsx',
          ],
          u = '/auth/reset-password/page',
          m = { require: s, loadChunk: () => Promise.resolve() },
          h = new r.AppPageRouteModule({
            definition: {
              kind: a.x.APP_PAGE,
              page: '/auth/reset-password/page',
              pathname: '/auth/reset-password',
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
        Promise.resolve().then(s.bind(s, 4076));
      },
      2160: (e, t, s) => {
        Promise.resolve().then(s.bind(s, 2218));
      },
      649: (e, t, s) => {
        'use strict';
        s.d(t, { default: () => a.a });
        var r = s(6568),
          a = s.n(r);
      },
      1043: (e, t, s) => {
        'use strict';
        var r = s(2854);
        (s.o(r, 'useParams') &&
          s.d(t, {
            useParams: function () {
              return r.useParams;
            },
          }),
          s.o(r, 'useRouter') &&
            s.d(t, {
              useRouter: function () {
                return r.useRouter;
              },
            }),
          s.o(r, 'useSearchParams') &&
            s.d(t, {
              useSearchParams: function () {
                return r.useSearchParams;
              },
            }));
      },
      2218: (e, t, s) => {
        'use strict';
        (s.r(t), s.d(t, { default: () => d }));
        var r = s(3227),
          a = s(3677),
          o = s(649),
          i = s(1043),
          n = s(7674);
        function l() {
          let e = (0, i.useRouter)(),
            t = (0, i.useSearchParams)().get('token'),
            [s, l] = (0, a.useState)(''),
            [d, c] = (0, a.useState)(''),
            [u, m] = (0, a.useState)('idle'),
            [h, p] = (0, a.useState)(''),
            g = async r => {
              if ((r.preventDefault(), !t)) {
                (p('Invalid or missing reset token.'), m('error'));
                return;
              }
              if (s !== d) {
                (p('Passwords do not match.'), m('error'));
                return;
              }
              if (s.length < 8) {
                (p('Password must be at least 8 characters long.'), m('error'));
                return;
              }
              (m('loading'), p(''));
              try {
                (await (0, n.Nv)('/auth/reset-password', {
                  method: 'POST',
                  body: { token: t, newPassword: s },
                }),
                  m('success'),
                  setTimeout(() => {
                    e.push('/login');
                  }, 3e3));
              } catch (e) {
                (console.error('Password reset failed', e),
                  m('error'),
                  p(e.message || 'Failed to reset password. The link may have expired.'));
              }
            };
          return t
            ? 'success' === u
              ? (0, r.jsxs)('div', {
                  className:
                    'max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl border border-gray-700 text-center',
                  children: [
                    r.jsx('div', { className: 'text-5xl mb-4', children: '✅' }),
                    r.jsx('h2', {
                      className: 'text-3xl font-extrabold text-white',
                      children: 'Password Reset!',
                    }),
                    r.jsx('p', {
                      className: 'mt-2 text-sm text-gray-400',
                      children:
                        'Your password has been successfully reset. Redirecting you to login...',
                    }),
                    r.jsx('div', {
                      className: 'mt-6',
                      children: r.jsx(o.default, {
                        href: '/login',
                        className: 'font-medium text-primary-400 hover:text-primary-300 transition',
                        children: 'Go to Login Now',
                      }),
                    }),
                  ],
                })
              : (0, r.jsxs)('div', {
                  className: 'max-w-md w-full space-y-8',
                  children: [
                    (0, r.jsxs)('div', {
                      children: [
                        r.jsx('h2', {
                          className: 'mt-6 text-center text-3xl font-extrabold text-white',
                          children: 'Set new password',
                        }),
                        r.jsx('p', {
                          className: 'mt-2 text-center text-sm text-gray-400',
                          children: 'Please enter your new password below.',
                        }),
                      ],
                    }),
                    (0, r.jsxs)('form', {
                      className: 'mt-8 space-y-6',
                      onSubmit: g,
                      children: [
                        (0, r.jsxs)('div', {
                          className: 'rounded-md shadow-sm space-y-4',
                          children: [
                            (0, r.jsxs)('div', {
                              children: [
                                r.jsx('label', {
                                  htmlFor: 'password',
                                  className: 'block text-sm font-medium text-gray-400 mb-1',
                                  children: 'New Password',
                                }),
                                r.jsx('input', {
                                  id: 'password',
                                  name: 'password',
                                  type: 'password',
                                  required: !0,
                                  value: s,
                                  onChange: e => l(e.target.value),
                                  className:
                                    'appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-colors',
                                  placeholder: '********',
                                }),
                              ],
                            }),
                            (0, r.jsxs)('div', {
                              children: [
                                r.jsx('label', {
                                  htmlFor: 'confirm-password',
                                  className: 'block text-sm font-medium text-gray-400 mb-1',
                                  children: 'Confirm Password',
                                }),
                                r.jsx('input', {
                                  id: 'confirm-password',
                                  name: 'confirm-password',
                                  type: 'password',
                                  required: !0,
                                  value: d,
                                  onChange: e => c(e.target.value),
                                  className:
                                    'appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-colors',
                                  placeholder: '********',
                                }),
                              ],
                            }),
                          ],
                        }),
                        'error' === u &&
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
                                    children: r.jsx('p', { children: h }),
                                  }),
                                ],
                              }),
                            }),
                          }),
                        r.jsx('div', {
                          children: r.jsx('button', {
                            type: 'submit',
                            disabled: 'loading' === u,
                            className: `group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${'loading' === u ? 'bg-primary-700 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-primary-500'} transition-colors shadow-lg hover:shadow-primary-900/20`,
                            children: 'loading' === u ? 'Resetting...' : 'Reset Password',
                          }),
                        }),
                      ],
                    }),
                  ],
                })
            : (0, r.jsxs)('div', {
                className:
                  'max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl border border-gray-700 text-center',
                children: [
                  r.jsx('div', { className: 'text-5xl mb-4', children: '⚠️' }),
                  r.jsx('h2', {
                    className: 'text-2xl font-bold text-white',
                    children: 'Invalid Link',
                  }),
                  r.jsx('p', {
                    className: 'mt-2 text-sm text-gray-400',
                    children:
                      'This password reset link is invalid or has expired. Please request a new one.',
                  }),
                  r.jsx('div', {
                    className: 'mt-6',
                    children: r.jsx(o.default, {
                      href: '/auth/forgot-password',
                      className: 'font-medium text-primary-400 hover:text-primary-300 transition',
                      children: 'Request New Link',
                    }),
                  }),
                ],
              });
        }
        function d() {
          return r.jsx('div', {
            className:
              'min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8',
            children: r.jsx(a.Suspense, {
              fallback: r.jsx('div', { className: 'text-white', children: 'Loading...' }),
              children: r.jsx(l, {}),
            }),
          });
        }
      },
      4076: (e, t, s) => {
        'use strict';
        s.d(t, { Providers: () => l });
        var r = s(3227),
          a = s(2278),
          o = s(7674);
        let i = 'pmp_offline_sync_queue';
        class n {
          constructor() {
            ((this.queue = []), (this.isSyncing = !1));
          }
          loadQueue() {
            let e = localStorage.getItem(i);
            e && (this.queue = JSON.parse(e));
          }
          saveQueue() {
            localStorage.setItem(i, JSON.stringify(this.queue));
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
                await (0, o.Nv)(`/study/sections/${e.payload.sectionId}/complete`, {
                  method: 'POST',
                });
                break;
              case 'SUBMIT_FLASHCARD_RESULT':
                await (0, o.Nv)(`/flashcards/${e.payload.flashcardId}/review`, {
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
          return r.jsx(a.H, { children: e });
        }
        new n();
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
                } else await u();
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
          return r.jsx(o.Provider, {
            value: { ...t, login: l, register: d, logout: c, refreshToken: u },
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
      4934: (e, t, s) => {
        'use strict';
        (s.r(t), s.d(t, { default: () => r }));
        let r = (0, s(3189).createProxy)(
          String.raw`/Users/dustinober/Projects/pmp_application/packages/web/src/app/auth/reset-password/page.tsx#default`
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
            manifest: '/manifest.json',
            themeColor: '#7c3aed',
            viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
            appleWebApp: { capable: !0, statusBarStyle: 'default', title: 'PMP Pro' },
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
    r = t.X(0, [136, 568], () => s(5323));
  module.exports = r;
})();
