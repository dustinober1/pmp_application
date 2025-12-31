(() => {
  var e = {};
  ((e.id = 849),
    (e.ids = [849]),
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
      8389: (e, s, t) => {
        'use strict';
        (t.r(s),
          t.d(s, {
            GlobalError: () => i.a,
            __next_app__: () => u,
            originalPathname: () => h,
            pages: () => c,
            routeModule: () => m,
            tree: () => d,
          }),
          t(2413),
          t(4773),
          t(7824));
        var a = t(3282),
          r = t(5736),
          o = t(3906),
          i = t.n(o),
          n = t(6880),
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
        t.d(s, l);
        let d = [
            '',
            {
              children: [
                'flashcards',
                {
                  children: [
                    'session',
                    {
                      children: [
                        '[sessionId]',
                        {
                          children: [
                            '__PAGE__',
                            {},
                            {
                              page: [
                                () => Promise.resolve().then(t.bind(t, 2413)),
                                '/Users/dustinober/Projects/pmp_application/packages/web/src/app/flashcards/session/[sessionId]/page.tsx',
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
                {},
              ],
            },
            {
              layout: [
                () => Promise.resolve().then(t.bind(t, 4773)),
                '/Users/dustinober/Projects/pmp_application/packages/web/src/app/layout.tsx',
              ],
              'not-found': [
                () => Promise.resolve().then(t.t.bind(t, 7824, 23)),
                'next/dist/client/components/not-found-error',
              ],
            },
          ],
          c = [
            '/Users/dustinober/Projects/pmp_application/packages/web/src/app/flashcards/session/[sessionId]/page.tsx',
          ],
          h = '/flashcards/session/[sessionId]/page',
          u = { require: t, loadChunk: () => Promise.resolve() },
          m = new a.AppPageRouteModule({
            definition: {
              kind: r.x.APP_PAGE,
              page: '/flashcards/session/[sessionId]/page',
              pathname: '/flashcards/session/[sessionId]',
              bundlePath: '',
              filename: '',
              appPaths: [],
            },
            userland: { loaderTree: d },
          });
      },
      9674: (e, s, t) => {
        (Promise.resolve().then(t.t.bind(t, 4424, 23)),
          Promise.resolve().then(t.t.bind(t, 7752, 23)),
          Promise.resolve().then(t.t.bind(t, 5275, 23)),
          Promise.resolve().then(t.t.bind(t, 9842, 23)),
          Promise.resolve().then(t.t.bind(t, 1633, 23)),
          Promise.resolve().then(t.t.bind(t, 9224, 23)));
      },
      5653: (e, s, t) => {
        Promise.resolve().then(t.bind(t, 4076));
      },
      2677: (e, s, t) => {
        Promise.resolve().then(t.bind(t, 5716));
      },
      1043: (e, s, t) => {
        'use strict';
        var a = t(2854);
        (t.o(a, 'useParams') &&
          t.d(s, {
            useParams: function () {
              return a.useParams;
            },
          }),
          t.o(a, 'useRouter') &&
            t.d(s, {
              useRouter: function () {
                return a.useRouter;
              },
            }),
          t.o(a, 'useSearchParams') &&
            t.d(s, {
              useSearchParams: function () {
                return a.useSearchParams;
              },
            }));
      },
      5716: (e, s, t) => {
        'use strict';
        (t.r(s), t.d(s, { default: () => l }));
        var a = t(3227),
          r = t(3677),
          o = t(1043),
          i = t(2278),
          n = t(7674);
        function l() {
          let { sessionId: e } = (0, o.useParams)(),
            s = (0, o.useRouter)(),
            { user: t } = (0, i.a)(),
            [l, d] = (0, r.useState)(!0),
            [c, h] = (0, r.useState)(null),
            [u, m] = (0, r.useState)(0),
            [p, x] = (0, r.useState)(!1),
            [g, f] = (0, r.useState)(!1),
            [y, b] = (0, r.useState)(Date.now()),
            v = () => {
              x(!p);
            },
            w = async s => {
              if (!c || !e) return;
              let t = c.cards[u];
              if (!t) return;
              let a = Date.now() - y;
              try {
                (await (0, n.Nv)(`/flashcards/sessions/${e}/responses/${t.id}`, {
                  method: 'POST',
                  body: { rating: s, timeSpentMs: a },
                }),
                  u < c.cards.length - 1 ? (x(!1), m(e => e + 1), b(Date.now())) : await j());
              } catch (e) {
                console.error('Failed to record response', e);
              }
            },
            j = async () => {
              try {
                (await (0, n.Nv)(`/flashcards/sessions/${e}/complete`, { method: 'POST' }), f(!0));
              } catch (e) {
                console.error('Failed to complete session', e);
              }
            };
          if (l)
            return a.jsx('div', {
              className: 'flex justify-center items-center min-h-[60vh]',
              children: a.jsx('div', {
                className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600',
              }),
            });
          if (!c)
            return (0, a.jsxs)('div', {
              className:
                'max-w-4xl mx-auto px-4 py-8 text-center bg-gray-900 border border-gray-800 rounded-lg',
              children: [
                a.jsx('h1', {
                  className: 'text-2xl font-bold text-white mb-2',
                  children: 'Session Not Found',
                }),
                a.jsx('button', {
                  onClick: () => s.push('/flashcards'),
                  className:
                    'px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition',
                  children: 'Back to Flashcards',
                }),
              ],
            });
          if (g)
            return a.jsx('div', {
              className: 'max-w-2xl mx-auto px-4 py-16 text-center',
              children: (0, a.jsxs)('div', {
                className: 'bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl',
                children: [
                  a.jsx('div', { className: 'text-6xl mb-4', children: '\uD83C\uDF89' }),
                  a.jsx('h1', {
                    className: 'text-3xl font-bold text-white mb-4',
                    children: 'Session Complete!',
                  }),
                  (0, a.jsxs)('p', {
                    className: 'text-gray-400 mb-8',
                    children: ["Great job! You've reviewed ", c.cards.length, ' cards.'],
                  }),
                  (0, a.jsxs)('div', {
                    className: 'flex justify-center space-x-4',
                    children: [
                      a.jsx('button', {
                        onClick: () => s.push('/flashcards'),
                        className:
                          'px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition',
                        children: 'Back to Overview',
                      }),
                      a.jsx('button', {
                        onClick: () => s.push('/dashboard'),
                        className:
                          'px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition',
                        children: 'Go to Dashboard',
                      }),
                    ],
                  }),
                ],
              }),
            });
          let S = c.cards[u],
            P = c.cards.length > 0 ? Math.round((u / c.cards.length) * 100) : 0;
          return S
            ? (0, a.jsxs)('div', {
                className: 'max-w-4xl mx-auto px-4 py-8 min-h-[80vh] flex flex-col',
                children: [
                  (0, a.jsxs)('div', {
                    className: 'mb-8 flex items-center justify-between',
                    children: [
                      a.jsx('button', {
                        onClick: () => s.push('/flashcards'),
                        className: 'text-gray-400 hover:text-white transition',
                        children: '← Exit',
                      }),
                      (0, a.jsxs)('div', {
                        className: 'flex-1 mx-8',
                        children: [
                          (0, a.jsxs)('div', {
                            className: 'flex justify-between text-xs text-gray-400 mb-1',
                            children: [
                              (0, a.jsxs)('span', {
                                children: ['Card ', u + 1, ' of ', c.cards.length],
                              }),
                              (0, a.jsxs)('span', { children: [Math.round(P), '%'] }),
                            ],
                          }),
                          a.jsx('div', {
                            className: 'h-2 bg-gray-800 rounded-full overflow-hidden',
                            children: a.jsx('div', {
                              className: 'h-full bg-primary-500 transition-all duration-300',
                              style: { width: `${P}%` },
                            }),
                          }),
                        ],
                      }),
                      a.jsx('div', { className: 'w-10' }),
                      ' ',
                    ],
                  }),
                  a.jsx('div', {
                    className: 'flex-1 flex flex-col items-center justify-center mb-8',
                    children: a.jsx('div', {
                      className:
                        'w-full max-w-2xl aspect-[3/2] perspective-1000 cursor-pointer group',
                      onClick: v,
                      children: (0, a.jsxs)('div', {
                        className: `relative w-full h-full duration-500 transform-style-3d transition-transform ${p ? 'rotate-y-180' : ''}`,
                        children: [
                          (0, a.jsxs)('div', {
                            className:
                              'absolute w-full h-full backface-hidden bg-gray-800 border-2 border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg group-hover:border-primary-500/50 transition-colors',
                            children: [
                              a.jsx('span', {
                                className: 'text-gray-500 text-sm uppercase tracking-wider mb-4',
                                children: 'Question',
                              }),
                              a.jsx('h2', {
                                className: 'text-2xl md:text-3xl font-medium text-white',
                                children: S.front,
                              }),
                              a.jsx('div', {
                                className: 'absolute bottom-4 text-gray-500 text-xs',
                                children: 'Click to flip',
                              }),
                            ],
                          }),
                          (0, a.jsxs)('div', {
                            className:
                              'absolute w-full h-full backface-hidden bg-gray-800 border-2 border-primary-900 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg rotate-y-180',
                            children: [
                              a.jsx('span', {
                                className: 'text-primary-400 text-sm uppercase tracking-wider mb-4',
                                children: 'Answer',
                              }),
                              a.jsx('p', {
                                className: 'text-xl md:text-2xl text-gray-100 leading-relaxed',
                                children: S.back,
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  }),
                  a.jsx('div', {
                    className: 'h-24',
                    children: p
                      ? (0, a.jsxs)('div', {
                          className: 'grid grid-cols-3 gap-4 max-w-2xl mx-auto w-full',
                          children: [
                            (0, a.jsxs)('button', {
                              onClick: () => w('dont_know'),
                              className:
                                'py-4 bg-red-900/30 border border-red-800 text-red-200 rounded-xl hover:bg-red-900/50 transition',
                              children: [
                                a.jsx('div', { className: 'font-bold mb-1', children: 'Again' }),
                                a.jsx('div', {
                                  className: 'text-xs opacity-70',
                                  children: '< 1 min',
                                }),
                              ],
                            }),
                            (0, a.jsxs)('button', {
                              onClick: () => w('learning'),
                              className:
                                'py-4 bg-yellow-900/30 border border-yellow-800 text-yellow-200 rounded-xl hover:bg-yellow-900/50 transition',
                              children: [
                                a.jsx('div', { className: 'font-bold mb-1', children: 'Hard' }),
                                a.jsx('div', {
                                  className: 'text-xs opacity-70',
                                  children: '2 days',
                                }),
                              ],
                            }),
                            (0, a.jsxs)('button', {
                              onClick: () => w('know_it'),
                              className:
                                'py-4 bg-green-900/30 border border-green-800 text-green-200 rounded-xl hover:bg-green-900/50 transition',
                              children: [
                                a.jsx('div', { className: 'font-bold mb-1', children: 'Easy' }),
                                a.jsx('div', {
                                  className: 'text-xs opacity-70',
                                  children: '4 days',
                                }),
                              ],
                            }),
                          ],
                        })
                      : a.jsx('div', {
                          className: 'flex justify-center',
                          children: a.jsx('button', {
                            onClick: v,
                            className:
                              'px-8 py-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition shadow-lg font-medium',
                            children: 'Show Answer',
                          }),
                        }),
                  }),
                ],
              })
            : a.jsx('div', { children: 'Loading card...' });
        }
      },
      4076: (e, s, t) => {
        'use strict';
        t.d(s, { Providers: () => l });
        var a = t(3227),
          r = t(2278),
          o = t(7674);
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
          async queueAction(e, s) {
            let t = { id: crypto.randomUUID(), type: e, payload: s, timestamp: Date.now() };
            (this.queue.push(t), this.saveQueue(), navigator.onLine && (await this.sync()));
          }
          async sync() {
            if (this.isSyncing || 0 === this.queue.length || !navigator.onLine) return;
            this.isSyncing = !0;
            let e = [],
              s = [...this.queue];
            for (let t of (console.log(`[Sync] Processing ${s.length} actions...`), s))
              try {
                await this.processAction(t);
              } catch (s) {
                (console.error(`[Sync] Failed to process action ${t.id}`, s), e.push(t));
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
          return a.jsx(r.H, { children: e });
        }
        new n();
      },
      2278: (e, s, t) => {
        'use strict';
        t.d(s, { H: () => n, a: () => l });
        var a = t(3227),
          r = t(3677);
        let o = (0, r.createContext)(void 0),
          i = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        function n({ children: e }) {
          let [s, t] = (0, r.useState)({
              user: null,
              token: null,
              isLoading: !0,
              isAuthenticated: !1,
            }),
            n = async e => {
              try {
                let s = await fetch(`${i}/auth/me`, { headers: { Authorization: `Bearer ${e}` } });
                if (s.ok) {
                  let a = await s.json();
                  t({ user: a.data.user, token: e, isLoading: !1, isAuthenticated: !0 });
                } else await h();
              } catch (e) {
                (console.error('Failed to fetch user:', e), c());
              }
            },
            l = async (e, s) => {
              let a = await fetch(`${i}/auth/login`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: e, password: s }),
                }),
                r = await a.json();
              if (!a.ok) throw Error(r.error?.message || 'Login failed');
              let { accessToken: o, refreshToken: n, user: l } = r.data;
              (localStorage.setItem('accessToken', o),
                localStorage.setItem('refreshToken', n),
                t({ user: l, token: o, isLoading: !1, isAuthenticated: !0 }));
            },
            d = async (e, s, a) => {
              let r = await fetch(`${i}/auth/register`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: e, password: s, name: a }),
                }),
                o = await r.json();
              if (!r.ok) throw Error(o.error?.message || 'Registration failed');
              let { accessToken: n, refreshToken: l, user: d } = o.data;
              (localStorage.setItem('accessToken', n),
                localStorage.setItem('refreshToken', l),
                t({ user: d, token: n, isLoading: !1, isAuthenticated: !0 }));
            },
            c = () => {
              (localStorage.removeItem('accessToken'),
                localStorage.removeItem('refreshToken'),
                t({ user: null, token: null, isLoading: !1, isAuthenticated: !1 }));
            },
            h = async () => {
              let e = localStorage.getItem('refreshToken');
              if (!e) {
                c();
                return;
              }
              try {
                let s = await fetch(`${i}/auth/refresh`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ refreshToken: e }),
                });
                if (s.ok) {
                  let { accessToken: e, refreshToken: t } = (await s.json()).data;
                  (localStorage.setItem('accessToken', e),
                    localStorage.setItem('refreshToken', t),
                    await n(e));
                } else c();
              } catch (e) {
                (console.error('Token refresh failed:', e), c());
              }
            };
          return a.jsx(o.Provider, {
            value: { ...s, login: l, register: d, logout: c, refreshToken: h },
            children: e,
          });
        }
        function l() {
          let e = (0, r.useContext)(o);
          if (void 0 === e) throw Error('useAuth must be used within an AuthProvider');
          return e;
        }
      },
      7674: (e, s, t) => {
        'use strict';
        t.d(s, { Lc: () => n, Nv: () => o, Sh: () => c, kx: () => d, sA: () => i, tF: () => l });
        let a = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        async function r() {
          return null;
        }
        async function o(e, s = {}) {
          let { method: t = 'GET', body: o, token: i } = s,
            n = i ?? (await r()),
            l = { 'Content-Type': 'application/json' };
          n && (l.Authorization = `Bearer ${n}`);
          let d = await fetch(`${a}${e}`, {
              method: t,
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
              let s = new URLSearchParams();
              return (
                e?.domainId && s.set('domainId', e.domainId),
                e?.taskId && s.set('taskId', e.taskId),
                e?.limit && s.set('limit', String(e.limit)),
                o(`/flashcards?${s}`)
              );
            },
            getDueForReview: e => o(`/flashcards/review${e ? `?limit=${e}` : ''}`),
            getStats: () => o('/flashcards/stats'),
            startSession: e => o('/flashcards/sessions', { method: 'POST', body: e }),
            recordResponse: (e, s, t, a) =>
              o(`/flashcards/sessions/${e}/responses/${s}`, {
                method: 'POST',
                body: { rating: t, timeSpentMs: a },
              }),
            completeSession: e => o(`/flashcards/sessions/${e}/complete`, { method: 'POST' }),
            createCustom: e => o('/flashcards/custom', { method: 'POST', body: e }),
          },
          l = {
            startSession: e => o('/practice/sessions', { method: 'POST', body: e }),
            submitAnswer: (e, s, t, a) =>
              o(`/practice/sessions/${e}/answers/${s}`, {
                method: 'POST',
                body: { selectedOptionId: t, timeSpentMs: a },
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
            calculate: (e, s) =>
              o(`/formulas/${e}/calculate`, { method: 'POST', body: { inputs: s } }),
            getVariables: () => o('/formulas/variables'),
          };
      },
      2413: (e, s, t) => {
        'use strict';
        (t.r(s), t.d(s, { default: () => a }));
        let a = (0, t(3189).createProxy)(
          String.raw`/Users/dustinober/Projects/pmp_application/packages/web/src/app/flashcards/session/[sessionId]/page.tsx#default`
        );
      },
      4773: (e, s, t) => {
        'use strict';
        (t.r(s), t.d(s, { default: () => l, metadata: () => n }));
        var a = t(9013),
          r = t(5900),
          o = t.n(r);
        t(5556);
        let i = (0, t(3189).createProxy)(
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
              className: o().className,
              children: a.jsx(i, { children: e }),
            }),
          });
        }
      },
      5556: () => {},
    }));
  var s = require('../../../../webpack-runtime.js');
  s.C(e);
  var t = e => s((s.s = e)),
    a = s.X(0, [136], () => t(8389));
  module.exports = a;
})();
