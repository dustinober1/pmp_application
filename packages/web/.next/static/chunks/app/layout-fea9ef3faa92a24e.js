(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [185],
  {
    9901: function (e, t, o) {
      (Promise.resolve().then(o.t.bind(o, 9438, 23)),
        Promise.resolve().then(o.t.bind(o, 2625, 23)),
        Promise.resolve().then(o.bind(o, 1853)));
    },
    4859: function (e, t, o) {
      'use strict';
      var n, a;
      e.exports =
        (null == (n = o.g.process) ? void 0 : n.env) &&
        'object' == typeof (null == (a = o.g.process) ? void 0 : a.env)
          ? o.g.process
          : o(9566);
    },
    9566: function (e) {
      !(function () {
        var t = {
            229: function (e) {
              var t,
                o,
                n,
                a = (e.exports = {});
              function s() {
                throw Error('setTimeout has not been defined');
              }
              function r() {
                throw Error('clearTimeout has not been defined');
              }
              function i(e) {
                if (t === setTimeout) return setTimeout(e, 0);
                if ((t === s || !t) && setTimeout) return ((t = setTimeout), setTimeout(e, 0));
                try {
                  return t(e, 0);
                } catch (o) {
                  try {
                    return t.call(null, e, 0);
                  } catch (o) {
                    return t.call(this, e, 0);
                  }
                }
              }
              !(function () {
                try {
                  t = 'function' == typeof setTimeout ? setTimeout : s;
                } catch (e) {
                  t = s;
                }
                try {
                  o = 'function' == typeof clearTimeout ? clearTimeout : r;
                } catch (e) {
                  o = r;
                }
              })();
              var c = [],
                l = !1,
                u = -1;
              function d() {
                l && n && ((l = !1), n.length ? (c = n.concat(c)) : (u = -1), c.length && h());
              }
              function h() {
                if (!l) {
                  var e = i(d);
                  l = !0;
                  for (var t = c.length; t; ) {
                    for (n = c, c = []; ++u < t; ) n && n[u].run();
                    ((u = -1), (t = c.length));
                  }
                  ((n = null),
                    (l = !1),
                    (function (e) {
                      if (o === clearTimeout) return clearTimeout(e);
                      if ((o === r || !o) && clearTimeout)
                        return ((o = clearTimeout), clearTimeout(e));
                      try {
                        o(e);
                      } catch (t) {
                        try {
                          return o.call(null, e);
                        } catch (t) {
                          return o.call(this, e);
                        }
                      }
                    })(e));
                }
              }
              function f(e, t) {
                ((this.fun = e), (this.array = t));
              }
              function m() {}
              ((a.nextTick = function (e) {
                var t = Array(arguments.length - 1);
                if (arguments.length > 1)
                  for (var o = 1; o < arguments.length; o++) t[o - 1] = arguments[o];
                (c.push(new f(e, t)), 1 !== c.length || l || i(h));
              }),
                (f.prototype.run = function () {
                  this.fun.apply(null, this.array);
                }),
                (a.title = 'browser'),
                (a.browser = !0),
                (a.env = {}),
                (a.argv = []),
                (a.version = ''),
                (a.versions = {}),
                (a.on = m),
                (a.addListener = m),
                (a.once = m),
                (a.off = m),
                (a.removeListener = m),
                (a.removeAllListeners = m),
                (a.emit = m),
                (a.prependListener = m),
                (a.prependOnceListener = m),
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
          o = {};
        function n(e) {
          var a = o[e];
          if (void 0 !== a) return a.exports;
          var s = (o[e] = { exports: {} }),
            r = !0;
          try {
            (t[e](s, s.exports, n), (r = !1));
          } finally {
            r && delete o[e];
          }
          return s.exports;
        }
        n.ab = '//';
        var a = n(229);
        e.exports = a;
      })();
    },
    1853: function (e, t, o) {
      'use strict';
      o.d(t, {
        Providers: function () {
          return c;
        },
      });
      var n = o(7573),
        a = o(7070),
        s = o(5118);
      let r = 'pmp_offline_sync_queue';
      class i {
        loadQueue() {
          let e = localStorage.getItem(r);
          e && (this.queue = JSON.parse(e));
        }
        saveQueue() {
          localStorage.setItem(r, JSON.stringify(this.queue));
        }
        async queueAction(e, t) {
          let o = { id: crypto.randomUUID(), type: e, payload: t, timestamp: Date.now() };
          (this.queue.push(o), this.saveQueue(), navigator.onLine && (await this.sync()));
        }
        async sync() {
          if (this.isSyncing || 0 === this.queue.length || !navigator.onLine) return;
          this.isSyncing = !0;
          let e = [],
            t = [...this.queue];
          for (let o of (console.log('[Sync] Processing '.concat(t.length, ' actions...')), t))
            try {
              await this.processAction(o);
            } catch (t) {
              (console.error('[Sync] Failed to process action '.concat(o.id), t), e.push(o));
            }
          ((this.queue = e),
            this.saveQueue(),
            (this.isSyncing = !1),
            0 === e.length
              ? console.log('[Sync] Synchronization complete.')
              : console.warn('[Sync] Completed with '.concat(e.length, ' failures.')));
        }
        async processAction(e) {
          switch (e.type) {
            case 'MARK_SECTION_COMPLETE':
              await (0, s.Nv)('/study/sections/'.concat(e.payload.sectionId, '/complete'), {
                method: 'POST',
              });
              break;
            case 'SUBMIT_FLASHCARD_RESULT':
              await (0, s.Nv)('/flashcards/'.concat(e.payload.flashcardId, '/review'), {
                method: 'POST',
                body: JSON.stringify({ quality: e.payload.quality }),
              });
              break;
            default:
              console.warn('Unknown action type', e.type);
          }
        }
        constructor() {
          ((this.queue = []),
            (this.isSyncing = !1),
            this.loadQueue(),
            window.addEventListener('online', this.sync.bind(this)));
        }
      }
      function c(e) {
        let { children: t } = e;
        return (0, n.jsx)(a.H, { children: t });
      }
      new i();
    },
    7070: function (e, t, o) {
      'use strict';
      o.d(t, {
        H: function () {
          return c;
        },
        a: function () {
          return l;
        },
      });
      var n = o(7573),
        a = o(7653),
        s = o(4859);
      let r = (0, a.createContext)(void 0),
        i = s.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      function c(e) {
        let { children: t } = e,
          [o, s] = (0, a.useState)({ user: null, token: null, isLoading: !0, isAuthenticated: !1 });
        (0, a.useEffect)(() => {
          let e = localStorage.getItem('accessToken');
          e ? c(e) : s(e => ({ ...e, isLoading: !1 }));
        }, []);
        let c = async e => {
            try {
              let t = await fetch(''.concat(i, '/auth/me'), {
                headers: { Authorization: 'Bearer '.concat(e) },
              });
              if (t.ok) {
                let o = await t.json();
                s({ user: o.data.user, token: e, isLoading: !1, isAuthenticated: !0 });
              } else await h();
            } catch (e) {
              (console.error('Failed to fetch user:', e), d());
            }
          },
          l = async (e, t) => {
            let o = await fetch(''.concat(i, '/auth/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: e, password: t }),
              }),
              n = await o.json();
            if (!o.ok) {
              var a;
              throw Error(
                (null === (a = n.error) || void 0 === a ? void 0 : a.message) || 'Login failed'
              );
            }
            let { accessToken: r, refreshToken: c, user: l } = n.data;
            (localStorage.setItem('accessToken', r),
              localStorage.setItem('refreshToken', c),
              s({ user: l, token: r, isLoading: !1, isAuthenticated: !0 }));
          },
          u = async (e, t, o) => {
            let n = await fetch(''.concat(i, '/auth/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: e, password: t, name: o }),
              }),
              a = await n.json();
            if (!n.ok) {
              var r;
              throw Error(
                (null === (r = a.error) || void 0 === r ? void 0 : r.message) ||
                  'Registration failed'
              );
            }
            let { accessToken: c, refreshToken: l, user: u } = a.data;
            (localStorage.setItem('accessToken', c),
              localStorage.setItem('refreshToken', l),
              s({ user: u, token: c, isLoading: !1, isAuthenticated: !0 }));
          },
          d = () => {
            (localStorage.removeItem('accessToken'),
              localStorage.removeItem('refreshToken'),
              s({ user: null, token: null, isLoading: !1, isAuthenticated: !1 }));
          },
          h = async () => {
            let e = localStorage.getItem('refreshToken');
            if (!e) {
              d();
              return;
            }
            try {
              let t = await fetch(''.concat(i, '/auth/refresh'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: e }),
              });
              if (t.ok) {
                let { accessToken: e, refreshToken: o } = (await t.json()).data;
                (localStorage.setItem('accessToken', e),
                  localStorage.setItem('refreshToken', o),
                  await c(e));
              } else d();
            } catch (e) {
              (console.error('Token refresh failed:', e), d());
            }
          };
        return (0, n.jsx)(r.Provider, {
          value: { ...o, login: l, register: u, logout: d, refreshToken: h },
          children: t,
        });
      }
      function l() {
        let e = (0, a.useContext)(r);
        if (void 0 === e) throw Error('useAuth must be used within an AuthProvider');
        return e;
      }
    },
    5118: function (e, t, o) {
      'use strict';
      o.d(t, {
        Lc: function () {
          return i;
        },
        Nv: function () {
          return s;
        },
        Sh: function () {
          return u;
        },
        kx: function () {
          return l;
        },
        sA: function () {
          return r;
        },
        tF: function () {
          return c;
        },
      });
      let n = o(4859).env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      async function a() {
        return localStorage.getItem('accessToken');
      }
      async function s(e) {
        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
          { method: o = 'GET', body: s, token: r } = t,
          i = null != r ? r : await a(),
          c = { 'Content-Type': 'application/json' };
        i && (c.Authorization = 'Bearer '.concat(i));
        let l = await fetch(''.concat(n).concat(e), {
            method: o,
            headers: c,
            body: s ? JSON.stringify(s) : void 0,
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
      let r = {
          getDomains: () => s('/domains'),
          getDomain: e => s('/domains/'.concat(e)),
          getTasks: e => s('/domains/'.concat(e, '/tasks')),
          getStudyGuide: e => s('/domains/tasks/'.concat(e, '/study-guide')),
          markSectionComplete: e =>
            s('/domains/progress/sections/'.concat(e, '/complete'), { method: 'POST' }),
          getProgress: () => s('/domains/progress'),
        },
        i = {
          getFlashcards: e => {
            let t = new URLSearchParams();
            return (
              (null == e ? void 0 : e.domainId) && t.set('domainId', e.domainId),
              (null == e ? void 0 : e.taskId) && t.set('taskId', e.taskId),
              (null == e ? void 0 : e.limit) && t.set('limit', String(e.limit)),
              s('/flashcards?'.concat(t))
            );
          },
          getDueForReview: e => s('/flashcards/review'.concat(e ? '?limit='.concat(e) : '')),
          getStats: () => s('/flashcards/stats'),
          startSession: e => s('/flashcards/sessions', { method: 'POST', body: e }),
          recordResponse: (e, t, o, n) =>
            s('/flashcards/sessions/'.concat(e, '/responses/').concat(t), {
              method: 'POST',
              body: { rating: o, timeSpentMs: n },
            }),
          completeSession: e =>
            s('/flashcards/sessions/'.concat(e, '/complete'), { method: 'POST' }),
          createCustom: e => s('/flashcards/custom', { method: 'POST', body: e }),
        },
        c = {
          startSession: e => s('/practice/sessions', { method: 'POST', body: e }),
          submitAnswer: (e, t, o, n) =>
            s('/practice/sessions/'.concat(e, '/answers/').concat(t), {
              method: 'POST',
              body: { selectedOptionId: o, timeSpentMs: n },
            }),
          completeSession: e => s('/practice/sessions/'.concat(e, '/complete'), { method: 'POST' }),
          startMockExam: () => s('/practice/mock-exams', { method: 'POST' }),
          getFlagged: () => s('/practice/flagged'),
          flagQuestion: e => s('/practice/questions/'.concat(e, '/flag'), { method: 'POST' }),
          unflagQuestion: e => s('/practice/questions/'.concat(e, '/flag'), { method: 'DELETE' }),
          getStats: () => s('/practice/stats'),
        },
        l = {
          getDashboard: () => s('/dashboard'),
          getStreak: () => s('/dashboard/streak'),
          getProgress: () => s('/dashboard/progress'),
          getActivity: e => s('/dashboard/activity'.concat(e ? '?limit='.concat(e) : '')),
          getReviews: e => s('/dashboard/reviews'.concat(e ? '?limit='.concat(e) : '')),
          getWeakAreas: () => s('/dashboard/weak-areas'),
          getReadiness: () => s('/dashboard/readiness'),
          getRecommendations: () => s('/dashboard/recommendations'),
        },
        u = {
          getFormulas: e => s('/formulas'.concat(e ? '?category='.concat(e) : '')),
          getFormula: e => s('/formulas/'.concat(e)),
          calculate: (e, t) =>
            s('/formulas/'.concat(e, '/calculate'), { method: 'POST', body: { inputs: t } }),
          getVariables: () => s('/formulas/variables'),
        };
    },
    2625: function () {},
    9438: function (e) {
      e.exports = {
        style: { fontFamily: "'__Inter_f367f3', '__Inter_Fallback_f367f3'", fontStyle: 'normal' },
        className: '__className_f367f3',
      };
    },
  },
  function (e) {
    (e.O(0, [31, 293, 528, 744], function () {
      return e((e.s = 9901));
    }),
      (_N_E = e.O()));
  },
]);
