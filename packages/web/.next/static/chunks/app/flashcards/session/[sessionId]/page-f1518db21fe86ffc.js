(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [849],
  {
    9151: function (e, t, r) {
      Promise.resolve().then(r.bind(r, 4734));
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
                l && s && ((l = !1), s.length ? (c = s.concat(c)) : (d = -1), c.length && h());
              }
              function h() {
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
              function m(e, t) {
                ((this.fun = e), (this.array = t));
              }
              function f() {}
              ((a.nextTick = function (e) {
                var t = Array(arguments.length - 1);
                if (arguments.length > 1)
                  for (var r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
                (c.push(new m(e, t)), 1 !== c.length || l || i(h));
              }),
                (m.prototype.run = function () {
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
    4734: function (e, t, r) {
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
          [h, m] = (0, a.useState)(0),
          [f, x] = (0, a.useState)(!1),
          [g, p] = (0, a.useState)(!1),
          [y, b] = (0, a.useState)(Date.now());
        (0, a.useEffect)(() => {
          async function t() {
            if (e)
              try {
                l(!0);
                let t = await (0, i.Nv)('/flashcards/sessions/'.concat(e));
                t.data &&
                  (u(t.data),
                  m(t.data.progress.answered),
                  t.data.progress.answered >= t.data.progress.total &&
                    t.data.progress.total > 0 &&
                    p(!0));
              } catch (e) {
                console.error('Failed to fetch session', e);
              } finally {
                l(!1);
              }
          }
          r && t();
        }, [e, r]);
        let v = () => {
            x(!f);
          },
          w = async t => {
            if (!d || !e) return;
            let r = d.cards[h];
            if (!r) return;
            let s = Date.now() - y;
            try {
              (await (0, i.Nv)('/flashcards/sessions/'.concat(e, '/responses/').concat(r.id), {
                method: 'POST',
                body: { rating: t, timeSpentMs: s },
              }),
                h < d.cards.length - 1 ? (x(!1), m(e => e + 1), b(Date.now())) : await j());
            } catch (e) {
              console.error('Failed to record response', e);
            }
          },
          j = async () => {
            try {
              (await (0, i.Nv)('/flashcards/sessions/'.concat(e, '/complete'), { method: 'POST' }),
                p(!0));
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
                onClick: () => t.push('/flashcards'),
                className:
                  'px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition',
                children: 'Back to Flashcards',
              }),
            ],
          });
        if (g)
          return (0, s.jsx)('div', {
            className: 'max-w-2xl mx-auto px-4 py-16 text-center',
            children: (0, s.jsxs)('div', {
              className: 'bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl',
              children: [
                (0, s.jsx)('div', { className: 'text-6xl mb-4', children: '\uD83C\uDF89' }),
                (0, s.jsx)('h1', {
                  className: 'text-3xl font-bold text-white mb-4',
                  children: 'Session Complete!',
                }),
                (0, s.jsxs)('p', {
                  className: 'text-gray-400 mb-8',
                  children: ["Great job! You've reviewed ", d.cards.length, ' cards.'],
                }),
                (0, s.jsxs)('div', {
                  className: 'flex justify-center space-x-4',
                  children: [
                    (0, s.jsx)('button', {
                      onClick: () => t.push('/flashcards'),
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
        let k = d.cards[h],
          N = d.cards.length > 0 ? Math.round((h / d.cards.length) * 100) : 0;
        return k
          ? (0, s.jsxs)('div', {
              className: 'max-w-4xl mx-auto px-4 py-8 min-h-[80vh] flex flex-col',
              children: [
                (0, s.jsxs)('div', {
                  className: 'mb-8 flex items-center justify-between',
                  children: [
                    (0, s.jsx)('button', {
                      onClick: () => t.push('/flashcards'),
                      className: 'text-gray-400 hover:text-white transition',
                      children: '← Exit',
                    }),
                    (0, s.jsxs)('div', {
                      className: 'flex-1 mx-8',
                      children: [
                        (0, s.jsxs)('div', {
                          className: 'flex justify-between text-xs text-gray-400 mb-1',
                          children: [
                            (0, s.jsxs)('span', {
                              children: ['Card ', h + 1, ' of ', d.cards.length],
                            }),
                            (0, s.jsxs)('span', { children: [Math.round(N), '%'] }),
                          ],
                        }),
                        (0, s.jsx)('div', {
                          className: 'h-2 bg-gray-800 rounded-full overflow-hidden',
                          children: (0, s.jsx)('div', {
                            className: 'h-full bg-primary-500 transition-all duration-300',
                            style: { width: ''.concat(N, '%') },
                          }),
                        }),
                      ],
                    }),
                    (0, s.jsx)('div', { className: 'w-10' }),
                    ' ',
                  ],
                }),
                (0, s.jsx)('div', {
                  className: 'flex-1 flex flex-col items-center justify-center mb-8',
                  children: (0, s.jsx)('div', {
                    className:
                      'w-full max-w-2xl aspect-[3/2] perspective-1000 cursor-pointer group',
                    onClick: v,
                    children: (0, s.jsxs)('div', {
                      className:
                        'relative w-full h-full duration-500 transform-style-3d transition-transform '.concat(
                          f ? 'rotate-y-180' : ''
                        ),
                      children: [
                        (0, s.jsxs)('div', {
                          className:
                            'absolute w-full h-full backface-hidden bg-gray-800 border-2 border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg group-hover:border-primary-500/50 transition-colors',
                          children: [
                            (0, s.jsx)('span', {
                              className: 'text-gray-500 text-sm uppercase tracking-wider mb-4',
                              children: 'Question',
                            }),
                            (0, s.jsx)('h2', {
                              className: 'text-2xl md:text-3xl font-medium text-white',
                              children: k.front,
                            }),
                            (0, s.jsx)('div', {
                              className: 'absolute bottom-4 text-gray-500 text-xs',
                              children: 'Click to flip',
                            }),
                          ],
                        }),
                        (0, s.jsxs)('div', {
                          className:
                            'absolute w-full h-full backface-hidden bg-gray-800 border-2 border-primary-900 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg rotate-y-180',
                          children: [
                            (0, s.jsx)('span', {
                              className: 'text-primary-400 text-sm uppercase tracking-wider mb-4',
                              children: 'Answer',
                            }),
                            (0, s.jsx)('p', {
                              className: 'text-xl md:text-2xl text-gray-100 leading-relaxed',
                              children: k.back,
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                }),
                (0, s.jsx)('div', {
                  className: 'h-24',
                  children: f
                    ? (0, s.jsxs)('div', {
                        className: 'grid grid-cols-3 gap-4 max-w-2xl mx-auto w-full',
                        children: [
                          (0, s.jsxs)('button', {
                            onClick: () => w('dont_know'),
                            className:
                              'py-4 bg-red-900/30 border border-red-800 text-red-200 rounded-xl hover:bg-red-900/50 transition',
                            children: [
                              (0, s.jsx)('div', { className: 'font-bold mb-1', children: 'Again' }),
                              (0, s.jsx)('div', {
                                className: 'text-xs opacity-70',
                                children: '< 1 min',
                              }),
                            ],
                          }),
                          (0, s.jsxs)('button', {
                            onClick: () => w('learning'),
                            className:
                              'py-4 bg-yellow-900/30 border border-yellow-800 text-yellow-200 rounded-xl hover:bg-yellow-900/50 transition',
                            children: [
                              (0, s.jsx)('div', { className: 'font-bold mb-1', children: 'Hard' }),
                              (0, s.jsx)('div', {
                                className: 'text-xs opacity-70',
                                children: '2 days',
                              }),
                            ],
                          }),
                          (0, s.jsxs)('button', {
                            onClick: () => w('know_it'),
                            className:
                              'py-4 bg-green-900/30 border border-green-800 text-green-200 rounded-xl hover:bg-green-900/50 transition',
                            children: [
                              (0, s.jsx)('div', { className: 'font-bold mb-1', children: 'Easy' }),
                              (0, s.jsx)('div', {
                                className: 'text-xs opacity-70',
                                children: '4 days',
                              }),
                            ],
                          }),
                        ],
                      })
                    : (0, s.jsx)('div', {
                        className: 'flex justify-center',
                        children: (0, s.jsx)('button', {
                          onClick: v,
                          className:
                            'px-8 py-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition shadow-lg font-medium',
                          children: 'Show Answer',
                        }),
                      }),
                }),
              ],
            })
          : (0, s.jsx)('div', { children: 'Loading card...' });
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
              } else await h();
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
          h = async () => {
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
          value: { ...r, login: l, register: d, logout: u, refreshToken: h },
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
      return e((e.s = 9151));
    }),
      (_N_E = e.O()));
  },
]);
