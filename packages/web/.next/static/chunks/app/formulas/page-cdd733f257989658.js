(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [87],
  {
    877: function (e, a, t) {
      Promise.resolve().then(t.bind(t, 2298));
    },
    2298: function (e, a, t) {
      'use strict';
      (t.r(a),
        t.d(a, {
          default: function () {
            return d;
          },
        }));
      var s = t(7573),
        r = t(7653),
        l = t(1695),
        n = t(7070),
        i = t(6973),
        c = t(5118);
      function d() {
        var e;
        let a = (0, l.useRouter)(),
          { user: t, isAuthenticated: d, isLoading: o } = (0, n.a)(),
          [m, u] = (0, r.useState)([]),
          [x, h] = (0, r.useState)('all'),
          [p, v] = (0, r.useState)(null),
          [f, g] = (0, r.useState)({}),
          [j, N] = (0, r.useState)(null),
          [b, y] = (0, r.useState)(!0),
          [w, S] = (0, r.useState)(!1);
        ((0, r.useEffect)(() => {
          o || d || a.push('/login');
        }, [o, d, a]),
          (0, r.useEffect)(() => {
            d && C();
          }, [d]));
        let C = async () => {
            try {
              var e;
              let a = await c.Sh.getFormulas();
              u((null === (e = a.data) || void 0 === e ? void 0 : e.formulas) || []);
            } catch (e) {
              console.error('Failed to fetch formulas:', e);
            } finally {
              y(!1);
            }
          },
          k = async () => {
            if (p) {
              (S(!0), N(null));
              try {
                var e;
                let a = {};
                for (let [e, t] of Object.entries(f)) a[e] = parseFloat(t) || 0;
                let t = await c.Sh.calculate(p.id, a);
                N(null === (e = t.data) || void 0 === e ? void 0 : e.result);
              } catch (e) {
                console.error('Calculation failed:', e);
              } finally {
                S(!1);
              }
            }
          },
          E = ['all', ...new Set(m.map(e => e.category))],
          _ = 'all' === x ? m : m.filter(e => e.category === x),
          F =
            (null == t ? void 0 : t.tier) === 'high-end' ||
            (null == t ? void 0 : t.tier) === 'corporate';
        return o || b
          ? (0, s.jsx)('div', {
              className: 'min-h-screen flex items-center justify-center',
              children: (0, s.jsx)('div', {
                className: 'animate-pulse text-[var(--foreground-muted)]',
                children: 'Loading...',
              }),
            })
          : (0, s.jsxs)('div', {
              className: 'min-h-screen',
              children: [
                (0, s.jsx)(i.w, {}),
                (0, s.jsxs)('main', {
                  className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
                  children: [
                    (0, s.jsxs)('div', {
                      className: 'mb-8',
                      children: [
                        (0, s.jsx)('h1', {
                          className: 'text-2xl font-bold',
                          children: 'Formula Reference',
                        }),
                        (0, s.jsx)('p', {
                          className: 'text-[var(--foreground-muted)]',
                          children: 'Essential PMP formulas with interactive calculator.',
                        }),
                      ],
                    }),
                    (0, s.jsx)('div', {
                      className: 'flex flex-wrap gap-2 mb-6',
                      children: E.map(e =>
                        (0, s.jsx)(
                          'button',
                          {
                            onClick: () => h(e),
                            className:
                              'px-4 py-2 rounded-lg text-sm font-medium capitalize transition '.concat(
                                x === e
                                  ? 'bg-[var(--primary)] text-white'
                                  : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)]'
                              ),
                            children: e.replace('_', ' '),
                          },
                          e
                        )
                      ),
                    }),
                    (0, s.jsxs)('div', {
                      className: 'grid lg:grid-cols-3 gap-6',
                      children: [
                        (0, s.jsx)('div', {
                          className: 'lg:col-span-2',
                          children: (0, s.jsx)('div', {
                            className: 'grid gap-4',
                            children: _.map(e =>
                              (0, s.jsxs)(
                                'div',
                                {
                                  className: 'card cursor-pointer transition '.concat(
                                    (null == p ? void 0 : p.id) === e.id
                                      ? 'ring-2 ring-[var(--primary)]'
                                      : 'hover:border-[var(--primary)]'
                                  ),
                                  onClick: () => {
                                    (v(e), g({}), N(null));
                                  },
                                  children: [
                                    (0, s.jsxs)('div', {
                                      className: 'flex items-start justify-between',
                                      children: [
                                        (0, s.jsxs)('div', {
                                          children: [
                                            (0, s.jsx)('h3', {
                                              className: 'font-semibold',
                                              children: e.name,
                                            }),
                                            (0, s.jsx)('p', {
                                              className:
                                                'text-lg font-mono text-[var(--primary)] mt-1',
                                              children: e.expression,
                                            }),
                                          ],
                                        }),
                                        (0, s.jsx)('span', {
                                          className: 'badge badge-primary capitalize',
                                          children: e.category.replace('_', ' '),
                                        }),
                                      ],
                                    }),
                                    (0, s.jsx)('p', {
                                      className: 'text-sm text-[var(--foreground-muted)] mt-3',
                                      children: e.description,
                                    }),
                                    (0, s.jsxs)('p', {
                                      className: 'text-xs text-[var(--foreground-muted)] mt-2',
                                      children: [
                                        (0, s.jsx)('strong', { children: 'When to use:' }),
                                        ' ',
                                        e.whenToUse,
                                      ],
                                    }),
                                  ],
                                },
                                e.id
                              )
                            ),
                          }),
                        }),
                        (0, s.jsx)('div', {
                          children: (0, s.jsxs)('div', {
                            className: 'card sticky top-24',
                            children: [
                              (0, s.jsx)('h2', {
                                className: 'font-semibold mb-4',
                                children: 'Calculator',
                              }),
                              F
                                ? p
                                  ? (0, s.jsxs)('div', {
                                      children: [
                                        (0, s.jsx)('p', {
                                          className: 'text-sm font-medium mb-2',
                                          children: p.name,
                                        }),
                                        (0, s.jsx)('p', {
                                          className: 'text-lg font-mono text-[var(--primary)] mb-4',
                                          children: p.expression,
                                        }),
                                        (0, s.jsx)('div', {
                                          className: 'space-y-3 mb-4',
                                          children: (function (e) {
                                            let a = e.split('=');
                                            return a.length < 2
                                              ? []
                                              : [...new Set((a[1] || '').match(/[A-Z]+/g) || [])];
                                          })(p.expression).map(e =>
                                            (0, s.jsxs)(
                                              'div',
                                              {
                                                children: [
                                                  (0, s.jsx)('label', {
                                                    className: 'block text-sm font-medium mb-1',
                                                    children: e,
                                                  }),
                                                  (0, s.jsx)('input', {
                                                    type: 'number',
                                                    value: f[e] || '',
                                                    onChange: a =>
                                                      g(t => ({ ...t, [e]: a.target.value })),
                                                    className: 'input',
                                                    placeholder: 'Enter '.concat(e),
                                                  }),
                                                ],
                                              },
                                              e
                                            )
                                          ),
                                        }),
                                        (0, s.jsx)('button', {
                                          onClick: k,
                                          disabled: w,
                                          className: 'btn btn-primary w-full',
                                          children: w ? 'Calculating...' : 'Calculate',
                                        }),
                                        j &&
                                          (0, s.jsxs)('div', {
                                            className: 'mt-4 p-4 bg-[var(--secondary)] rounded-lg',
                                            children: [
                                              (0, s.jsx)('p', {
                                                className:
                                                  'text-sm font-medium text-[var(--foreground-muted)]',
                                                children: 'Result',
                                              }),
                                              (0, s.jsx)('p', {
                                                className:
                                                  'text-2xl font-bold text-[var(--primary)]',
                                                children: j.result.toFixed(2),
                                              }),
                                              (0, s.jsx)('p', {
                                                className: 'text-sm mt-2',
                                                children: j.interpretation,
                                              }),
                                              (null === (e = j.steps) || void 0 === e
                                                ? void 0
                                                : e.length) > 0 &&
                                                (0, s.jsxs)('div', {
                                                  className:
                                                    'mt-4 pt-4 border-t border-[var(--border)]',
                                                  children: [
                                                    (0, s.jsx)('p', {
                                                      className:
                                                        'text-xs font-medium text-[var(--foreground-muted)] mb-2',
                                                      children: 'Steps',
                                                    }),
                                                    j.steps.map((e, a) =>
                                                      (0, s.jsxs)(
                                                        'p',
                                                        {
                                                          className: 'text-xs font-mono',
                                                          children: [e.expression, ' = ', e.value],
                                                        },
                                                        a
                                                      )
                                                    ),
                                                  ],
                                                }),
                                            ],
                                          }),
                                      ],
                                    })
                                  : (0, s.jsx)('p', {
                                      className:
                                        'text-sm text-[var(--foreground-muted)] text-center py-8',
                                      children: 'Select a formula to use the calculator',
                                    })
                                : (0, s.jsxs)('div', {
                                    className: 'text-center py-8',
                                    children: [
                                      (0, s.jsx)('p', {
                                        className: 'text-[var(--foreground-muted)] mb-4',
                                        children:
                                          'Interactive calculator is available for High-End and Corporate tiers.',
                                      }),
                                      (0, s.jsx)('button', {
                                        className: 'btn btn-primary',
                                        children: 'Upgrade Now',
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
              ],
            });
      }
    },
  },
  function (e) {
    (e.O(0, [340, 973, 293, 528, 744], function () {
      return e((e.s = 877));
    }),
      (_N_E = e.O()));
  },
]);
