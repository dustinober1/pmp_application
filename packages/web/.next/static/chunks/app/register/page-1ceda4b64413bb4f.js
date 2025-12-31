(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [11],
  {
    7360: function (e, t, r) {
      Promise.resolve().then(r.bind(r, 6088));
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
      r.o(n, 'useRouter') &&
        r.d(t, {
          useRouter: function () {
            return n.useRouter;
          },
        });
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
              var l = [],
                c = !1,
                u = -1;
              function d() {
                c && n && ((c = !1), n.length ? (l = n.concat(l)) : (u = -1), l.length && m());
              }
              function m() {
                if (!c) {
                  var e = i(d);
                  c = !0;
                  for (var t = l.length; t; ) {
                    for (n = l, l = []; ++u < t; ) n && n[u].run();
                    ((u = -1), (t = l.length));
                  }
                  ((n = null),
                    (c = !1),
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
              function f() {}
              ((a.nextTick = function (e) {
                var t = Array(arguments.length - 1);
                if (arguments.length > 1)
                  for (var r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
                (l.push(new h(e, t)), 1 !== l.length || c || i(m));
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
    6088: function (e, t, r) {
      'use strict';
      (r.r(t),
        r.d(t, {
          default: function () {
            return l;
          },
        }));
      var n = r(7573),
        a = r(7653),
        s = r(1695),
        o = r(8146),
        i = r(7070);
      function l() {
        let e = (0, s.useRouter)(),
          { register: t, isLoading: r } = (0, i.a)(),
          [l, c] = (0, a.useState)(''),
          [u, d] = (0, a.useState)(''),
          [m, h] = (0, a.useState)(''),
          [f, p] = (0, a.useState)(''),
          [v, x] = (0, a.useState)(''),
          [g, y] = (0, a.useState)(!1),
          b = async r => {
            if ((r.preventDefault(), x(''), m !== f)) {
              x('Passwords do not match');
              return;
            }
            if (m.length < 8) {
              x('Password must be at least 8 characters');
              return;
            }
            y(!0);
            try {
              (await t(u, m, l), e.push('/dashboard'));
            } catch (e) {
              x(e instanceof Error ? e.message : 'Registration failed');
            } finally {
              y(!1);
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
                    (0, n.jsx)('h1', {
                      className: 'text-2xl font-bold',
                      children: 'Create Your Account',
                    }),
                    (0, n.jsx)('p', {
                      className: 'text-[var(--foreground-muted)] mt-2',
                      children: 'Start your PMP certification journey today',
                    }),
                  ],
                }),
                (0, n.jsxs)('form', {
                  onSubmit: b,
                  className: 'space-y-4',
                  children: [
                    v &&
                      (0, n.jsx)('div', {
                        className:
                          'p-3 rounded-lg bg-[var(--error-light)] text-[var(--error)] text-sm',
                        children: v,
                      }),
                    (0, n.jsxs)('div', {
                      children: [
                        (0, n.jsx)('label', {
                          htmlFor: 'name',
                          className: 'block text-sm font-medium mb-1',
                          children: 'Full Name',
                        }),
                        (0, n.jsx)('input', {
                          id: 'name',
                          type: 'text',
                          value: l,
                          onChange: e => c(e.target.value),
                          className: 'input',
                          placeholder: 'John Doe',
                          required: !0,
                        }),
                      ],
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
                          value: u,
                          onChange: e => d(e.target.value),
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
                          value: m,
                          onChange: e => h(e.target.value),
                          className: 'input',
                          placeholder: '••••••••',
                          required: !0,
                          minLength: 8,
                        }),
                        (0, n.jsx)('p', {
                          className: 'text-xs text-[var(--foreground-muted)] mt-1',
                          children: 'Minimum 8 characters',
                        }),
                      ],
                    }),
                    (0, n.jsxs)('div', {
                      children: [
                        (0, n.jsx)('label', {
                          htmlFor: 'confirmPassword',
                          className: 'block text-sm font-medium mb-1',
                          children: 'Confirm Password',
                        }),
                        (0, n.jsx)('input', {
                          id: 'confirmPassword',
                          type: 'password',
                          value: f,
                          onChange: e => p(e.target.value),
                          className: 'input',
                          placeholder: '••••••••',
                          required: !0,
                        }),
                      ],
                    }),
                    (0, n.jsxs)('div', {
                      className: 'flex items-start gap-2 text-sm',
                      children: [
                        (0, n.jsx)('input', {
                          type: 'checkbox',
                          className: 'rounded border-[var(--border)] mt-1',
                          required: !0,
                        }),
                        (0, n.jsxs)('span', {
                          className: 'text-[var(--foreground-muted)]',
                          children: [
                            'I agree to the',
                            ' ',
                            (0, n.jsx)(o.default, {
                              href: '/terms',
                              className: 'text-[var(--primary)] hover:underline',
                              children: 'Terms of Service',
                            }),
                            ' ',
                            'and',
                            ' ',
                            (0, n.jsx)(o.default, {
                              href: '/privacy',
                              className: 'text-[var(--primary)] hover:underline',
                              children: 'Privacy Policy',
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, n.jsx)('button', {
                      type: 'submit',
                      disabled: g || r,
                      className: 'btn btn-primary w-full',
                      children: g ? 'Creating account...' : 'Create Account',
                    }),
                  ],
                }),
                (0, n.jsxs)('p', {
                  className: 'text-center text-sm text-[var(--foreground-muted)] mt-6',
                  children: [
                    'Already have an account?',
                    ' ',
                    (0, n.jsx)(o.default, {
                      href: '/login',
                      className: 'text-[var(--primary)] font-medium hover:underline',
                      children: 'Sign in',
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
          return l;
        },
        a: function () {
          return c;
        },
      });
      var n = r(7573),
        a = r(7653),
        s = r(4859);
      let o = (0, a.createContext)(void 0),
        i = s.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      function l(e) {
        let { children: t } = e,
          [r, s] = (0, a.useState)({ user: null, token: null, isLoading: !0, isAuthenticated: !1 });
        (0, a.useEffect)(() => {
          let e = localStorage.getItem('accessToken');
          e ? l(e) : s(e => ({ ...e, isLoading: !1 }));
        }, []);
        let l = async e => {
            try {
              let t = await fetch(''.concat(i, '/auth/me'), {
                headers: { Authorization: 'Bearer '.concat(e) },
              });
              if (t.ok) {
                let r = await t.json();
                s({ user: r.data.user, token: e, isLoading: !1, isAuthenticated: !0 });
              } else await m();
            } catch (e) {
              (console.error('Failed to fetch user:', e), d());
            }
          },
          c = async (e, t) => {
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
            let { accessToken: o, refreshToken: l, user: c } = n.data;
            (localStorage.setItem('accessToken', o),
              localStorage.setItem('refreshToken', l),
              s({ user: c, token: o, isLoading: !1, isAuthenticated: !0 }));
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
            let { accessToken: l, refreshToken: c, user: u } = a.data;
            (localStorage.setItem('accessToken', l),
              localStorage.setItem('refreshToken', c),
              s({ user: u, token: l, isLoading: !1, isAuthenticated: !0 }));
          },
          d = () => {
            (localStorage.removeItem('accessToken'),
              localStorage.removeItem('refreshToken'),
              s({ user: null, token: null, isLoading: !1, isAuthenticated: !1 }));
          },
          m = async () => {
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
                  await l(e));
              } else d();
            } catch (e) {
              (console.error('Token refresh failed:', e), d());
            }
          };
        return (0, n.jsx)(o.Provider, {
          value: { ...r, login: c, register: u, logout: d, refreshToken: m },
          children: t,
        });
      }
      function c() {
        let e = (0, a.useContext)(o);
        if (void 0 === e) throw Error('useAuth must be used within an AuthProvider');
        return e;
      }
    },
  },
  function (e) {
    (e.O(0, [340, 293, 528, 744], function () {
      return e((e.s = 7360));
    }),
      (_N_E = e.O()));
  },
]);
