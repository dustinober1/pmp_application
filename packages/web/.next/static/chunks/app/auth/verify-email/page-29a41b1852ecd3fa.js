(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [616],
  {
    2378: function (e, t, r) {
      Promise.resolve().then(r.bind(r, 1939));
    },
    8146: function (e, t, r) {
      'use strict';
      r.d(t, {
        default: function () {
          return n.a;
        },
      });
      var s = r(6340),
        n = r.n(s);
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
      var s, n;
      e.exports =
        (null == (s = r.g.process) ? void 0 : s.env) &&
        'object' == typeof (null == (n = r.g.process) ? void 0 : n.env)
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
                n = (e.exports = {});
              function a() {
                throw Error('setTimeout has not been defined');
              }
              function o() {
                throw Error('clearTimeout has not been defined');
              }
              function i(e) {
                if (t === setTimeout) return setTimeout(e, 0);
                if ((t === a || !t) && setTimeout) return ((t = setTimeout), setTimeout(e, 0));
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
                  t = 'function' == typeof setTimeout ? setTimeout : a;
                } catch (e) {
                  t = a;
                }
                try {
                  r = 'function' == typeof clearTimeout ? clearTimeout : o;
                } catch (e) {
                  r = o;
                }
              })();
              var c = [],
                l = !1,
                u = -1;
              function d() {
                l && s && ((l = !1), s.length ? (c = s.concat(c)) : (u = -1), c.length && m());
              }
              function m() {
                if (!l) {
                  var e = i(d);
                  l = !0;
                  for (var t = c.length; t; ) {
                    for (s = c, c = []; ++u < t; ) s && s[u].run();
                    ((u = -1), (t = c.length));
                  }
                  ((s = null),
                    (l = !1),
                    (function (e) {
                      if (r === clearTimeout) return clearTimeout(e);
                      if ((r === o || !r) && clearTimeout)
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
              function f(e, t) {
                ((this.fun = e), (this.array = t));
              }
              function h() {}
              ((n.nextTick = function (e) {
                var t = Array(arguments.length - 1);
                if (arguments.length > 1)
                  for (var r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
                (c.push(new f(e, t)), 1 !== c.length || l || i(m));
              }),
                (f.prototype.run = function () {
                  this.fun.apply(null, this.array);
                }),
                (n.title = 'browser'),
                (n.browser = !0),
                (n.env = {}),
                (n.argv = []),
                (n.version = ''),
                (n.versions = {}),
                (n.on = h),
                (n.addListener = h),
                (n.once = h),
                (n.off = h),
                (n.removeListener = h),
                (n.removeAllListeners = h),
                (n.emit = h),
                (n.prependListener = h),
                (n.prependOnceListener = h),
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
          r = {};
        function s(e) {
          var n = r[e];
          if (void 0 !== n) return n.exports;
          var a = (r[e] = { exports: {} }),
            o = !0;
          try {
            (t[e](a, a.exports, s), (o = !1));
          } finally {
            o && delete r[e];
          }
          return a.exports;
        }
        s.ab = '//';
        var n = s(229);
        e.exports = n;
      })();
    },
    1939: function (e, t, r) {
      'use strict';
      (r.r(t),
        r.d(t, {
          default: function () {
            return l;
          },
        }));
      var s = r(7573),
        n = r(7653),
        a = r(8146),
        o = r(1695),
        i = r(5118);
      function c() {
        let e = (0, o.useSearchParams)().get('token'),
          [t, r] = (0, n.useState)('verifying'),
          [c, l] = (0, n.useState)('');
        return (
          (0, n.useEffect)(() => {
            (async function () {
              if (!e) {
                (r('error'), l('Invalid verification link. Missing token.'));
                return;
              }
              try {
                (await (0, i.Nv)('/auth/verify-email', { method: 'POST', body: { token: e } }),
                  r('success'));
              } catch (e) {
                (console.error('Email verification failed', e),
                  r('error'),
                  l(e.message || 'Verification failed. The link may have expired.'));
              }
            })();
          }, [e]),
          (0, s.jsxs)('div', {
            className:
              'max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl border border-gray-700 text-center shadow-xl',
            children: [
              'verifying' === t &&
                (0, s.jsxs)(s.Fragment, {
                  children: [
                    (0, s.jsx)('div', {
                      className: 'flex justify-center mb-6',
                      children: (0, s.jsx)('div', {
                        className:
                          'animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500',
                      }),
                    }),
                    (0, s.jsx)('h2', {
                      className: 'text-2xl font-bold text-white mb-2',
                      children: 'Verifying Email...',
                    }),
                    (0, s.jsx)('p', {
                      className: 'text-gray-400',
                      children: 'Please wait while we verify your email address.',
                    }),
                  ],
                }),
              'success' === t &&
                (0, s.jsxs)(s.Fragment, {
                  children: [
                    (0, s.jsx)('div', { className: 'text-5xl mb-4', children: '\uD83C\uDF89' }),
                    (0, s.jsx)('h2', {
                      className: 'text-2xl font-bold text-white mb-2',
                      children: 'Email Verified!',
                    }),
                    (0, s.jsx)('p', {
                      className: 'text-gray-400 mb-6',
                      children:
                        'Your email address has been successfully verified. You can now access all features of your account.',
                    }),
                    (0, s.jsx)(a.default, {
                      href: '/dashboard',
                      className:
                        'block w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition shadow-lg',
                      children: 'Continue to Dashboard',
                    }),
                  ],
                }),
              'error' === t &&
                (0, s.jsxs)(s.Fragment, {
                  children: [
                    (0, s.jsx)('div', { className: 'text-5xl mb-4', children: '❌' }),
                    (0, s.jsx)('h2', {
                      className: 'text-2xl font-bold text-white mb-2',
                      children: 'Verification Failed',
                    }),
                    (0, s.jsx)('p', {
                      className:
                        'text-red-300 mb-6 bg-red-900/20 p-3 rounded-lg border border-red-800/50',
                      children: c,
                    }),
                    (0, s.jsxs)('div', {
                      className: 'space-y-3',
                      children: [
                        (0, s.jsx)(a.default, {
                          href: '/auth/forgot-password',
                          className:
                            'block w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition',
                          children: 'Resend Verification Email',
                        }),
                        (0, s.jsx)(a.default, {
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
          })
        );
      }
      function l() {
        return (0, s.jsx)('div', {
          className:
            'min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8',
          children: (0, s.jsx)(n.Suspense, {
            fallback: (0, s.jsx)('div', { className: 'text-white', children: 'Loading...' }),
            children: (0, s.jsx)(c, {}),
          }),
        });
      }
    },
    5118: function (e, t, r) {
      'use strict';
      r.d(t, {
        Lc: function () {
          return i;
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
          return c;
        },
      });
      let s = r(4859).env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      async function n() {
        return localStorage.getItem('accessToken');
      }
      async function a(e) {
        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
          { method: r = 'GET', body: a, token: o } = t,
          i = null != o ? o : await n(),
          c = { 'Content-Type': 'application/json' };
        i && (c.Authorization = 'Bearer '.concat(i));
        let l = await fetch(''.concat(s).concat(e), {
            method: r,
            headers: c,
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
        i = {
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
          recordResponse: (e, t, r, s) =>
            a('/flashcards/sessions/'.concat(e, '/responses/').concat(t), {
              method: 'POST',
              body: { rating: r, timeSpentMs: s },
            }),
          completeSession: e =>
            a('/flashcards/sessions/'.concat(e, '/complete'), { method: 'POST' }),
          createCustom: e => a('/flashcards/custom', { method: 'POST', body: e }),
        },
        c = {
          startSession: e => a('/practice/sessions', { method: 'POST', body: e }),
          submitAnswer: (e, t, r, s) =>
            a('/practice/sessions/'.concat(e, '/answers/').concat(t), {
              method: 'POST',
              body: { selectedOptionId: r, timeSpentMs: s },
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
    (e.O(0, [340, 293, 528, 744], function () {
      return e((e.s = 2378));
    }),
      (_N_E = e.O()));
  },
]);
