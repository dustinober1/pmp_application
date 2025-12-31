(() => {
  var e = {};
  ((e.id = 87),
    (e.ids = [87]),
    (e.modules = {
      2934: e => {
        'use strict';
        e.exports = require('next/dist/client/components/action-async-storage.external.js');
      },
      4580: e => {
        'use strict';
        e.exports = require('next/dist/client/components/request-async-storage.external.js');
      },
      5869: e => {
        'use strict';
        e.exports = require('next/dist/client/components/static-generation-async-storage.external.js');
      },
      399: e => {
        'use strict';
        e.exports = require('next/dist/compiled/next-server/app-page.runtime.prod.js');
      },
      7303: (e, s, t) => {
        'use strict';
        (t.r(s),
          t.d(s, {
            GlobalError: () => n.a,
            __next_app__: () => p,
            originalPathname: () => m,
            pages: () => d,
            routeModule: () => u,
            tree: () => c,
          }),
          t(2511),
          t(4773),
          t(7824));
        var a = t(3282),
          r = t(5736),
          l = t(3906),
          n = t.n(l),
          i = t(6880),
          o = {};
        for (let e in i)
          0 >
            [
              'default',
              'tree',
              'pages',
              'GlobalError',
              'originalPathname',
              '__next_app__',
              'routeModule',
            ].indexOf(e) && (o[e] = () => i[e]);
        t.d(s, o);
        let c = [
            '',
            {
              children: [
                'formulas',
                {
                  children: [
                    '__PAGE__',
                    {},
                    {
                      page: [
                        () => Promise.resolve().then(t.bind(t, 2511)),
                        '/Users/dustinober/Projects/pmp_application/packages/web/src/app/formulas/page.tsx',
                      ],
                    },
                  ],
                },
                {},
              ],
            },
            {
              layout: [
                () => Promise.resolve().then(t.bind(t, 4773)),
                '/Users/dustinober/Projects/pmp_application/packages/web/src/app/layout.tsx',
              ],
              'not-found': [
                () => Promise.resolve().then(t.t.bind(t, 7824, 23)),
                'next/dist/client/components/not-found-error',
              ],
            },
          ],
          d = ['/Users/dustinober/Projects/pmp_application/packages/web/src/app/formulas/page.tsx'],
          m = '/formulas/page',
          p = { require: t, loadChunk: () => Promise.resolve() },
          u = new a.AppPageRouteModule({
            definition: {
              kind: r.x.APP_PAGE,
              page: '/formulas/page',
              pathname: '/formulas',
              bundlePath: '',
              filename: '',
              appPaths: [],
            },
            userland: { loaderTree: c },
          });
      },
      5184: (e, s, t) => {
        Promise.resolve().then(t.bind(t, 2586));
      },
      2586: (e, s, t) => {
        'use strict';
        (t.r(s), t.d(s, { default: () => c }));
        var a = t(3227),
          r = t(3677),
          l = t(1043),
          n = t(2278),
          i = t(7705),
          o = t(7674);
        function c() {
          (0, l.useRouter)();
          let { user: e, isAuthenticated: s, isLoading: t } = (0, n.a)(),
            [c, d] = (0, r.useState)([]),
            [m, p] = (0, r.useState)('all'),
            [u, x] = (0, r.useState)(null),
            [h, g] = (0, r.useState)({}),
            [v, f] = (0, r.useState)(null),
            [j, b] = (0, r.useState)(!0),
            [N, y] = (0, r.useState)(!1),
            P = async () => {
              if (u) {
                (y(!0), f(null));
                try {
                  let e = {};
                  for (let [s, t] of Object.entries(h)) e[s] = parseFloat(t) || 0;
                  let s = await o.Sh.calculate(u.id, e);
                  f(s.data?.result);
                } catch (e) {
                  console.error('Calculation failed:', e);
                } finally {
                  y(!1);
                }
              }
            },
            _ = ['all', ...new Set(c.map(e => e.category))],
            w = 'all' === m ? c : c.filter(e => e.category === m),
            S = e?.tier === 'high-end' || e?.tier === 'corporate';
          return t || j
            ? a.jsx('div', {
                className: 'min-h-screen flex items-center justify-center',
                children: a.jsx('div', {
                  className: 'animate-pulse text-[var(--foreground-muted)]',
                  children: 'Loading...',
                }),
              })
            : (0, a.jsxs)('div', {
                className: 'min-h-screen',
                children: [
                  a.jsx(i.w, {}),
                  (0, a.jsxs)('main', {
                    className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
                    children: [
                      (0, a.jsxs)('div', {
                        className: 'mb-8',
                        children: [
                          a.jsx('h1', {
                            className: 'text-2xl font-bold',
                            children: 'Formula Reference',
                          }),
                          a.jsx('p', {
                            className: 'text-[var(--foreground-muted)]',
                            children: 'Essential PMP formulas with interactive calculator.',
                          }),
                        ],
                      }),
                      a.jsx('div', {
                        className: 'flex flex-wrap gap-2 mb-6',
                        children: _.map(e =>
                          a.jsx(
                            'button',
                            {
                              onClick: () => p(e),
                              className: `px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${m === e ? 'bg-[var(--primary)] text-white' : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)]'}`,
                              children: e.replace('_', ' '),
                            },
                            e
                          )
                        ),
                      }),
                      (0, a.jsxs)('div', {
                        className: 'grid lg:grid-cols-3 gap-6',
                        children: [
                          a.jsx('div', {
                            className: 'lg:col-span-2',
                            children: a.jsx('div', {
                              className: 'grid gap-4',
                              children: w.map(e =>
                                (0, a.jsxs)(
                                  'div',
                                  {
                                    className: `card cursor-pointer transition ${u?.id === e.id ? 'ring-2 ring-[var(--primary)]' : 'hover:border-[var(--primary)]'}`,
                                    onClick: () => {
                                      (x(e), g({}), f(null));
                                    },
                                    children: [
                                      (0, a.jsxs)('div', {
                                        className: 'flex items-start justify-between',
                                        children: [
                                          (0, a.jsxs)('div', {
                                            children: [
                                              a.jsx('h3', {
                                                className: 'font-semibold',
                                                children: e.name,
                                              }),
                                              a.jsx('p', {
                                                className:
                                                  'text-lg font-mono text-[var(--primary)] mt-1',
                                                children: e.expression,
                                              }),
                                            ],
                                          }),
                                          a.jsx('span', {
                                            className: 'badge badge-primary capitalize',
                                            children: e.category.replace('_', ' '),
                                          }),
                                        ],
                                      }),
                                      a.jsx('p', {
                                        className: 'text-sm text-[var(--foreground-muted)] mt-3',
                                        children: e.description,
                                      }),
                                      (0, a.jsxs)('p', {
                                        className: 'text-xs text-[var(--foreground-muted)] mt-2',
                                        children: [
                                          a.jsx('strong', { children: 'When to use:' }),
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
                          a.jsx('div', {
                            children: (0, a.jsxs)('div', {
                              className: 'card sticky top-24',
                              children: [
                                a.jsx('h2', {
                                  className: 'font-semibold mb-4',
                                  children: 'Calculator',
                                }),
                                S
                                  ? u
                                    ? (0, a.jsxs)('div', {
                                        children: [
                                          a.jsx('p', {
                                            className: 'text-sm font-medium mb-2',
                                            children: u.name,
                                          }),
                                          a.jsx('p', {
                                            className:
                                              'text-lg font-mono text-[var(--primary)] mb-4',
                                            children: u.expression,
                                          }),
                                          a.jsx('div', {
                                            className: 'space-y-3 mb-4',
                                            children: (function (e) {
                                              let s = e.split('=');
                                              return s.length < 2
                                                ? []
                                                : [...new Set((s[1] || '').match(/[A-Z]+/g) || [])];
                                            })(u.expression).map(e =>
                                              (0, a.jsxs)(
                                                'div',
                                                {
                                                  children: [
                                                    a.jsx('label', {
                                                      className: 'block text-sm font-medium mb-1',
                                                      children: e,
                                                    }),
                                                    a.jsx('input', {
                                                      type: 'number',
                                                      value: h[e] || '',
                                                      onChange: s =>
                                                        g(t => ({ ...t, [e]: s.target.value })),
                                                      className: 'input',
                                                      placeholder: `Enter ${e}`,
                                                    }),
                                                  ],
                                                },
                                                e
                                              )
                                            ),
                                          }),
                                          a.jsx('button', {
                                            onClick: P,
                                            disabled: N,
                                            className: 'btn btn-primary w-full',
                                            children: N ? 'Calculating...' : 'Calculate',
                                          }),
                                          v &&
                                            (0, a.jsxs)('div', {
                                              className:
                                                'mt-4 p-4 bg-[var(--secondary)] rounded-lg',
                                              children: [
                                                a.jsx('p', {
                                                  className:
                                                    'text-sm font-medium text-[var(--foreground-muted)]',
                                                  children: 'Result',
                                                }),
                                                a.jsx('p', {
                                                  className:
                                                    'text-2xl font-bold text-[var(--primary)]',
                                                  children: v.result.toFixed(2),
                                                }),
                                                a.jsx('p', {
                                                  className: 'text-sm mt-2',
                                                  children: v.interpretation,
                                                }),
                                                v.steps?.length > 0 &&
                                                  (0, a.jsxs)('div', {
                                                    className:
                                                      'mt-4 pt-4 border-t border-[var(--border)]',
                                                    children: [
                                                      a.jsx('p', {
                                                        className:
                                                          'text-xs font-medium text-[var(--foreground-muted)] mb-2',
                                                        children: 'Steps',
                                                      }),
                                                      v.steps.map((e, s) =>
                                                        (0, a.jsxs)(
                                                          'p',
                                                          {
                                                            className: 'text-xs font-mono',
                                                            children: [
                                                              e.expression,
                                                              ' = ',
                                                              e.value,
                                                            ],
                                                          },
                                                          s
                                                        )
                                                      ),
                                                    ],
                                                  }),
                                              ],
                                            }),
                                        ],
                                      })
                                    : a.jsx('p', {
                                        className:
                                          'text-sm text-[var(--foreground-muted)] text-center py-8',
                                        children: 'Select a formula to use the calculator',
                                      })
                                  : (0, a.jsxs)('div', {
                                      className: 'text-center py-8',
                                      children: [
                                        a.jsx('p', {
                                          className: 'text-[var(--foreground-muted)] mb-4',
                                          children:
                                            'Interactive calculator is available for High-End and Corporate tiers.',
                                        }),
                                        a.jsx('button', {
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
      2511: (e, s, t) => {
        'use strict';
        (t.r(s), t.d(s, { default: () => a }));
        let a = (0, t(3189).createProxy)(
          String.raw`/Users/dustinober/Projects/pmp_application/packages/web/src/app/formulas/page.tsx#default`
        );
      },
    }));
  var s = require('../../webpack-runtime.js');
  s.C(e);
  var t = e => s((s.s = e)),
    a = s.X(0, [136, 568, 516], () => t(7303));
  module.exports = a;
})();
