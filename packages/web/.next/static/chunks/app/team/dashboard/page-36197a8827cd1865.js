(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [235],
  {
    1714: function (e, t, s) {
      Promise.resolve().then(s.bind(s, 9556));
    },
    1695: function (e, t, s) {
      'use strict';
      var a = s(1219);
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
    4859: function (e, t, s) {
      'use strict';
      var a, r;
      e.exports =
        (null == (a = s.g.process) ? void 0 : a.env) &&
        'object' == typeof (null == (r = s.g.process) ? void 0 : r.env)
          ? s.g.process
          : s(9566);
    },
    9566: function (e) {
      !(function () {
        var t = {
            229: function (e) {
              var t,
                s,
                a,
                r = (e.exports = {});
              function n() {
                throw Error('setTimeout has not been defined');
              }
              function o() {
                throw Error('clearTimeout has not been defined');
              }
              function c(e) {
                if (t === setTimeout) return setTimeout(e, 0);
                if ((t === n || !t) && setTimeout) return ((t = setTimeout), setTimeout(e, 0));
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
                  t = 'function' == typeof setTimeout ? setTimeout : n;
                } catch (e) {
                  t = n;
                }
                try {
                  s = 'function' == typeof clearTimeout ? clearTimeout : o;
                } catch (e) {
                  s = o;
                }
              })();
              var i = [],
                l = !1,
                d = -1;
              function m() {
                l && a && ((l = !1), a.length ? (i = a.concat(i)) : (d = -1), i.length && u());
              }
              function u() {
                if (!l) {
                  var e = c(m);
                  l = !0;
                  for (var t = i.length; t; ) {
                    for (a = i, i = []; ++d < t; ) a && a[d].run();
                    ((d = -1), (t = i.length));
                  }
                  ((a = null),
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
              function x() {}
              ((r.nextTick = function (e) {
                var t = Array(arguments.length - 1);
                if (arguments.length > 1)
                  for (var s = 1; s < arguments.length; s++) t[s - 1] = arguments[s];
                (i.push(new h(e, t)), 1 !== i.length || l || c(u));
              }),
                (h.prototype.run = function () {
                  this.fun.apply(null, this.array);
                }),
                (r.title = 'browser'),
                (r.browser = !0),
                (r.env = {}),
                (r.argv = []),
                (r.version = ''),
                (r.versions = {}),
                (r.on = x),
                (r.addListener = x),
                (r.once = x),
                (r.off = x),
                (r.removeListener = x),
                (r.removeAllListeners = x),
                (r.emit = x),
                (r.prependListener = x),
                (r.prependOnceListener = x),
                (r.listeners = function (e) {
                  return [];
                }),
                (r.binding = function (e) {
                  throw Error('process.binding is not supported');
                }),
                (r.cwd = function () {
                  return '/';
                }),
                (r.chdir = function (e) {
                  throw Error('process.chdir is not supported');
                }),
                (r.umask = function () {
                  return 0;
                }));
            },
          },
          s = {};
        function a(e) {
          var r = s[e];
          if (void 0 !== r) return r.exports;
          var n = (s[e] = { exports: {} }),
            o = !0;
          try {
            (t[e](n, n.exports, a), (o = !1));
          } finally {
            o && delete s[e];
          }
          return n.exports;
        }
        a.ab = '//';
        var r = a(229);
        e.exports = r;
      })();
    },
    9556: function (e, t, s) {
      'use strict';
      (s.r(t),
        s.d(t, {
          default: function () {
            return c;
          },
        }));
      var a = s(7573),
        r = s(7653),
        n = s(1695),
        o = s(5118);
      function c() {
        let e = (0, n.useRouter)(),
          [t, s] = (0, r.useState)(!0),
          [c, i] = (0, r.useState)(null),
          [l, d] = (0, r.useState)(null),
          [m, u] = (0, r.useState)(''),
          [h, x] = (0, r.useState)(!1),
          [g, p] = (0, r.useState)(null);
        (0, r.useEffect)(() => {
          f();
        }, []);
        let f = async () => {
            try {
              var e;
              s(!0);
              let t = await (0, o.Nv)('/teams'),
                a = (null === (e = t.data) || void 0 === e ? void 0 : e.teams) || [];
              if (0 === a.length) {
                s(!1);
                return;
              }
              let r = a[0];
              i(r);
              let n = await (0, o.Nv)('/teams/'.concat(r.id, '/dashboard'));
              n.data && d(n.data.dashboard);
            } catch (e) {
              console.error('Failed to load team data', e);
            } finally {
              s(!1);
            }
          },
          y = async e => {
            if ((e.preventDefault(), c && m)) {
              (x(!0), p(null));
              try {
                (await (0, o.Nv)('/teams/'.concat(c.id, '/invitations'), {
                  method: 'POST',
                  body: { email: m },
                }),
                  p({ type: 'success', message: 'Invitation sent to '.concat(m) }),
                  u(''));
              } catch (e) {
                (console.error('Invite failed', e),
                  p({ type: 'error', message: e.message || 'Failed to send invitation' }));
              } finally {
                x(!1);
              }
            }
          },
          b = async (e, t) => {
            if (c && confirm('Are you sure you want to remove '.concat(t, ' from the team?')))
              try {
                (await (0, o.Nv)('/teams/'.concat(c.id, '/members/').concat(e, '/preserve'), {
                  method: 'DELETE',
                }),
                  f());
              } catch (e) {
                (console.error('Failed to remove member', e), alert('Failed to remove member'));
              }
          },
          v = async e => {
            if (c)
              try {
                (await (0, o.Nv)('/teams/'.concat(c.id, '/alerts/').concat(e, '/acknowledge'), {
                  method: 'POST',
                }),
                  l && d({ ...l, alerts: l.alerts.filter(t => t.id !== e) }));
              } catch (e) {
                console.error('Failed to acknowledge alert', e);
              }
          };
        return t
          ? (0, a.jsx)('div', {
              className: 'flex justify-center items-center min-h-[60vh]',
              children: (0, a.jsx)('div', {
                className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600',
              }),
            })
          : c && l
            ? (0, a.jsxs)('div', {
                className: 'max-w-7xl mx-auto px-4 py-8',
                children: [
                  (0, a.jsxs)('div', {
                    className:
                      'flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4',
                    children: [
                      (0, a.jsxs)('div', {
                        children: [
                          (0, a.jsx)('h1', {
                            className: 'text-3xl font-bold text-white mb-2',
                            children: l.teamName,
                          }),
                          (0, a.jsxs)('div', {
                            className: 'flex gap-4 text-sm text-gray-400',
                            children: [
                              (0, a.jsxs)('span', {
                                children: [
                                  'Members: ',
                                  (0, a.jsx)('span', {
                                    className: 'text-white font-medium',
                                    children: l.totalMembers,
                                  }),
                                ],
                              }),
                              (0, a.jsxs)('span', {
                                children: [
                                  'Active: ',
                                  (0, a.jsx)('span', {
                                    className: 'text-green-400 font-medium',
                                    children: l.activeMembers,
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, a.jsxs)('div', {
                        className: 'flex gap-4',
                        children: [
                          (0, a.jsxs)('div', {
                            className: 'text-right',
                            children: [
                              (0, a.jsx)('div', {
                                className: 'text-sm text-gray-400',
                                children: 'Avg. Progress',
                              }),
                              (0, a.jsxs)('div', {
                                className: 'text-2xl font-bold text-primary-400',
                                children: [l.averageProgress, '%'],
                              }),
                            ],
                          }),
                          (0, a.jsxs)('div', {
                            className: 'text-right pl-6 border-l border-gray-700',
                            children: [
                              (0, a.jsx)('div', {
                                className: 'text-sm text-gray-400',
                                children: 'Avg. Readiness',
                              }),
                              (0, a.jsxs)('div', {
                                className: 'text-2xl font-bold text-green-400',
                                children: [l.averageReadinessScore, '%'],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, a.jsxs)('div', {
                    className: 'grid grid-cols-1 lg:grid-cols-3 gap-8',
                    children: [
                      (0, a.jsxs)('div', {
                        className: 'lg:col-span-2 space-y-8',
                        children: [
                          l.alerts.length > 0 &&
                            (0, a.jsxs)('div', {
                              className:
                                'bg-gray-800/50 border border-yellow-900/50 rounded-xl p-6',
                              children: [
                                (0, a.jsxs)('h3', {
                                  className: 'text-lg font-bold text-white mb-4 flex items-center',
                                  children: [
                                    (0, a.jsx)('span', {
                                      className: 'text-yellow-500 mr-2',
                                      children: '⚠️',
                                    }),
                                    ' Needs Attention',
                                  ],
                                }),
                                (0, a.jsx)('div', {
                                  className: 'space-y-3',
                                  children: l.alerts.map(e =>
                                    (0, a.jsxs)(
                                      'div',
                                      {
                                        className:
                                          'flex justify-between items-center bg-gray-900/50 p-4 rounded-lg border border-gray-800',
                                        children: [
                                          (0, a.jsxs)('div', {
                                            children: [
                                              (0, a.jsx)('span', {
                                                className:
                                                  'inline-block px-2 py-0.5 rounded text-xs uppercase font-bold mr-3 '.concat(
                                                    'inactive' === e.type
                                                      ? 'bg-gray-700 text-gray-300'
                                                      : 'struggling' === e.type
                                                        ? 'bg-red-900/50 text-red-400'
                                                        : 'bg-yellow-900/50 text-yellow-400'
                                                  ),
                                                children: e.type.replace('_', ' '),
                                              }),
                                              (0, a.jsx)('span', {
                                                className: 'text-gray-300',
                                                children: e.message,
                                              }),
                                            ],
                                          }),
                                          (0, a.jsx)('button', {
                                            onClick: () => v(e.id),
                                            className: 'text-gray-500 hover:text-white text-sm',
                                            children: 'Dismiss',
                                          }),
                                        ],
                                      },
                                      e.id
                                    )
                                  ),
                                }),
                              ],
                            }),
                          (0, a.jsxs)('div', {
                            className:
                              'bg-gray-900 border border-gray-800 rounded-xl overflow-hidden',
                            children: [
                              (0, a.jsx)('div', {
                                className:
                                  'p-6 border-b border-gray-800 flex justify-between items-center',
                                children: (0, a.jsx)('h3', {
                                  className: 'text-xl font-bold text-white',
                                  children: 'Team Members',
                                }),
                              }),
                              (0, a.jsx)('div', {
                                className: 'overflow-x-auto',
                                children: (0, a.jsxs)('table', {
                                  className: 'w-full text-left',
                                  children: [
                                    (0, a.jsx)('thead', {
                                      children: (0, a.jsxs)('tr', {
                                        className:
                                          'bg-gray-800/50 text-gray-400 text-sm uppercase tracking-wider',
                                        children: [
                                          (0, a.jsx)('th', {
                                            className: 'px-6 py-4',
                                            children: 'Member',
                                          }),
                                          (0, a.jsx)('th', {
                                            className: 'px-6 py-4',
                                            children: 'Progress',
                                          }),
                                          (0, a.jsx)('th', {
                                            className: 'px-6 py-4',
                                            children: 'Last Active',
                                          }),
                                          (0, a.jsx)('th', {
                                            className: 'px-6 py-4 text-right',
                                            children: 'Actions',
                                          }),
                                        ],
                                      }),
                                    }),
                                    (0, a.jsxs)('tbody', {
                                      className: 'divide-y divide-gray-800',
                                      children: [
                                        l.memberStats.map(e =>
                                          (0, a.jsxs)(
                                            'tr',
                                            {
                                              className: 'hover:bg-gray-800/30 transition',
                                              children: [
                                                (0, a.jsx)('td', {
                                                  className: 'px-6 py-4',
                                                  children: (0, a.jsx)('div', {
                                                    className: 'font-medium text-white',
                                                    children: e.userName,
                                                  }),
                                                }),
                                                (0, a.jsx)('td', {
                                                  className: 'px-6 py-4',
                                                  children: (0, a.jsxs)('div', {
                                                    className: 'flex items-center gap-3',
                                                    children: [
                                                      (0, a.jsx)('div', {
                                                        className:
                                                          'w-24 h-2 bg-gray-700 rounded-full overflow-hidden',
                                                        children: (0, a.jsx)('div', {
                                                          className: 'h-full bg-primary-500',
                                                          style: {
                                                            width: ''.concat(e.progress, '%'),
                                                          },
                                                        }),
                                                      }),
                                                      (0, a.jsxs)('span', {
                                                        className: 'text-gray-300 text-sm',
                                                        children: [e.progress, '%'],
                                                      }),
                                                    ],
                                                  }),
                                                }),
                                                (0, a.jsx)('td', {
                                                  className: 'px-6 py-4 text-gray-400 text-sm',
                                                  children: e.lastActiveDate
                                                    ? new Date(
                                                        e.lastActiveDate
                                                      ).toLocaleDateString()
                                                    : 'Never',
                                                }),
                                                (0, a.jsx)('td', {
                                                  className: 'px-6 py-4 text-right',
                                                  children: (0, a.jsx)('button', {
                                                    onClick: () => b(e.userId, e.userName),
                                                    className:
                                                      'text-red-400 hover:text-red-300 text-sm font-medium transition',
                                                    children: 'Remove',
                                                  }),
                                                }),
                                              ],
                                            },
                                            e.memberId
                                          )
                                        ),
                                        0 === l.memberStats.length &&
                                          (0, a.jsx)('tr', {
                                            children: (0, a.jsx)('td', {
                                              colSpan: 4,
                                              className: 'px-6 py-12 text-center text-gray-500',
                                              children:
                                                'No members found. Invite someone to get started!',
                                            }),
                                          }),
                                      ],
                                    }),
                                  ],
                                }),
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, a.jsxs)('div', {
                        className: 'space-y-8',
                        children: [
                          (0, a.jsxs)('div', {
                            className: 'bg-gray-900 border border-gray-800 rounded-xl p-6',
                            children: [
                              (0, a.jsx)('h3', {
                                className: 'text-lg font-bold text-white mb-4',
                                children: 'Invite Member',
                              }),
                              (0, a.jsxs)('form', {
                                onSubmit: y,
                                className: 'space-y-4',
                                children: [
                                  (0, a.jsxs)('div', {
                                    children: [
                                      (0, a.jsx)('label', {
                                        className: 'block text-sm text-gray-400 mb-1',
                                        children: 'Email Address',
                                      }),
                                      (0, a.jsx)('input', {
                                        type: 'email',
                                        required: !0,
                                        value: m,
                                        onChange: e => u(e.target.value),
                                        placeholder: 'colleague@company.com',
                                        className:
                                          'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 transition',
                                      }),
                                    ],
                                  }),
                                  g &&
                                    (0, a.jsx)('div', {
                                      className: 'p-3 rounded text-sm '.concat(
                                        'success' === g.type
                                          ? 'bg-green-900/30 text-green-400'
                                          : 'bg-red-900/30 text-red-400'
                                      ),
                                      children: g.message,
                                    }),
                                  (0, a.jsx)('button', {
                                    type: 'submit',
                                    disabled: h,
                                    className:
                                      'w-full py-2 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-200 transition disabled:opacity-50',
                                    children: h ? 'Sending...' : 'Send Invitation',
                                  }),
                                  (0, a.jsxs)('p', {
                                    className: 'text-xs text-center text-gray-500 mt-2',
                                    children: [
                                      'You have used ',
                                      l.totalMembers,
                                      ' of 10 licenses.',
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          (0, a.jsxs)('div', {
                            className:
                              'bg-gray-900 border border-gray-800 rounded-xl p-6 opacity-60',
                            children: [
                              (0, a.jsx)('h3', {
                                className: 'text-lg font-bold text-gray-400 mb-4',
                                children: 'Team Goals',
                              }),
                              (0, a.jsx)('div', {
                                className: 'text-center py-8 text-gray-600',
                                children: 'Goals feature coming soon',
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              })
            : (0, a.jsxs)('div', {
                className: 'max-w-4xl mx-auto px-4 py-12 text-center text-white',
                children: [
                  (0, a.jsx)('h2', {
                    className: 'text-2xl font-bold mb-4',
                    children: 'No Team Found',
                  }),
                  (0, a.jsx)('p', {
                    className: 'text-gray-400 mb-8',
                    children: "You don't seem to have a corporate team set up yet.",
                  }),
                  (0, a.jsx)('button', {
                    onClick: () => e.push('/dashboard'),
                    className: 'px-6 py-2 bg-gray-800 rounded hover:bg-gray-700 transition',
                    children: 'Back to Dashboard',
                  }),
                ],
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
          return n;
        },
        Sh: function () {
          return d;
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
      let a = s(4859).env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      async function r() {
        return localStorage.getItem('accessToken');
      }
      async function n(e) {
        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
          { method: s = 'GET', body: n, token: o } = t,
          c = null != o ? o : await r(),
          i = { 'Content-Type': 'application/json' };
        c && (i.Authorization = 'Bearer '.concat(c));
        let l = await fetch(''.concat(a).concat(e), {
            method: s,
            headers: i,
            body: n ? JSON.stringify(n) : void 0,
          }),
          d = await l.json();
        if (!l.ok) {
          var m;
          throw Error(
            (null === (m = d.error) || void 0 === m ? void 0 : m.message) || 'Request failed'
          );
        }
        return d;
      }
      let o = {
          getDomains: () => n('/domains'),
          getDomain: e => n('/domains/'.concat(e)),
          getTasks: e => n('/domains/'.concat(e, '/tasks')),
          getStudyGuide: e => n('/domains/tasks/'.concat(e, '/study-guide')),
          markSectionComplete: e =>
            n('/domains/progress/sections/'.concat(e, '/complete'), { method: 'POST' }),
          getProgress: () => n('/domains/progress'),
        },
        c = {
          getFlashcards: e => {
            let t = new URLSearchParams();
            return (
              (null == e ? void 0 : e.domainId) && t.set('domainId', e.domainId),
              (null == e ? void 0 : e.taskId) && t.set('taskId', e.taskId),
              (null == e ? void 0 : e.limit) && t.set('limit', String(e.limit)),
              n('/flashcards?'.concat(t))
            );
          },
          getDueForReview: e => n('/flashcards/review'.concat(e ? '?limit='.concat(e) : '')),
          getStats: () => n('/flashcards/stats'),
          startSession: e => n('/flashcards/sessions', { method: 'POST', body: e }),
          recordResponse: (e, t, s, a) =>
            n('/flashcards/sessions/'.concat(e, '/responses/').concat(t), {
              method: 'POST',
              body: { rating: s, timeSpentMs: a },
            }),
          completeSession: e =>
            n('/flashcards/sessions/'.concat(e, '/complete'), { method: 'POST' }),
          createCustom: e => n('/flashcards/custom', { method: 'POST', body: e }),
        },
        i = {
          startSession: e => n('/practice/sessions', { method: 'POST', body: e }),
          submitAnswer: (e, t, s, a) =>
            n('/practice/sessions/'.concat(e, '/answers/').concat(t), {
              method: 'POST',
              body: { selectedOptionId: s, timeSpentMs: a },
            }),
          completeSession: e => n('/practice/sessions/'.concat(e, '/complete'), { method: 'POST' }),
          startMockExam: () => n('/practice/mock-exams', { method: 'POST' }),
          getFlagged: () => n('/practice/flagged'),
          flagQuestion: e => n('/practice/questions/'.concat(e, '/flag'), { method: 'POST' }),
          unflagQuestion: e => n('/practice/questions/'.concat(e, '/flag'), { method: 'DELETE' }),
          getStats: () => n('/practice/stats'),
        },
        l = {
          getDashboard: () => n('/dashboard'),
          getStreak: () => n('/dashboard/streak'),
          getProgress: () => n('/dashboard/progress'),
          getActivity: e => n('/dashboard/activity'.concat(e ? '?limit='.concat(e) : '')),
          getReviews: e => n('/dashboard/reviews'.concat(e ? '?limit='.concat(e) : '')),
          getWeakAreas: () => n('/dashboard/weak-areas'),
          getReadiness: () => n('/dashboard/readiness'),
          getRecommendations: () => n('/dashboard/recommendations'),
        },
        d = {
          getFormulas: e => n('/formulas'.concat(e ? '?category='.concat(e) : '')),
          getFormula: e => n('/formulas/'.concat(e)),
          calculate: (e, t) =>
            n('/formulas/'.concat(e, '/calculate'), { method: 'POST', body: { inputs: t } }),
          getVariables: () => n('/formulas/variables'),
        };
    },
  },
  function (e) {
    (e.O(0, [293, 528, 744], function () {
      return e((e.s = 1714));
    }),
      (_N_E = e.O()));
  },
]);
