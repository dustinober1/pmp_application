(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [752],
  {
    5880: function (e, t, s) {
      Promise.resolve().then(s.bind(s, 7942));
    },
    7942: function (e, t, s) {
      'use strict';
      (s.r(t),
        s.d(t, {
          default: function () {
            return l;
          },
        }));
      var a = s(7573),
        r = s(7653),
        o = s(1695),
        n = s(7070),
        i = s(5118),
        c = s(1109);
      function l() {
        let { taskId: e } = (0, o.useParams)(),
          t = (0, o.useRouter)(),
          { user: s } = (0, n.a)(),
          [l, d] = (0, r.useState)(!0),
          [h, m] = (0, r.useState)(null),
          [u, x] = (0, r.useState)(null),
          [g, f] = (0, r.useState)('');
        return ((0, r.useEffect)(() => {
          async function t() {
            if (e)
              try {
                var t;
                d(!0);
                let s = await (0, i.Nv)('/domains/tasks'),
                  a =
                    null === (t = s.data) || void 0 === t ? void 0 : t.tasks.find(t => t.id === e);
                a && m(a);
                try {
                  let t = await (0, i.Nv)('/domains/tasks/'.concat(e, '/study-guide'));
                  if (t.data && (x(t.data.studyGuide), t.data.studyGuide.sections.length > 0)) {
                    let e = t.data.studyGuide.sections[0];
                    e && f(e.id);
                  }
                } catch (e) {
                  console.warn('Study guide not found', e);
                }
              } catch (e) {
                console.error('Failed to fetch data', e);
              } finally {
                d(!1);
              }
          }
          s && t();
        }, [e, s]),
        l)
          ? (0, a.jsx)('div', {
              className: 'flex justify-center items-center min-h-[60vh]',
              children: (0, a.jsx)('div', {
                className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600',
              }),
            })
          : h
            ? (0, a.jsxs)('div', {
                className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
                children: [
                  (0, a.jsxs)('div', {
                    className: 'mb-8',
                    children: [
                      (0, a.jsxs)('div', {
                        className: 'flex items-center space-x-2 text-sm text-gray-400 mb-2',
                        children: [
                          (0, a.jsx)('button', {
                            onClick: () => t.push('/study'),
                            className: 'hover:text-white transition',
                            children: 'Study Guide',
                          }),
                          (0, a.jsx)('span', { children: '/' }),
                          (0, a.jsxs)('span', {
                            className: 'text-white',
                            children: ['Task ', h.code],
                          }),
                        ],
                      }),
                      (0, a.jsx)('h1', {
                        className: 'text-3xl font-bold text-white mb-2',
                        children: h.name,
                      }),
                      (0, a.jsx)('p', {
                        className: 'text-xl text-gray-400',
                        children: h.description,
                      }),
                    ],
                  }),
                  (0, a.jsxs)('div', {
                    className: 'flex flex-col lg:flex-row gap-8',
                    children: [
                      (0, a.jsx)('aside', {
                        className: 'lg:w-64 flex-shrink-0',
                        children: (0, a.jsxs)('div', {
                          className:
                            'sticky top-24 bg-gray-900 border border-gray-800 rounded-xl p-4',
                          children: [
                            (0, a.jsx)('h3', {
                              className:
                                'text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4',
                              children: 'Contents',
                            }),
                            (0, a.jsx)('nav', {
                              className: 'space-y-1',
                              children:
                                u && 0 !== u.sections.length
                                  ? u.sections.map(e =>
                                      (0, a.jsx)(
                                        'button',
                                        {
                                          onClick: () => {
                                            var t;
                                            (f(e.id),
                                              null === (t = document.getElementById(e.id)) ||
                                                void 0 === t ||
                                                t.scrollIntoView({ behavior: 'smooth' }));
                                          },
                                          className:
                                            'w-full text-left px-3 py-2 text-sm rounded-md transition-colors '.concat(
                                              g === e.id
                                                ? 'bg-primary-900/30 text-primary-400 border-l-2 border-primary-500'
                                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                            ),
                                          children: e.title,
                                        },
                                        e.id
                                      )
                                    )
                                  : (0, a.jsx)('p', {
                                      className: 'text-sm text-gray-500 italic',
                                      children: 'No content sections available.',
                                    }),
                            }),
                            (0, a.jsxs)('div', {
                              className: 'mt-8 pt-6 border-t border-gray-800',
                              children: [
                                (0, a.jsx)('h3', {
                                  className:
                                    'text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4',
                                  children: 'Resources',
                                }),
                                (0, a.jsxs)('div', {
                                  className: 'space-y-2',
                                  children: [
                                    (0, a.jsxs)('button', {
                                      onClick: () => t.push('/flashcards'),
                                      className:
                                        'w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition flex items-center',
                                      children: [
                                        (0, a.jsx)('span', {
                                          className: 'mr-2',
                                          children: '\uD83D\uDDC2️',
                                        }),
                                        ' Related Flashcards',
                                      ],
                                    }),
                                    (0, a.jsxs)('button', {
                                      onClick: () => t.push('/formulas'),
                                      className:
                                        'w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition flex items-center',
                                      children: [
                                        (0, a.jsx)('span', { className: 'mr-2', children: '∑' }),
                                        ' Related Formulas',
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      }),
                      (0, a.jsx)('main', {
                        className: 'flex-1 min-w-0',
                        children: u
                          ? (0, a.jsx)('div', {
                              className: 'space-y-12',
                              children: u.sections.map(e =>
                                (0, a.jsx)(
                                  'section',
                                  {
                                    id: e.id,
                                    className: 'scroll-mt-24',
                                    children: (0, a.jsxs)('div', {
                                      className:
                                        'bg-gray-900 border border-gray-800 rounded-xl overflow-hidden',
                                      children: [
                                        (0, a.jsx)('div', {
                                          className:
                                            'border-b border-gray-800 px-6 py-4 bg-gray-800/50',
                                          children: (0, a.jsx)('h2', {
                                            className: 'text-xl font-semibold text-white',
                                            children: e.title,
                                          }),
                                        }),
                                        (0, a.jsx)('div', {
                                          className:
                                            'px-6 py-6 prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white prose-strong:text-white prose-a:text-primary-400 prose-code:text-primary-300',
                                          children: (0, a.jsx)(c.UG, { children: e.content }),
                                        }),
                                      ],
                                    }),
                                  },
                                  e.id
                                )
                              ),
                            })
                          : (0, a.jsxs)('div', {
                              className:
                                'bg-gray-900 border border-gray-800 rounded-xl p-8 text-center',
                              children: [
                                (0, a.jsx)('h3', {
                                  className: 'text-xl font-medium text-white mb-2',
                                  children: 'Content Coming Soon',
                                }),
                                (0, a.jsx)('p', {
                                  className: 'text-gray-400',
                                  children:
                                    'Detailed study guide content for this task is currently being developed. Please check back later or start with flashcards.',
                                }),
                                (0, a.jsx)('div', {
                                  className: 'mt-6 flex justify-center space-x-4',
                                  children: (0, a.jsx)('button', {
                                    onClick: () => t.push('/flashcards'),
                                    className:
                                      'px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition',
                                    children: 'Start Flashcards',
                                  }),
                                }),
                              ],
                            }),
                      }),
                    ],
                  }),
                ],
              })
            : (0, a.jsxs)('div', {
                className:
                  'max-w-4xl mx-auto px-4 py-8 text-center bg-gray-900 border border-gray-800 rounded-lg',
                children: [
                  (0, a.jsx)('h1', {
                    className: 'text-2xl font-bold text-white mb-2',
                    children: 'Task Not Found',
                  }),
                  (0, a.jsx)('p', {
                    className: 'text-gray-400 mb-6',
                    children: 'The requested task could not be found.',
                  }),
                  (0, a.jsx)('button', {
                    onClick: () => t.push('/study'),
                    className:
                      'px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition',
                    children: 'Back to Study Guide',
                  }),
                ],
              });
      }
    },
    7070: function (e, t, s) {
      'use strict';
      s.d(t, {
        H: function () {
          return c;
        },
        a: function () {
          return l;
        },
      });
      var a = s(7573),
        r = s(7653),
        o = s(4859);
      let n = (0, r.createContext)(void 0),
        i = o.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      function c(e) {
        let { children: t } = e,
          [s, o] = (0, r.useState)({ user: null, token: null, isLoading: !0, isAuthenticated: !1 });
        (0, r.useEffect)(() => {
          let e = localStorage.getItem('accessToken');
          e ? c(e) : o(e => ({ ...e, isLoading: !1 }));
        }, []);
        let c = async e => {
            try {
              let t = await fetch(''.concat(i, '/auth/me'), {
                headers: { Authorization: 'Bearer '.concat(e) },
              });
              if (t.ok) {
                let s = await t.json();
                o({ user: s.data.user, token: e, isLoading: !1, isAuthenticated: !0 });
              } else await m();
            } catch (e) {
              (console.error('Failed to fetch user:', e), h());
            }
          },
          l = async (e, t) => {
            let s = await fetch(''.concat(i, '/auth/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: e, password: t }),
              }),
              a = await s.json();
            if (!s.ok) {
              var r;
              throw Error(
                (null === (r = a.error) || void 0 === r ? void 0 : r.message) || 'Login failed'
              );
            }
            let { accessToken: n, refreshToken: c, user: l } = a.data;
            (localStorage.setItem('accessToken', n),
              localStorage.setItem('refreshToken', c),
              o({ user: l, token: n, isLoading: !1, isAuthenticated: !0 }));
          },
          d = async (e, t, s) => {
            let a = await fetch(''.concat(i, '/auth/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: e, password: t, name: s }),
              }),
              r = await a.json();
            if (!a.ok) {
              var n;
              throw Error(
                (null === (n = r.error) || void 0 === n ? void 0 : n.message) ||
                  'Registration failed'
              );
            }
            let { accessToken: c, refreshToken: l, user: d } = r.data;
            (localStorage.setItem('accessToken', c),
              localStorage.setItem('refreshToken', l),
              o({ user: d, token: c, isLoading: !1, isAuthenticated: !0 }));
          },
          h = () => {
            (localStorage.removeItem('accessToken'),
              localStorage.removeItem('refreshToken'),
              o({ user: null, token: null, isLoading: !1, isAuthenticated: !1 }));
          },
          m = async () => {
            let e = localStorage.getItem('refreshToken');
            if (!e) {
              h();
              return;
            }
            try {
              let t = await fetch(''.concat(i, '/auth/refresh'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: e }),
              });
              if (t.ok) {
                let { accessToken: e, refreshToken: s } = (await t.json()).data;
                (localStorage.setItem('accessToken', e),
                  localStorage.setItem('refreshToken', s),
                  await c(e));
              } else h();
            } catch (e) {
              (console.error('Token refresh failed:', e), h());
            }
          };
        return (0, a.jsx)(n.Provider, {
          value: { ...s, login: l, register: d, logout: h, refreshToken: m },
          children: t,
        });
      }
      function l() {
        let e = (0, r.useContext)(n);
        if (void 0 === e) throw Error('useAuth must be used within an AuthProvider');
        return e;
      }
    },
    5118: function (e, t, s) {
      'use strict';
      s.d(t, {
        Lc: function () {
          return i;
        },
        Nv: function () {
          return o;
        },
        Sh: function () {
          return d;
        },
        kx: function () {
          return l;
        },
        sA: function () {
          return n;
        },
        tF: function () {
          return c;
        },
      });
      let a = s(4859).env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      async function r() {
        return localStorage.getItem('accessToken');
      }
      async function o(e) {
        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
          { method: s = 'GET', body: o, token: n } = t,
          i = null != n ? n : await r(),
          c = { 'Content-Type': 'application/json' };
        i && (c.Authorization = 'Bearer '.concat(i));
        let l = await fetch(''.concat(a).concat(e), {
            method: s,
            headers: c,
            body: o ? JSON.stringify(o) : void 0,
          }),
          d = await l.json();
        if (!l.ok) {
          var h;
          throw Error(
            (null === (h = d.error) || void 0 === h ? void 0 : h.message) || 'Request failed'
          );
        }
        return d;
      }
      let n = {
          getDomains: () => o('/domains'),
          getDomain: e => o('/domains/'.concat(e)),
          getTasks: e => o('/domains/'.concat(e, '/tasks')),
          getStudyGuide: e => o('/domains/tasks/'.concat(e, '/study-guide')),
          markSectionComplete: e =>
            o('/domains/progress/sections/'.concat(e, '/complete'), { method: 'POST' }),
          getProgress: () => o('/domains/progress'),
        },
        i = {
          getFlashcards: e => {
            let t = new URLSearchParams();
            return (
              (null == e ? void 0 : e.domainId) && t.set('domainId', e.domainId),
              (null == e ? void 0 : e.taskId) && t.set('taskId', e.taskId),
              (null == e ? void 0 : e.limit) && t.set('limit', String(e.limit)),
              o('/flashcards?'.concat(t))
            );
          },
          getDueForReview: e => o('/flashcards/review'.concat(e ? '?limit='.concat(e) : '')),
          getStats: () => o('/flashcards/stats'),
          startSession: e => o('/flashcards/sessions', { method: 'POST', body: e }),
          recordResponse: (e, t, s, a) =>
            o('/flashcards/sessions/'.concat(e, '/responses/').concat(t), {
              method: 'POST',
              body: { rating: s, timeSpentMs: a },
            }),
          completeSession: e =>
            o('/flashcards/sessions/'.concat(e, '/complete'), { method: 'POST' }),
          createCustom: e => o('/flashcards/custom', { method: 'POST', body: e }),
        },
        c = {
          startSession: e => o('/practice/sessions', { method: 'POST', body: e }),
          submitAnswer: (e, t, s, a) =>
            o('/practice/sessions/'.concat(e, '/answers/').concat(t), {
              method: 'POST',
              body: { selectedOptionId: s, timeSpentMs: a },
            }),
          completeSession: e => o('/practice/sessions/'.concat(e, '/complete'), { method: 'POST' }),
          startMockExam: () => o('/practice/mock-exams', { method: 'POST' }),
          getFlagged: () => o('/practice/flagged'),
          flagQuestion: e => o('/practice/questions/'.concat(e, '/flag'), { method: 'POST' }),
          unflagQuestion: e => o('/practice/questions/'.concat(e, '/flag'), { method: 'DELETE' }),
          getStats: () => o('/practice/stats'),
        },
        l = {
          getDashboard: () => o('/dashboard'),
          getStreak: () => o('/dashboard/streak'),
          getProgress: () => o('/dashboard/progress'),
          getActivity: e => o('/dashboard/activity'.concat(e ? '?limit='.concat(e) : '')),
          getReviews: e => o('/dashboard/reviews'.concat(e ? '?limit='.concat(e) : '')),
          getWeakAreas: () => o('/dashboard/weak-areas'),
          getReadiness: () => o('/dashboard/readiness'),
          getRecommendations: () => o('/dashboard/recommendations'),
        },
        d = {
          getFormulas: e => o('/formulas'.concat(e ? '?category='.concat(e) : '')),
          getFormula: e => o('/formulas/'.concat(e)),
          calculate: (e, t) =>
            o('/formulas/'.concat(e, '/calculate'), { method: 'POST', body: { inputs: t } }),
          getVariables: () => o('/formulas/variables'),
        };
    },
  },
  function (e) {
    (e.O(0, [93, 293, 528, 744], function () {
      return e((e.s = 5880));
    }),
      (_N_E = e.O()));
  },
]);
