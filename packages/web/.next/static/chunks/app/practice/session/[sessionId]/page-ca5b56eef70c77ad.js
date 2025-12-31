(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [899],
  {
    7: function (e, t, r) {
      Promise.resolve().then(r.bind(r, 1652));
    },
    1695: function (e, t, r) {
      'use strict';
      var s = r(1219);
      (r.o(s, 'useParams') &&
        r.d(t, {
          useParams: function () {
            return s.useParams;
          },
        }),
        r.o(s, 'useRouter') &&
          r.d(t, {
            useRouter: function () {
              return s.useRouter;
            },
          }),
        r.o(s, 'useSearchParams') &&
          r.d(t, {
            useSearchParams: function () {
              return s.useSearchParams;
            },
          }));
    },
    4859: function (e, t, r) {
      'use strict';
      var s, a;
      e.exports =
        (null == (s = r.g.process) ? void 0 : s.env) &&
        'object' == typeof (null == (a = r.g.process) ? void 0 : a.env)
          ? r.g.process
          : r(9566);
    },
    9566: function (e) {
      !(function () {
        var t = {
            229: function (e) {
              var t,
                r,
                s,
                a = (e.exports = {});
              function o() {
                throw Error('setTimeout has not been defined');
              }
              function n() {
                throw Error('clearTimeout has not been defined');
              }
              function i(e) {
                if (t === setTimeout) return setTimeout(e, 0);
                if ((t === o || !t) && setTimeout) return ((t = setTimeout), setTimeout(e, 0));
                try {
                  return t(e, 0);
                } catch (r) {
                  try {
                    return t.call(null, e, 0);
                  } catch (r) {
                    return t.call(this, e, 0);
                  }
                }
              }
              !(function () {
                try {
                  t = 'function' == typeof setTimeout ? setTimeout : o;
                } catch (e) {
                  t = o;
                }
                try {
                  r = 'function' == typeof clearTimeout ? clearTimeout : n;
                } catch (e) {
                  r = n;
                }
              })();
              var c = [],
                l = !1,
                d = -1;
              function u() {
                l && s && ((l = !1), s.length ? (c = s.concat(c)) : (d = -1), c.length && m());
              }
              function m() {
                if (!l) {
                  var e = i(u);
                  l = !0;
                  for (var t = c.length; t; ) {
                    for (s = c, c = []; ++d < t; ) s && s[d].run();
                    ((d = -1), (t = c.length));
                  }
                  ((s = null),
                    (l = !1),
                    (function (e) {
                      if (r === clearTimeout) return clearTimeout(e);
                      if ((r === n || !r) && clearTimeout)
                        return ((r = clearTimeout), clearTimeout(e));
                      try {
                        r(e);
                      } catch (t) {
                        try {
                          return r.call(null, e);
                        } catch (t) {
                          return r.call(this, e);
                        }
                      }
                    })(e));
                }
              }
              function h(e, t) {
                ((this.fun = e), (this.array = t));
              }
              function f() {}
              ((a.nextTick = function (e) {
                var t = Array(arguments.length - 1);
                if (arguments.length > 1)
                  for (var r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
                (c.push(new h(e, t)), 1 !== c.length || l || i(m));
              }),
                (h.prototype.run = function () {
                  this.fun.apply(null, this.array);
                }),
                (a.title = 'browser'),
                (a.browser = !0),
                (a.env = {}),
                (a.argv = []),
                (a.version = ''),
                (a.versions = {}),
                (a.on = f),
                (a.addListener = f),
                (a.once = f),
                (a.off = f),
                (a.removeListener = f),
                (a.removeAllListeners = f),
                (a.emit = f),
                (a.prependListener = f),
                (a.prependOnceListener = f),
                (a.listeners = function (e) {
                  return [];
                }),
                (a.binding = function (e) {
                  throw Error('process.binding is not supported');
                }),
                (a.cwd = function () {
                  return '/';
                }),
                (a.chdir = function (e) {
                  throw Error('process.chdir is not supported');
                }),
                (a.umask = function () {
                  return 0;
                }));
            },
          },
          r = {};
        function s(e) {
          var a = r[e];
          if (void 0 !== a) return a.exports;
          var o = (r[e] = { exports: {} }),
            n = !0;
          try {
            (t[e](o, o.exports, s), (n = !1));
          } finally {
            n && delete r[e];
          }
          return o.exports;
        }
        s.ab = '//';
        var a = s(229);
        e.exports = a;
      })();
    },
    1652: function (e, t, r) {
      'use strict';
      (r.r(t),
        r.d(t, {
          default: function () {
            return c;
          },
        }));
      var s = r(7573),
        a = r(7653),
        o = r(1695),
        n = r(7070),
        i = r(5118);
      function c() {
        let { sessionId: e } = (0, o.useParams)(),
          t = (0, o.useRouter)(),
          { user: r } = (0, n.a)(),
          [c, l] = (0, a.useState)(!0),
          [d, u] = (0, a.useState)(null),
          [m, h] = (0, a.useState)(0),
          [f, g] = (0, a.useState)(null),
          [p, x] = (0, a.useState)(!1),
          [b, y] = (0, a.useState)(null),
          [v, w] = (0, a.useState)(!1),
          [T, S] = (0, a.useState)(Date.now()),
          k = (0, a.useRef)(null);
        ((0, a.useEffect)(() => {
          async function t() {
            if (e)
              try {
                l(!0);
                let t = await (0, i.Nv)('/practice/sessions/'.concat(e));
                if (t.data) {
                  u(t.data);
                  let e = t.data.questions.findIndex(e => !e.userAnswerId);
                  (h(e >= 0 ? e : 0),
                    t.data.progress.answered >= t.data.progress.total &&
                      t.data.progress.total > 0 &&
                      w(!0));
                }
              } catch (e) {
                console.error('Failed to fetch session', e);
              } finally {
                l(!1);
              }
          }
          r && t();
        }, [e, r]),
          (0, a.useEffect)(() => {
            (g(null), y(null), S(Date.now()), k.current && (k.current.scrollTop = 0));
          }, [m]));
        let j = async () => {
            if (!d || !e || !f) return;
            let t = d.questions[m];
            if (!t) return;
            let r = Date.now() - T;
            x(!0);
            try {
              let s = await (0, i.Nv)('/practice/sessions/'.concat(e, '/answers/').concat(t.id), {
                method: 'POST',
                body: { selectedOptionId: f, timeSpentMs: r },
              });
              (s.data && y(s.data.result),
                u(e => {
                  if (!e) return null;
                  let t = [...e.questions],
                    r = t[m];
                  return (
                    (t[m] = { ...r, userAnswerId: f }),
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
              x(!1);
            }
          },
          N = async () => {
            d && (m < d.questions.length - 1 ? h(e => e + 1) : await P());
          },
          P = async () => {
            if (e)
              try {
                (await (0, i.Nv)('/practice/sessions/'.concat(e, '/complete'), { method: 'POST' }),
                  w(!0));
              } catch (e) {
                console.error('Failed to complete session', e);
              }
          };
        if (c)
          return (0, s.jsx)('div', {
            className: 'flex justify-center items-center min-h-[60vh]',
            children: (0, s.jsx)('div', {
              className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600',
            }),
          });
        if (!d)
          return (0, s.jsxs)('div', {
            className:
              'max-w-4xl mx-auto px-4 py-8 text-center bg-gray-900 border border-gray-800 rounded-lg',
            children: [
              (0, s.jsx)('h1', {
                className: 'text-2xl font-bold text-white mb-2',
                children: 'Session Not Found',
              }),
              (0, s.jsx)('button', {
                onClick: () => t.push('/practice'),
                className:
                  'px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition',
                children: 'Back to Practice',
              }),
            ],
          });
        if (v)
          return (0, s.jsx)('div', {
            className: 'max-w-2xl mx-auto px-4 py-16 text-center',
            children: (0, s.jsxs)('div', {
              className: 'bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl',
              children: [
                (0, s.jsx)('div', { className: 'text-6xl mb-4', children: '\uD83C\uDFC6' }),
                (0, s.jsx)('h1', {
                  className: 'text-3xl font-bold text-white mb-4',
                  children: 'Practice Complete!',
                }),
                (0, s.jsxs)('p', {
                  className: 'text-gray-400 mb-8',
                  children: [
                    "You've completed ",
                    d.questions.length,
                    ' questions. Check the dashboard for detailed analytics.',
                  ],
                }),
                (0, s.jsxs)('div', {
                  className: 'flex justify-center space-x-4',
                  children: [
                    (0, s.jsx)('button', {
                      onClick: () => t.push('/practice'),
                      className:
                        'px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition',
                      children: 'Back to Overview',
                    }),
                    (0, s.jsx)('button', {
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
        let C = d.questions[m],
          I = d.questions.length > 0 ? Math.round((m / d.questions.length) * 100) : 0;
        return (0, s.jsxs)('div', {
          className: 'max-w-5xl mx-auto px-4 py-6 md:py-8 h-[calc(100vh-64px)] flex flex-col',
          children: [
            (0, s.jsxs)('div', {
              className: 'mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4',
              children: [
                (0, s.jsxs)('div', {
                  className: 'flex items-center space-x-4',
                  children: [
                    (0, s.jsx)('button', {
                      onClick: () => t.push('/practice'),
                      className: 'text-gray-400 hover:text-white transition',
                      children: '← Exit',
                    }),
                    (0, s.jsxs)('div', {
                      className: 'px-3 py-1 bg-gray-800 rounded text-xs text-gray-400 font-mono',
                      children: ['Q', m + 1, '/', d.questions.length],
                    }),
                    C.difficulty &&
                      (0, s.jsx)('span', {
                        className:
                          'px-2 py-0.5 rounded text-xs font-medium uppercase border '.concat(
                            'easy' === C.difficulty
                              ? 'border-green-800 text-green-400 bg-green-900/20'
                              : 'medium' === C.difficulty
                                ? 'border-yellow-800 text-yellow-400 bg-yellow-900/20'
                                : 'border-red-800 text-red-400 bg-red-900/20'
                          ),
                        children: C.difficulty,
                      }),
                  ],
                }),
                (0, s.jsx)('div', {
                  className: 'flex-1 max-w-md mx-auto w-full',
                  children: (0, s.jsx)('div', {
                    className: 'h-2 bg-gray-800 rounded-full overflow-hidden',
                    children: (0, s.jsx)('div', {
                      className: 'h-full bg-primary-600 transition-all duration-300',
                      style: { width: ''.concat(I, '%') },
                    }),
                  }),
                }),
                (0, s.jsx)('div', { className: 'w-20 hidden md:block' }),
              ],
            }),
            (0, s.jsxs)('div', {
              ref: k,
              className: 'flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar',
              children: [
                (0, s.jsxs)('div', {
                  className: 'bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8 mb-6',
                  children: [
                    (0, s.jsx)('h2', {
                      className: 'text-xl md:text-2xl text-white font-medium mb-8 leading-relaxed',
                      children: C.questionText,
                    }),
                    (0, s.jsx)('div', {
                      className: 'space-y-3',
                      children: C.options.map(e => {
                        let t = f === e.id,
                          r = (null == b ? void 0 : b.correctOptionId) === e.id,
                          a = b && t && !b.isCorrect,
                          o =
                            'w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-start group relative';
                        return (
                          b
                            ? r
                              ? (o += ' bg-green-900/30 border-green-500/50')
                              : a
                                ? (o += ' bg-red-900/30 border-red-500/50')
                                : (o += ' border-gray-800 opacity-60')
                            : t
                              ? (o += ' bg-primary-900/20 border-primary-500')
                              : (o +=
                                  ' bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800'),
                          (0, s.jsxs)(
                            'button',
                            {
                              onClick: () => !b && g(e.id),
                              disabled: !!b || p,
                              className: o,
                              children: [
                                (0, s.jsx)('div', {
                                  className:
                                    'mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center mr-4 flex-shrink-0 transition-colors '.concat(
                                      b
                                        ? r
                                          ? 'border-green-500 bg-green-500'
                                          : a
                                            ? 'border-red-500 bg-red-500'
                                            : 'border-gray-600'
                                        : t
                                          ? 'border-primary-500 bg-primary-500'
                                          : 'border-gray-500 group-hover:border-gray-400'
                                    ),
                                  children:
                                    (b && (r || a)) || t
                                      ? (0, s.jsx)('div', {
                                          className: 'w-2 h-2 bg-white rounded-full',
                                        })
                                      : null,
                                }),
                                (0, s.jsx)('span', {
                                  className: 'text-base '.concat(
                                    b && (r || a) ? 'text-white' : 'text-gray-300'
                                  ),
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
                b &&
                  (0, s.jsxs)('div', {
                    className:
                      'rounded-xl p-6 mb-6 border animate-in fade-in slide-in-from-bottom-4 duration-300 '.concat(
                        b.isCorrect
                          ? 'bg-green-900/20 border-green-800'
                          : 'bg-red-900/20 border-red-800'
                      ),
                    children: [
                      (0, s.jsx)('div', {
                        className: 'flex items-center mb-3',
                        children: (0, s.jsx)('span', {
                          className: 'text-2xl mr-3 '.concat(
                            b.isCorrect ? 'text-green-400' : 'text-red-400'
                          ),
                          children: b.isCorrect ? '✓ Correct' : '✗ Incorrect',
                        }),
                      }),
                      (0, s.jsxs)('div', {
                        className: 'text-gray-300 leading-relaxed',
                        children: [
                          (0, s.jsx)('span', {
                            className: 'font-semibold text-white block mb-1',
                            children: 'Explanation:',
                          }),
                          b.explanation,
                        ],
                      }),
                    ],
                  }),
              ],
            }),
            (0, s.jsx)('div', {
              className: 'pt-4 border-t border-gray-800 flex justify-end',
              children: b
                ? (0, s.jsxs)('button', {
                    onClick: N,
                    className:
                      'px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all shadow-lg hover:shadow-primary-900/20 flex items-center',
                    children: [
                      m === d.questions.length - 1 ? 'Finish Session' : 'Next Question',
                      (0, s.jsx)('span', { className: 'ml-2', children: '→' }),
                    ],
                  })
                : (0, s.jsx)('button', {
                    onClick: j,
                    disabled: !f || p,
                    className:
                      'px-8 py-3 rounded-lg font-medium transition-all transform active:scale-95 '.concat(
                        !f || p
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed hidden'
                          : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-primary-900/20'
                      ),
                    children: p ? 'Submitting...' : 'Submit Answer',
                  }),
            }),
          ],
        });
      }
    },
    7070: function (e, t, r) {
      'use strict';
      r.d(t, {
        H: function () {
          return c;
        },
        a: function () {
          return l;
        },
      });
      var s = r(7573),
        a = r(7653),
        o = r(4859);
      let n = (0, a.createContext)(void 0),
        i = o.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      function c(e) {
        let { children: t } = e,
          [r, o] = (0, a.useState)({ user: null, token: null, isLoading: !0, isAuthenticated: !1 });
        (0, a.useEffect)(() => {
          let e = localStorage.getItem('accessToken');
          e ? c(e) : o(e => ({ ...e, isLoading: !1 }));
        }, []);
        let c = async e => {
            try {
              let t = await fetch(''.concat(i, '/auth/me'), {
                headers: { Authorization: 'Bearer '.concat(e) },
              });
              if (t.ok) {
                let r = await t.json();
                o({ user: r.data.user, token: e, isLoading: !1, isAuthenticated: !0 });
              } else await m();
            } catch (e) {
              (console.error('Failed to fetch user:', e), u());
            }
          },
          l = async (e, t) => {
            let r = await fetch(''.concat(i, '/auth/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: e, password: t }),
              }),
              s = await r.json();
            if (!r.ok) {
              var a;
              throw Error(
                (null === (a = s.error) || void 0 === a ? void 0 : a.message) || 'Login failed'
              );
            }
            let { accessToken: n, refreshToken: c, user: l } = s.data;
            (localStorage.setItem('accessToken', n),
              localStorage.setItem('refreshToken', c),
              o({ user: l, token: n, isLoading: !1, isAuthenticated: !0 }));
          },
          d = async (e, t, r) => {
            let s = await fetch(''.concat(i, '/auth/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: e, password: t, name: r }),
              }),
              a = await s.json();
            if (!s.ok) {
              var n;
              throw Error(
                (null === (n = a.error) || void 0 === n ? void 0 : n.message) ||
                  'Registration failed'
              );
            }
            let { accessToken: c, refreshToken: l, user: d } = a.data;
            (localStorage.setItem('accessToken', c),
              localStorage.setItem('refreshToken', l),
              o({ user: d, token: c, isLoading: !1, isAuthenticated: !0 }));
          },
          u = () => {
            (localStorage.removeItem('accessToken'),
              localStorage.removeItem('refreshToken'),
              o({ user: null, token: null, isLoading: !1, isAuthenticated: !1 }));
          },
          m = async () => {
            let e = localStorage.getItem('refreshToken');
            if (!e) {
              u();
              return;
            }
            try {
              let t = await fetch(''.concat(i, '/auth/refresh'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: e }),
              });
              if (t.ok) {
                let { accessToken: e, refreshToken: r } = (await t.json()).data;
                (localStorage.setItem('accessToken', e),
                  localStorage.setItem('refreshToken', r),
                  await c(e));
              } else u();
            } catch (e) {
              (console.error('Token refresh failed:', e), u());
            }
          };
        return (0, s.jsx)(n.Provider, {
          value: { ...r, login: l, register: d, logout: u, refreshToken: m },
          children: t,
        });
      }
      function l() {
        let e = (0, a.useContext)(n);
        if (void 0 === e) throw Error('useAuth must be used within an AuthProvider');
        return e;
      }
    },
    5118: function (e, t, r) {
      'use strict';
      r.d(t, {
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
      let s = r(4859).env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      async function a() {
        return localStorage.getItem('accessToken');
      }
      async function o(e) {
        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
          { method: r = 'GET', body: o, token: n } = t,
          i = null != n ? n : await a(),
          c = { 'Content-Type': 'application/json' };
        i && (c.Authorization = 'Bearer '.concat(i));
        let l = await fetch(''.concat(s).concat(e), {
            method: r,
            headers: c,
            body: o ? JSON.stringify(o) : void 0,
          }),
          d = await l.json();
        if (!l.ok) {
          var u;
          throw Error(
            (null === (u = d.error) || void 0 === u ? void 0 : u.message) || 'Request failed'
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
          recordResponse: (e, t, r, s) =>
            o('/flashcards/sessions/'.concat(e, '/responses/').concat(t), {
              method: 'POST',
              body: { rating: r, timeSpentMs: s },
            }),
          completeSession: e =>
            o('/flashcards/sessions/'.concat(e, '/complete'), { method: 'POST' }),
          createCustom: e => o('/flashcards/custom', { method: 'POST', body: e }),
        },
        c = {
          startSession: e => o('/practice/sessions', { method: 'POST', body: e }),
          submitAnswer: (e, t, r, s) =>
            o('/practice/sessions/'.concat(e, '/answers/').concat(t), {
              method: 'POST',
              body: { selectedOptionId: r, timeSpentMs: s },
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
    (e.O(0, [293, 528, 744], function () {
      return e((e.s = 7));
    }),
      (_N_E = e.O()));
  },
]);
