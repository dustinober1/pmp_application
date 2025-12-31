(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [285],
  {
    2684: function (e, t, s) {
      Promise.resolve().then(s.bind(s, 7290));
    },
    1695: function (e, t, s) {
      'use strict';
      var r = s(1219);
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
    4859: function (e, t, s) {
      'use strict';
      var r, n;
      e.exports =
        (null == (r = s.g.process) ? void 0 : r.env) &&
        'object' == typeof (null == (n = s.g.process) ? void 0 : n.env)
          ? s.g.process
          : s(9566);
    },
    9566: function (e) {
      !(function () {
        var t = {
            229: function (e) {
              var t,
                s,
                r,
                n = (e.exports = {});
              function a() {
                throw Error('setTimeout has not been defined');
              }
              function o() {
                throw Error('clearTimeout has not been defined');
              }
              function c(e) {
                if (t === setTimeout) return setTimeout(e, 0);
                if ((t === a || !t) && setTimeout) return ((t = setTimeout), setTimeout(e, 0));
                try {
                  return t(e, 0);
                } catch (s) {
                  try {
                    return t.call(null, e, 0);
                  } catch (s) {
                    return t.call(this, e, 0);
                  }
                }
              }
              !(function () {
                try {
                  t = 'function' == typeof setTimeout ? setTimeout : a;
                } catch (e) {
                  t = a;
                }
                try {
                  s = 'function' == typeof clearTimeout ? clearTimeout : o;
                } catch (e) {
                  s = o;
                }
              })();
              var i = [],
                l = !1,
                u = -1;
              function d() {
                l && r && ((l = !1), r.length ? (i = r.concat(i)) : (u = -1), i.length && m());
              }
              function m() {
                if (!l) {
                  var e = c(d);
                  l = !0;
                  for (var t = i.length; t; ) {
                    for (r = i, i = []; ++u < t; ) r && r[u].run();
                    ((u = -1), (t = i.length));
                  }
                  ((r = null),
                    (l = !1),
                    (function (e) {
                      if (s === clearTimeout) return clearTimeout(e);
                      if ((s === o || !s) && clearTimeout)
                        return ((s = clearTimeout), clearTimeout(e));
                      try {
                        s(e);
                      } catch (t) {
                        try {
                          return s.call(null, e);
                        } catch (t) {
                          return s.call(this, e);
                        }
                      }
                    })(e));
                }
              }
              function h(e, t) {
                ((this.fun = e), (this.array = t));
              }
              function f() {}
              ((n.nextTick = function (e) {
                var t = Array(arguments.length - 1);
                if (arguments.length > 1)
                  for (var s = 1; s < arguments.length; s++) t[s - 1] = arguments[s];
                (i.push(new h(e, t)), 1 !== i.length || l || c(m));
              }),
                (h.prototype.run = function () {
                  this.fun.apply(null, this.array);
                }),
                (n.title = 'browser'),
                (n.browser = !0),
                (n.env = {}),
                (n.argv = []),
                (n.version = ''),
                (n.versions = {}),
                (n.on = f),
                (n.addListener = f),
                (n.once = f),
                (n.off = f),
                (n.removeListener = f),
                (n.removeAllListeners = f),
                (n.emit = f),
                (n.prependListener = f),
                (n.prependOnceListener = f),
                (n.listeners = function (e) {
                  return [];
                }),
                (n.binding = function (e) {
                  throw Error('process.binding is not supported');
                }),
                (n.cwd = function () {
                  return '/';
                }),
                (n.chdir = function (e) {
                  throw Error('process.chdir is not supported');
                }),
                (n.umask = function () {
                  return 0;
                }));
            },
          },
          s = {};
        function r(e) {
          var n = s[e];
          if (void 0 !== n) return n.exports;
          var a = (s[e] = { exports: {} }),
            o = !0;
          try {
            (t[e](a, a.exports, r), (o = !1));
          } finally {
            o && delete s[e];
          }
          return a.exports;
        }
        r.ab = '//';
        var n = r(229);
        e.exports = n;
      })();
    },
    7290: function (e, t, s) {
      'use strict';
      (s.r(t),
        s.d(t, {
          default: function () {
            return i;
          },
        }));
      var r = s(7573),
        n = s(7653),
        a = s(1695),
        o = s(5118);
      function c() {
        let e = (0, a.useRouter)(),
          t = (0, a.useSearchParams)().get('tier') || 'high-end',
          s = { 'high-end': 29, corporate: 99 }[t] || 29,
          [c, i] = (0, n.useState)(!1),
          [l, u] = (0, n.useState)(''),
          d = async () => {
            (i(!0), u(''));
            try {
              (await (0, o.Nv)('/subscriptions/upgrade-tier', {
                method: 'POST',
                body: { tierId: t, paymentId: 'mock_pay_'.concat(Date.now()) },
              }),
                e.push('/dashboard?payment=success'));
            } catch (e) {
              (console.error('Checkout failed', e),
                u(e.message || 'Payment initialization failed. Please try again.'));
            } finally {
              i(!1);
            }
          };
        return (0, r.jsx)('div', {
          className:
            'max-w-lg mx-auto bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700',
          children: (0, r.jsxs)('div', {
            className: 'p-8',
            children: [
              (0, r.jsx)('h2', {
                className: 'text-2xl font-bold text-white mb-6',
                children: 'Complete your purchase',
              }),
              (0, r.jsxs)('div', {
                className: 'bg-gray-900/50 rounded-lg p-4 mb-6 border border-gray-800',
                children: [
                  (0, r.jsxs)('div', {
                    className: 'flex justify-between items-center mb-2',
                    children: [
                      (0, r.jsx)('span', { className: 'text-gray-400', children: 'Plan' }),
                      (0, r.jsx)('span', {
                        className: 'text-white font-medium capitalize',
                        children: t.replace('-', ' '),
                      }),
                    ],
                  }),
                  (0, r.jsxs)('div', {
                    className: 'flex justify-between items-center text-xl font-bold',
                    children: [
                      (0, r.jsx)('span', { className: 'text-gray-400', children: 'Total' }),
                      (0, r.jsxs)('span', {
                        className: 'text-primary-400',
                        children: ['$', s, '.00'],
                      }),
                    ],
                  }),
                ],
              }),
              l &&
                (0, r.jsx)('div', {
                  className:
                    'mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-300 text-sm',
                  children: l,
                }),
              (0, r.jsxs)('div', {
                className: 'space-y-4',
                children: [
                  (0, r.jsx)('button', {
                    onClick: d,
                    disabled: c,
                    className:
                      'w-full py-4 bg-[#FFC439] hover:bg-[#F4BB2E] text-blue-900 font-bold rounded-lg transition flex items-center justify-center gap-2',
                    children: c
                      ? (0, r.jsx)('span', {
                          className:
                            'inline-block h-5 w-5 border-2 border-blue-900 border-t-transparent rounded-full animate-spin',
                        })
                      : (0, r.jsxs)(r.Fragment, {
                          children: [
                            (0, r.jsx)('span', {
                              className: 'italic font-serif font-bold text-lg',
                              children: 'Pay',
                            }),
                            (0, r.jsx)('span', {
                              className: 'italic font-serif font-bold text-lg text-[#003087]',
                              children: 'Pal',
                            }),
                          ],
                        }),
                  }),
                  (0, r.jsxs)('p', {
                    className: 'text-xs text-center text-gray-500 mt-4',
                    children: [
                      'By checking out, you agree to our Terms of Service.',
                      (0, r.jsx)('br', {}),
                      '(This is a secure mock payment for the demo environment)',
                    ],
                  }),
                ],
              }),
            ],
          }),
        });
      }
      function i() {
        return (0, r.jsx)('div', {
          className: 'min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12',
          children: (0, r.jsx)(n.Suspense, {
            fallback: (0, r.jsx)('div', {
              className: 'text-white',
              children: 'Loading checkout...',
            }),
            children: (0, r.jsx)(c, {}),
          }),
        });
      }
    },
    5118: function (e, t, s) {
      'use strict';
      s.d(t, {
        Lc: function () {
          return c;
        },
        Nv: function () {
          return a;
        },
        Sh: function () {
          return u;
        },
        kx: function () {
          return l;
        },
        sA: function () {
          return o;
        },
        tF: function () {
          return i;
        },
      });
      let r = s(4859).env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      async function n() {
        return localStorage.getItem('accessToken');
      }
      async function a(e) {
        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
          { method: s = 'GET', body: a, token: o } = t,
          c = null != o ? o : await n(),
          i = { 'Content-Type': 'application/json' };
        c && (i.Authorization = 'Bearer '.concat(c));
        let l = await fetch(''.concat(r).concat(e), {
            method: s,
            headers: i,
            body: a ? JSON.stringify(a) : void 0,
          }),
          u = await l.json();
        if (!l.ok) {
          var d;
          throw Error(
            (null === (d = u.error) || void 0 === d ? void 0 : d.message) || 'Request failed'
          );
        }
        return u;
      }
      let o = {
          getDomains: () => a('/domains'),
          getDomain: e => a('/domains/'.concat(e)),
          getTasks: e => a('/domains/'.concat(e, '/tasks')),
          getStudyGuide: e => a('/domains/tasks/'.concat(e, '/study-guide')),
          markSectionComplete: e =>
            a('/domains/progress/sections/'.concat(e, '/complete'), { method: 'POST' }),
          getProgress: () => a('/domains/progress'),
        },
        c = {
          getFlashcards: e => {
            let t = new URLSearchParams();
            return (
              (null == e ? void 0 : e.domainId) && t.set('domainId', e.domainId),
              (null == e ? void 0 : e.taskId) && t.set('taskId', e.taskId),
              (null == e ? void 0 : e.limit) && t.set('limit', String(e.limit)),
              a('/flashcards?'.concat(t))
            );
          },
          getDueForReview: e => a('/flashcards/review'.concat(e ? '?limit='.concat(e) : '')),
          getStats: () => a('/flashcards/stats'),
          startSession: e => a('/flashcards/sessions', { method: 'POST', body: e }),
          recordResponse: (e, t, s, r) =>
            a('/flashcards/sessions/'.concat(e, '/responses/').concat(t), {
              method: 'POST',
              body: { rating: s, timeSpentMs: r },
            }),
          completeSession: e =>
            a('/flashcards/sessions/'.concat(e, '/complete'), { method: 'POST' }),
          createCustom: e => a('/flashcards/custom', { method: 'POST', body: e }),
        },
        i = {
          startSession: e => a('/practice/sessions', { method: 'POST', body: e }),
          submitAnswer: (e, t, s, r) =>
            a('/practice/sessions/'.concat(e, '/answers/').concat(t), {
              method: 'POST',
              body: { selectedOptionId: s, timeSpentMs: r },
            }),
          completeSession: e => a('/practice/sessions/'.concat(e, '/complete'), { method: 'POST' }),
          startMockExam: () => a('/practice/mock-exams', { method: 'POST' }),
          getFlagged: () => a('/practice/flagged'),
          flagQuestion: e => a('/practice/questions/'.concat(e, '/flag'), { method: 'POST' }),
          unflagQuestion: e => a('/practice/questions/'.concat(e, '/flag'), { method: 'DELETE' }),
          getStats: () => a('/practice/stats'),
        },
        l = {
          getDashboard: () => a('/dashboard'),
          getStreak: () => a('/dashboard/streak'),
          getProgress: () => a('/dashboard/progress'),
          getActivity: e => a('/dashboard/activity'.concat(e ? '?limit='.concat(e) : '')),
          getReviews: e => a('/dashboard/reviews'.concat(e ? '?limit='.concat(e) : '')),
          getWeakAreas: () => a('/dashboard/weak-areas'),
          getReadiness: () => a('/dashboard/readiness'),
          getRecommendations: () => a('/dashboard/recommendations'),
        },
        u = {
          getFormulas: e => a('/formulas'.concat(e ? '?category='.concat(e) : '')),
          getFormula: e => a('/formulas/'.concat(e)),
          calculate: (e, t) =>
            a('/formulas/'.concat(e, '/calculate'), { method: 'POST', body: { inputs: t } }),
          getVariables: () => a('/formulas/variables'),
        };
    },
  },
  function (e) {
    (e.O(0, [293, 528, 744], function () {
      return e((e.s = 2684));
    }),
      (_N_E = e.O()));
  },
]);
