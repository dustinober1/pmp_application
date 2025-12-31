(() => {
  var e = {};
  ((e.id = 899),
    (e.ids = [899]),
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
      5946: (e, t, s) => {
        'use strict';
        (s.r(t),
          s.d(t, {
            GlobalError: () => i.a,
            __next_app__: () => m,
            originalPathname: () => u,
            pages: () => c,
            routeModule: () => h,
            tree: () => l,
          }),
          s(3060),
          s(4773),
          s(7824));
        var r = s(3282),
          a = s(5736),
          o = s(3906),
          i = s.n(o),
          n = s(6880),
          d = {};
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
            ].indexOf(e) && (d[e] = () => n[e]);
        s.d(t, d);
        let l = [
            '',
            {
              children: [
                'practice',
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
                                () => Promise.resolve().then(s.bind(s, 3060)),
                                '/Users/dustinober/Projects/pmp_application/packages/web/src/app/practice/session/[sessionId]/page.tsx',
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
            '/Users/dustinober/Projects/pmp_application/packages/web/src/app/practice/session/[sessionId]/page.tsx',
          ],
          u = '/practice/session/[sessionId]/page',
          m = { require: s, loadChunk: () => Promise.resolve() },
          h = new r.AppPageRouteModule({
            definition: {
              kind: a.x.APP_PAGE,
              page: '/practice/session/[sessionId]/page',
              pathname: '/practice/session/[sessionId]',
              bundlePath: '',
              filename: '',
              appPaths: [],
            },
            userland: { loaderTree: l },
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
      7480: (e, t, s) => {
        Promise.resolve().then(s.bind(s, 4767));
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
      4767: (e, t, s) => {
        'use strict';
        (s.r(t), s.d(t, { default: () => d }));
        var r = s(3227),
          a = s(3677),
          o = s(1043),
          i = s(2278),
          n = s(7674);
        function d() {
          let { sessionId: e } = (0, o.useParams)(),
            t = (0, o.useRouter)(),
            { user: s } = (0, i.a)(),
            [d, l] = (0, a.useState)(!0),
            [c, u] = (0, a.useState)(null),
            [m, h] = (0, a.useState)(0),
            [p, g] = (0, a.useState)(null),
            [x, b] = (0, a.useState)(!1),
            [f, y] = (0, a.useState)(null),
            [v, w] = (0, a.useState)(!1),
            [P, j] = (0, a.useState)(Date.now()),
            S = (0, a.useRef)(null),
            k = async () => {
              if (!c || !e || !p) return;
              let t = c.questions[m];
              if (!t) return;
              let s = Date.now() - P;
              b(!0);
              try {
                let r = await (0, n.Nv)(`/practice/sessions/${e}/answers/${t.id}`, {
                  method: 'POST',
                  body: { selectedOptionId: p, timeSpentMs: s },
                });
                (r.data && y(r.data.result),
                  u(e => {
                    if (!e) return null;
                    let t = [...e.questions],
                      s = t[m];
                    return (
                      (t[m] = { ...s, userAnswerId: p }),
                      {
                        ...e,
                        questions: t,
                        progress: { ...e.progress, answered: e.progress.answered + 1 },
                      }
                    );
                  }));
              } catch (e) {
                console.error('Failed to submit answer', e);
              } finally {
                b(!1);
              }
            },
            N = async () => {
              c && (m < c.questions.length - 1 ? h(e => e + 1) : await T());
            },
            T = async () => {
              if (e)
                try {
                  (await (0, n.Nv)(`/practice/sessions/${e}/complete`, { method: 'POST' }), w(!0));
                } catch (e) {
                  console.error('Failed to complete session', e);
                }
            };
          if (d)
            return r.jsx('div', {
              className: 'flex justify-center items-center min-h-[60vh]',
              children: r.jsx('div', {
                className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600',
              }),
            });
          if (!c)
            return (0, r.jsxs)('div', {
              className:
                'max-w-4xl mx-auto px-4 py-8 text-center bg-gray-900 border border-gray-800 rounded-lg',
              children: [
                r.jsx('h1', {
                  className: 'text-2xl font-bold text-white mb-2',
                  children: 'Session Not Found',
                }),
                r.jsx('button', {
                  onClick: () => t.push('/practice'),
                  className:
                    'px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition',
                  children: 'Back to Practice',
                }),
              ],
            });
          if (v)
            return r.jsx('div', {
              className: 'max-w-2xl mx-auto px-4 py-16 text-center',
              children: (0, r.jsxs)('div', {
                className: 'bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl',
                children: [
                  r.jsx('div', { className: 'text-6xl mb-4', children: '\uD83C\uDFC6' }),
                  r.jsx('h1', {
                    className: 'text-3xl font-bold text-white mb-4',
                    children: 'Practice Complete!',
                  }),
                  (0, r.jsxs)('p', {
                    className: 'text-gray-400 mb-8',
                    children: [
                      "You've completed ",
                      c.questions.length,
                      ' questions. Check the dashboard for detailed analytics.',
                    ],
                  }),
                  (0, r.jsxs)('div', {
                    className: 'flex justify-center space-x-4',
                    children: [
                      r.jsx('button', {
                        onClick: () => t.push('/practice'),
                        className:
                          'px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition',
                        children: 'Back to Overview',
                      }),
                      r.jsx('button', {
                        onClick: () => t.push('/dashboard'),
                        className:
                          'px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition',
                        children: 'Go to Dashboard',
                      }),
                    ],
                  }),
                ],
              }),
            });
          let $ = c.questions[m],
            C = c.questions.length > 0 ? Math.round((m / c.questions.length) * 100) : 0;
          return (0, r.jsxs)('div', {
            className: 'max-w-5xl mx-auto px-4 py-6 md:py-8 h-[calc(100vh-64px)] flex flex-col',
            children: [
              (0, r.jsxs)('div', {
                className: 'mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4',
                children: [
                  (0, r.jsxs)('div', {
                    className: 'flex items-center space-x-4',
                    children: [
                      r.jsx('button', {
                        onClick: () => t.push('/practice'),
                        className: 'text-gray-400 hover:text-white transition',
                        children: '← Exit',
                      }),
                      (0, r.jsxs)('div', {
                        className: 'px-3 py-1 bg-gray-800 rounded text-xs text-gray-400 font-mono',
                        children: ['Q', m + 1, '/', c.questions.length],
                      }),
                      $.difficulty &&
                        r.jsx('span', {
                          className: `px-2 py-0.5 rounded text-xs font-medium uppercase border ${'easy' === $.difficulty ? 'border-green-800 text-green-400 bg-green-900/20' : 'medium' === $.difficulty ? 'border-yellow-800 text-yellow-400 bg-yellow-900/20' : 'border-red-800 text-red-400 bg-red-900/20'}`,
                          children: $.difficulty,
                        }),
                    ],
                  }),
                  r.jsx('div', {
                    className: 'flex-1 max-w-md mx-auto w-full',
                    children: r.jsx('div', {
                      className: 'h-2 bg-gray-800 rounded-full overflow-hidden',
                      children: r.jsx('div', {
                        className: 'h-full bg-primary-600 transition-all duration-300',
                        style: { width: `${C}%` },
                      }),
                    }),
                  }),
                  r.jsx('div', { className: 'w-20 hidden md:block' }),
                ],
              }),
              (0, r.jsxs)('div', {
                ref: S,
                className: 'flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar',
                children: [
                  (0, r.jsxs)('div', {
                    className: 'bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8 mb-6',
                    children: [
                      r.jsx('h2', {
                        className:
                          'text-xl md:text-2xl text-white font-medium mb-8 leading-relaxed',
                        children: $.questionText,
                      }),
                      r.jsx('div', {
                        className: 'space-y-3',
                        children: $.options.map(e => {
                          let t = p === e.id,
                            s = f?.correctOptionId === e.id,
                            a = f && t && !f.isCorrect,
                            o =
                              'w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-start group relative';
                          return (
                            f
                              ? s
                                ? (o += ' bg-green-900/30 border-green-500/50')
                                : a
                                  ? (o += ' bg-red-900/30 border-red-500/50')
                                  : (o += ' border-gray-800 opacity-60')
                              : t
                                ? (o += ' bg-primary-900/20 border-primary-500')
                                : (o +=
                                    ' bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800'),
                            (0, r.jsxs)(
                              'button',
                              {
                                onClick: () => !f && g(e.id),
                                disabled: !!f || x,
                                className: o,
                                children: [
                                  r.jsx('div', {
                                    className: `mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center mr-4 flex-shrink-0 transition-colors ${f ? (s ? 'border-green-500 bg-green-500' : a ? 'border-red-500 bg-red-500' : 'border-gray-600') : t ? 'border-primary-500 bg-primary-500' : 'border-gray-500 group-hover:border-gray-400'}`,
                                    children:
                                      (f && (s || a)) || t
                                        ? r.jsx('div', {
                                            className: 'w-2 h-2 bg-white rounded-full',
                                          })
                                        : null,
                                  }),
                                  r.jsx('span', {
                                    className: `text-base ${f && (s || a) ? 'text-white' : 'text-gray-300'}`,
                                    children: e.text,
                                  }),
                                ],
                              },
                              e.id
                            )
                          );
                        }),
                      }),
                    ],
                  }),
                  f &&
                    (0, r.jsxs)('div', {
                      className: `rounded-xl p-6 mb-6 border animate-in fade-in slide-in-from-bottom-4 duration-300 ${f.isCorrect ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'}`,
                      children: [
                        r.jsx('div', {
                          className: 'flex items-center mb-3',
                          children: r.jsx('span', {
                            className: `text-2xl mr-3 ${f.isCorrect ? 'text-green-400' : 'text-red-400'}`,
                            children: f.isCorrect ? '✓ Correct' : '✗ Incorrect',
                          }),
                        }),
                        (0, r.jsxs)('div', {
                          className: 'text-gray-300 leading-relaxed',
                          children: [
                            r.jsx('span', {
                              className: 'font-semibold text-white block mb-1',
                              children: 'Explanation:',
                            }),
                            f.explanation,
                          ],
                        }),
                      ],
                    }),
                ],
              }),
              r.jsx('div', {
                className: 'pt-4 border-t border-gray-800 flex justify-end',
                children: f
                  ? (0, r.jsxs)('button', {
                      onClick: N,
                      className:
                        'px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all shadow-lg hover:shadow-primary-900/20 flex items-center',
                      children: [
                        m === c.questions.length - 1 ? 'Finish Session' : 'Next Question',
                        r.jsx('span', { className: 'ml-2', children: '→' }),
                      ],
                    })
                  : r.jsx('button', {
                      onClick: k,
                      disabled: !p || x,
                      className: `px-8 py-3 rounded-lg font-medium transition-all transform active:scale-95 ${!p || x ? 'bg-gray-800 text-gray-500 cursor-not-allowed hidden' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-primary-900/20'}`,
                      children: x ? 'Submitting...' : 'Submit Answer',
                    }),
              }),
            ],
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
        s.d(t, { H: () => n, a: () => d });
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
            d = async (e, t) => {
              let r = await fetch(`${i}/auth/login`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: e, password: t }),
                }),
                a = await r.json();
              if (!r.ok) throw Error(a.error?.message || 'Login failed');
              let { accessToken: o, refreshToken: n, user: d } = a.data;
              (localStorage.setItem('accessToken', o),
                localStorage.setItem('refreshToken', n),
                s({ user: d, token: o, isLoading: !1, isAuthenticated: !0 }));
            },
            l = async (e, t, r) => {
              let a = await fetch(`${i}/auth/register`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: e, password: t, name: r }),
                }),
                o = await a.json();
              if (!a.ok) throw Error(o.error?.message || 'Registration failed');
              let { accessToken: n, refreshToken: d, user: l } = o.data;
              (localStorage.setItem('accessToken', n),
                localStorage.setItem('refreshToken', d),
                s({ user: l, token: n, isLoading: !1, isAuthenticated: !0 }));
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
            value: { ...t, login: d, register: l, logout: c, refreshToken: u },
            children: e,
          });
        }
        function d() {
          let e = (0, a.useContext)(o);
          if (void 0 === e) throw Error('useAuth must be used within an AuthProvider');
          return e;
        }
      },
      7674: (e, t, s) => {
        'use strict';
        s.d(t, { Lc: () => n, Nv: () => o, Sh: () => c, kx: () => l, sA: () => i, tF: () => d });
        let r = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        async function a() {
          return null;
        }
        async function o(e, t = {}) {
          let { method: s = 'GET', body: o, token: i } = t,
            n = i ?? (await a()),
            d = { 'Content-Type': 'application/json' };
          n && (d.Authorization = `Bearer ${n}`);
          let l = await fetch(`${r}${e}`, {
              method: s,
              headers: d,
              body: o ? JSON.stringify(o) : void 0,
            }),
            c = await l.json();
          if (!l.ok) throw Error(c.error?.message || 'Request failed');
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
          d = {
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
          l = {
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
      4773: (e, t, s) => {
        'use strict';
        (s.r(t), s.d(t, { default: () => d, metadata: () => n }));
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
        function d({ children: e }) {
          return r.jsx('html', {
            lang: 'en',
            children: r.jsx('body', {
              className: o().className,
              children: r.jsx(i, { children: e }),
            }),
          });
        }
      },
      3060: (e, t, s) => {
        'use strict';
        (s.r(t), s.d(t, { default: () => r }));
        let r = (0, s(3189).createProxy)(
          String.raw`/Users/dustinober/Projects/pmp_application/packages/web/src/app/practice/session/[sessionId]/page.tsx#default`
        );
      },
      5556: () => {},
    }));
  var t = require('../../../../webpack-runtime.js');
  t.C(e);
  var s = e => t((t.s = e)),
    r = t.X(0, [136], () => s(5946));
  module.exports = r;
})();
