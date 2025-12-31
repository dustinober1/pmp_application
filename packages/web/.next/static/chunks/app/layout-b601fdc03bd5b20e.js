(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [185],
  {
    9901: function (e, t, r) {
      (Promise.resolve().then(r.t.bind(r, 9438, 23)),
        Promise.resolve().then(r.t.bind(r, 2625, 23)),
        Promise.resolve().then(r.bind(r, 9799)));
    },
    4859: function (e, t, r) {
      'use strict';
      var n, o;
      e.exports =
        (null == (n = r.g.process) ? void 0 : n.env) &&
        'object' == typeof (null == (o = r.g.process) ? void 0 : o.env)
          ? r.g.process
          : r(9566);
    },
    9566: function (e) {
      !(function () {
        var t = {
            229: function (e) {
              var t,
                r,
                n,
                o = (e.exports = {});
              function i() {
                throw Error('setTimeout has not been defined');
              }
              function a() {
                throw Error('clearTimeout has not been defined');
              }
              function s(e) {
                if (t === setTimeout) return setTimeout(e, 0);
                if ((t === i || !t) && setTimeout) return ((t = setTimeout), setTimeout(e, 0));
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
                  t = 'function' == typeof setTimeout ? setTimeout : i;
                } catch (e) {
                  t = i;
                }
                try {
                  r = 'function' == typeof clearTimeout ? clearTimeout : a;
                } catch (e) {
                  r = a;
                }
              })();
              var c = [],
                u = !1,
                l = -1;
              function f() {
                u && n && ((u = !1), n.length ? (c = n.concat(c)) : (l = -1), c.length && h());
              }
              function h() {
                if (!u) {
                  var e = s(f);
                  u = !0;
                  for (var t = c.length; t; ) {
                    for (n = c, c = []; ++l < t; ) n && n[l].run();
                    ((l = -1), (t = c.length));
                  }
                  ((n = null),
                    (u = !1),
                    (function (e) {
                      if (r === clearTimeout) return clearTimeout(e);
                      if ((r === a || !r) && clearTimeout)
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
              function d(e, t) {
                ((this.fun = e), (this.array = t));
              }
              function m() {}
              ((o.nextTick = function (e) {
                var t = Array(arguments.length - 1);
                if (arguments.length > 1)
                  for (var r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
                (c.push(new d(e, t)), 1 !== c.length || u || s(h));
              }),
                (d.prototype.run = function () {
                  this.fun.apply(null, this.array);
                }),
                (o.title = 'browser'),
                (o.browser = !0),
                (o.env = {}),
                (o.argv = []),
                (o.version = ''),
                (o.versions = {}),
                (o.on = m),
                (o.addListener = m),
                (o.once = m),
                (o.off = m),
                (o.removeListener = m),
                (o.removeAllListeners = m),
                (o.emit = m),
                (o.prependListener = m),
                (o.prependOnceListener = m),
                (o.listeners = function (e) {
                  return [];
                }),
                (o.binding = function (e) {
                  throw Error('process.binding is not supported');
                }),
                (o.cwd = function () {
                  return '/';
                }),
                (o.chdir = function (e) {
                  throw Error('process.chdir is not supported');
                }),
                (o.umask = function () {
                  return 0;
                }));
            },
          },
          r = {};
        function n(e) {
          var o = r[e];
          if (void 0 !== o) return o.exports;
          var i = (r[e] = { exports: {} }),
            a = !0;
          try {
            (t[e](i, i.exports, n), (a = !1));
          } finally {
            a && delete r[e];
          }
          return i.exports;
        }
        n.ab = '//';
        var o = n(229);
        e.exports = o;
      })();
    },
    9799: function (e, t, r) {
      'use strict';
      r.d(t, {
        Providers: function () {
          return i;
        },
      });
      var n = r(7573),
        o = r(7070);
      function i(e) {
        let { children: t } = e;
        return (0, n.jsx)(o.H, { children: t });
      }
    },
    7070: function (e, t, r) {
      'use strict';
      r.d(t, {
        H: function () {
          return c;
        },
        a: function () {
          return u;
        },
      });
      var n = r(7573),
        o = r(7653),
        i = r(4859);
      let a = (0, o.createContext)(void 0),
        s = i.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      function c(e) {
        let { children: t } = e,
          [r, i] = (0, o.useState)({ user: null, token: null, isLoading: !0, isAuthenticated: !1 });
        (0, o.useEffect)(() => {
          let e = localStorage.getItem('accessToken');
          e ? c(e) : i(e => ({ ...e, isLoading: !1 }));
        }, []);
        let c = async e => {
            try {
              let t = await fetch(''.concat(s, '/auth/me'), {
                headers: { Authorization: 'Bearer '.concat(e) },
              });
              if (t.ok) {
                let r = await t.json();
                i({ user: r.data.user, token: e, isLoading: !1, isAuthenticated: !0 });
              } else await h();
            } catch (e) {
              (console.error('Failed to fetch user:', e), f());
            }
          },
          u = async (e, t) => {
            let r = await fetch(''.concat(s, '/auth/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: e, password: t }),
              }),
              n = await r.json();
            if (!r.ok) {
              var o;
              throw Error(
                (null === (o = n.error) || void 0 === o ? void 0 : o.message) || 'Login failed'
              );
            }
            let { accessToken: a, refreshToken: c, user: u } = n.data;
            (localStorage.setItem('accessToken', a),
              localStorage.setItem('refreshToken', c),
              i({ user: u, token: a, isLoading: !1, isAuthenticated: !0 }));
          },
          l = async (e, t, r) => {
            let n = await fetch(''.concat(s, '/auth/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: e, password: t, name: r }),
              }),
              o = await n.json();
            if (!n.ok) {
              var a;
              throw Error(
                (null === (a = o.error) || void 0 === a ? void 0 : a.message) ||
                  'Registration failed'
              );
            }
            let { accessToken: c, refreshToken: u, user: l } = o.data;
            (localStorage.setItem('accessToken', c),
              localStorage.setItem('refreshToken', u),
              i({ user: l, token: c, isLoading: !1, isAuthenticated: !0 }));
          },
          f = () => {
            (localStorage.removeItem('accessToken'),
              localStorage.removeItem('refreshToken'),
              i({ user: null, token: null, isLoading: !1, isAuthenticated: !1 }));
          },
          h = async () => {
            let e = localStorage.getItem('refreshToken');
            if (!e) {
              f();
              return;
            }
            try {
              let t = await fetch(''.concat(s, '/auth/refresh'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: e }),
              });
              if (t.ok) {
                let { accessToken: e, refreshToken: r } = (await t.json()).data;
                (localStorage.setItem('accessToken', e),
                  localStorage.setItem('refreshToken', r),
                  await c(e));
              } else f();
            } catch (e) {
              (console.error('Token refresh failed:', e), f());
            }
          };
        return (0, n.jsx)(a.Provider, {
          value: { ...r, login: u, register: l, logout: f, refreshToken: h },
          children: t,
        });
      }
      function u() {
        let e = (0, o.useContext)(a);
        if (void 0 === e) throw Error('useAuth must be used within an AuthProvider');
        return e;
      }
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
