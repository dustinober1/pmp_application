(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [626],
  {
    4005: function (e, t, r) {
      Promise.resolve().then(r.bind(r, 5024));
    },
    8146: function (e, t, r) {
      'use strict';
      r.d(t, {
        default: function () {
          return a.a;
        },
      });
      var n = r(6340),
        a = r.n(n);
    },
    1695: function (e, t, r) {
      'use strict';
      var n = r(1219);
      (r.o(n, 'useParams') &&
        r.d(t, {
          useParams: function () {
            return n.useParams;
          },
        }),
        r.o(n, 'useRouter') &&
          r.d(t, {
            useRouter: function () {
              return n.useRouter;
            },
          }),
        r.o(n, 'useSearchParams') &&
          r.d(t, {
            useSearchParams: function () {
              return n.useSearchParams;
            },
          }));
    },
    4859: function (e, t, r) {
      'use strict';
      var n, a;
      e.exports =
        (null == (n = r.g.process) ? void 0 : n.env) &&
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
                n,
                a = (e.exports = {});
              function s() {
                throw Error('setTimeout has not been defined');
              }
              function o() {
                throw Error('clearTimeout has not been defined');
              }
              function i(e) {
                if (t === setTimeout) return setTimeout(e, 0);
                if ((t === s || !t) && setTimeout) return ((t = setTimeout), setTimeout(e, 0));
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
                  t = 'function' == typeof setTimeout ? setTimeout : s;
                } catch (e) {
                  t = s;
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
                l && n && ((l = !1), n.length ? (c = n.concat(c)) : (u = -1), c.length && f());
              }
              function f() {
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
              function h(e, t) {
                ((this.fun = e), (this.array = t));
              }
              function m() {}
              ((a.nextTick = function (e) {
                var t = Array(arguments.length - 1);
                if (arguments.length > 1)
                  for (var r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
                (c.push(new h(e, t)), 1 !== c.length || l || i(f));
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
          r = {};
        function n(e) {
          var a = r[e];
          if (void 0 !== a) return a.exports;
          var s = (r[e] = { exports: {} }),
            o = !0;
          try {
            (t[e](s, s.exports, n), (o = !1));
          } finally {
            o && delete r[e];
          }
          return s.exports;
        }
        n.ab = '//';
        var a = n(229);
        e.exports = a;
      })();
    },
    5024: function (e, t, r) {
      'use strict';
      (r.r(t),
        r.d(t, {
          default: function () {
            return c;
          },
        }));
      var n = r(7573),
        a = r(7653),
        s = r(1695),
        o = r(8146),
        i = r(7070);
      function c() {
        let e = (0, s.useRouter)(),
          { login: t, isLoading: r } = (0, i.a)(),
          [c, l] = (0, a.useState)(''),
          [u, d] = (0, a.useState)(''),
          [f, h] = (0, a.useState)(''),
          [m, p] = (0, a.useState)(!1),
          v = async r => {
            (r.preventDefault(), h(''), p(!0));
            try {
              (await t(c, u), e.push('/dashboard'));
            } catch (e) {
              h(e instanceof Error ? e.message : 'Login failed');
            } finally {
              p(!1);
            }
          };
        return (0, n.jsxs)('div', {
          className: 'min-h-screen flex items-center justify-center px-4 py-12',
          children: [
            (0, n.jsx)('div', {
              className:
                'absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-purple-600 to-indigo-800 opacity-5',
            }),
            (0, n.jsxs)('div', {
              className: 'card w-full max-w-md animate-slideUp relative',
              children: [
                (0, n.jsxs)('div', {
                  className: 'text-center mb-8',
                  children: [
                    (0, n.jsx)(o.default, {
                      href: '/',
                      className: 'inline-flex items-center gap-2 mb-6',
                      children: (0, n.jsx)('div', {
                        className:
                          'w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center',
                        children: (0, n.jsx)('span', {
                          className: 'text-white font-bold',
                          children: 'PM',
                        }),
                      }),
                    }),
                    (0, n.jsx)('h1', { className: 'text-2xl font-bold', children: 'Welcome Back' }),
                    (0, n.jsx)('p', {
                      className: 'text-[var(--foreground-muted)] mt-2',
                      children: 'Sign in to continue your PMP journey',
                    }),
                  ],
                }),
                (0, n.jsxs)('form', {
                  onSubmit: v,
                  className: 'space-y-4',
                  children: [
                    f &&
                      (0, n.jsx)('div', {
                        className:
                          'p-3 rounded-lg bg-[var(--error-light)] text-[var(--error)] text-sm',
                        children: f,
                      }),
                    (0, n.jsxs)('div', {
                      children: [
                        (0, n.jsx)('label', {
                          htmlFor: 'email',
                          className: 'block text-sm font-medium mb-1',
                          children: 'Email',
                        }),
                        (0, n.jsx)('input', {
                          id: 'email',
                          type: 'email',
                          value: c,
                          onChange: e => l(e.target.value),
                          className: 'input',
                          placeholder: 'you@example.com',
                          required: !0,
                        }),
                      ],
                    }),
                    (0, n.jsxs)('div', {
                      children: [
                        (0, n.jsx)('label', {
                          htmlFor: 'password',
                          className: 'block text-sm font-medium mb-1',
                          children: 'Password',
                        }),
                        (0, n.jsx)('input', {
                          id: 'password',
                          type: 'password',
                          value: u,
                          onChange: e => d(e.target.value),
                          className: 'input',
                          placeholder: '••••••••',
                          required: !0,
                        }),
                      ],
                    }),
                    (0, n.jsxs)('div', {
                      className: 'flex items-center justify-between text-sm',
                      children: [
                        (0, n.jsxs)('label', {
                          className: 'flex items-center gap-2',
                          children: [
                            (0, n.jsx)('input', {
                              type: 'checkbox',
                              className: 'rounded border-[var(--border)]',
                            }),
                            (0, n.jsx)('span', { children: 'Remember me' }),
                          ],
                        }),
                        (0, n.jsx)(o.default, {
                          href: '/forgot-password',
                          className: 'text-[var(--primary)] hover:underline',
                          children: 'Forgot password?',
                        }),
                      ],
                    }),
                    (0, n.jsx)('button', {
                      type: 'submit',
                      disabled: m || r,
                      className: 'btn btn-primary w-full',
                      children: m ? 'Signing in...' : 'Sign In',
                    }),
                  ],
                }),
                (0, n.jsxs)('p', {
                  className: 'text-center text-sm text-[var(--foreground-muted)] mt-6',
                  children: [
                    "Don't have an account?",
                    ' ',
                    (0, n.jsx)(o.default, {
                      href: '/register',
                      className: 'text-[var(--primary)] font-medium hover:underline',
                      children: 'Sign up for free',
                    }),
                  ],
                }),
              ],
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
      var n = r(7573),
        a = r(7653),
        s = r(4859);
      let o = (0, a.createContext)(void 0),
        i = s.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      function c(e) {
        let { children: t } = e,
          [r, s] = (0, a.useState)({ user: null, token: null, isLoading: !0, isAuthenticated: !1 });
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
                let r = await t.json();
                s({ user: r.data.user, token: e, isLoading: !1, isAuthenticated: !0 });
              } else await f();
            } catch (e) {
              (console.error('Failed to fetch user:', e), d());
            }
          },
          l = async (e, t) => {
            let r = await fetch(''.concat(i, '/auth/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: e, password: t }),
              }),
              n = await r.json();
            if (!r.ok) {
              var a;
              throw Error(
                (null === (a = n.error) || void 0 === a ? void 0 : a.message) || 'Login failed'
              );
            }
            let { accessToken: o, refreshToken: c, user: l } = n.data;
            (localStorage.setItem('accessToken', o),
              localStorage.setItem('refreshToken', c),
              s({ user: l, token: o, isLoading: !1, isAuthenticated: !0 }));
          },
          u = async (e, t, r) => {
            let n = await fetch(''.concat(i, '/auth/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: e, password: t, name: r }),
              }),
              a = await n.json();
            if (!n.ok) {
              var o;
              throw Error(
                (null === (o = a.error) || void 0 === o ? void 0 : o.message) ||
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
          f = async () => {
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
                let { accessToken: e, refreshToken: r } = (await t.json()).data;
                (localStorage.setItem('accessToken', e),
                  localStorage.setItem('refreshToken', r),
                  await c(e));
              } else d();
            } catch (e) {
              (console.error('Token refresh failed:', e), d());
            }
          };
        return (0, n.jsx)(o.Provider, {
          value: { ...r, login: l, register: u, logout: d, refreshToken: f },
          children: t,
        });
      }
      function l() {
        let e = (0, a.useContext)(o);
        if (void 0 === e) throw Error('useAuth must be used within an AuthProvider');
        return e;
      }
    },
  },
  function (e) {
    (e.O(0, [340, 293, 528, 744], function () {
      return e((e.s = 4005));
    }),
      (_N_E = e.O()));
  },
]);
