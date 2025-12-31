(() => {
  var e = {};
  ((e.id = 472),
    (e.ids = [472]),
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
      7234: (e, s, t) => {
        'use strict';
        (t.r(s),
          t.d(s, {
            GlobalError: () => n.a,
            __next_app__: () => x,
            originalPathname: () => m,
            pages: () => d,
            routeModule: () => p,
            tree: () => o,
          }),
          t(7523),
          t(4773),
          t(7824));
        var a = t(3282),
          r = t(5736),
          i = t(3906),
          n = t.n(i),
          l = t(6880),
          c = {};
        for (let e in l)
          0 >
            [
              'default',
              'tree',
              'pages',
              'GlobalError',
              'originalPathname',
              '__next_app__',
              'routeModule',
            ].indexOf(e) && (c[e] = () => l[e]);
        t.d(s, c);
        let o = [
            '',
            {
              children: [
                'practice',
                {
                  children: [
                    '__PAGE__',
                    {},
                    {
                      page: [
                        () => Promise.resolve().then(t.bind(t, 7523)),
                        '/Users/dustinober/Projects/pmp_application/packages/web/src/app/practice/page.tsx',
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
          d = ['/Users/dustinober/Projects/pmp_application/packages/web/src/app/practice/page.tsx'],
          m = '/practice/page',
          x = { require: t, loadChunk: () => Promise.resolve() },
          p = new a.AppPageRouteModule({
            definition: {
              kind: r.x.APP_PAGE,
              page: '/practice/page',
              pathname: '/practice',
              bundlePath: '',
              filename: '',
              appPaths: [],
            },
            userland: { loaderTree: o },
          });
      },
      8365: (e, s, t) => {
        Promise.resolve().then(t.bind(t, 2387));
      },
      2387: (e, s, t) => {
        'use strict';
        (t.r(s), t.d(s, { default: () => d }));
        var a = t(3227),
          r = t(3677),
          i = t(1043),
          n = t(649),
          l = t(2278),
          c = t(2932),
          o = t(7674);
        function d() {
          let e = (0, i.useRouter)(),
            { user: s, isAuthenticated: t, isLoading: d } = (0, l.a)(),
            [m, x] = (0, r.useState)(null),
            [p, u] = (0, r.useState)([]),
            [h, g] = (0, r.useState)([]),
            [v, b] = (0, r.useState)(20),
            [f, j] = (0, r.useState)(!0),
            [N, y] = (0, r.useState)(!1),
            w = async () => {
              y(!0);
              try {
                let s = await o.tF.startSession({
                    domainIds: h.length > 0 ? h : void 0,
                    questionCount: v,
                  }),
                  t = s.data?.sessionId;
                t && e.push(`/practice/session/${t}`);
              } catch (e) {
                console.error('Failed to start session:', e);
              } finally {
                y(!1);
              }
            },
            k = async () => {
              y(!0);
              try {
                let s = await o.tF.startMockExam(),
                  t = s.data?.sessionId;
                t && e.push(`/practice/session/${t}?mock=true`);
              } catch (e) {
                console.error('Failed to start mock exam:', e);
              } finally {
                y(!1);
              }
            },
            P = e => {
              g(s => (s.includes(e) ? s.filter(s => s !== e) : [...s, e]));
            };
          if (d || f)
            return a.jsx('div', {
              className: 'min-h-screen flex items-center justify-center',
              children: a.jsx('div', {
                className: 'animate-pulse text-[var(--foreground-muted)]',
                children: 'Loading...',
              }),
            });
          let S = s?.tier === 'high-end' || s?.tier === 'corporate';
          return (0, a.jsxs)('div', {
            className: 'min-h-screen',
            children: [
              a.jsx(c.w, {}),
              (0, a.jsxs)('main', {
                className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
                children: [
                  (0, a.jsxs)('div', {
                    className: 'mb-8',
                    children: [
                      a.jsx('h1', {
                        className: 'text-2xl font-bold',
                        children: 'Practice Questions',
                      }),
                      a.jsx('p', {
                        className: 'text-[var(--foreground-muted)]',
                        children: 'Test your knowledge with realistic PMP exam questions.',
                      }),
                    ],
                  }),
                  (0, a.jsxs)('div', {
                    className: 'grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8',
                    children: [
                      (0, a.jsxs)('div', {
                        className: 'card text-center',
                        children: [
                          a.jsx('p', {
                            className: 'text-3xl font-bold',
                            children: m?.totalSessions || 0,
                          }),
                          a.jsx('p', {
                            className: 'text-sm text-[var(--foreground-muted)]',
                            children: 'Sessions',
                          }),
                        ],
                      }),
                      (0, a.jsxs)('div', {
                        className: 'card text-center',
                        children: [
                          a.jsx('p', {
                            className: 'text-3xl font-bold',
                            children: m?.totalQuestions || 0,
                          }),
                          a.jsx('p', {
                            className: 'text-sm text-[var(--foreground-muted)]',
                            children: 'Questions Answered',
                          }),
                        ],
                      }),
                      (0, a.jsxs)('div', {
                        className: 'card text-center',
                        children: [
                          (0, a.jsxs)('p', {
                            className: 'text-3xl font-bold text-[var(--primary)]',
                            children: [m?.averageScore || 0, '%'],
                          }),
                          a.jsx('p', {
                            className: 'text-sm text-[var(--foreground-muted)]',
                            children: 'Average Score',
                          }),
                        ],
                      }),
                      (0, a.jsxs)('div', {
                        className: 'card text-center',
                        children: [
                          (0, a.jsxs)('p', {
                            className: 'text-3xl font-bold text-[var(--success)]',
                            children: [m?.bestScore || 0, '%'],
                          }),
                          a.jsx('p', {
                            className: 'text-sm text-[var(--foreground-muted)]',
                            children: 'Best Score',
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, a.jsxs)('div', {
                    className: 'grid lg:grid-cols-3 gap-6',
                    children: [
                      (0, a.jsxs)('div', {
                        className: 'lg:col-span-2',
                        children: [
                          (0, a.jsxs)('div', {
                            className: 'card',
                            children: [
                              a.jsx('h2', {
                                className: 'font-semibold mb-4',
                                children: 'Configure Practice Session',
                              }),
                              (0, a.jsxs)('div', {
                                className: 'mb-6',
                                children: [
                                  a.jsx('label', {
                                    className: 'block text-sm font-medium mb-2',
                                    children: 'Select Domains (optional)',
                                  }),
                                  a.jsx('div', {
                                    className: 'flex flex-wrap gap-2',
                                    children: p.map(e =>
                                      a.jsx(
                                        'button',
                                        {
                                          onClick: () => P(e.id),
                                          className: `px-4 py-2 rounded-lg text-sm font-medium transition ${h.includes(e.id) ? 'bg-[var(--primary)] text-white' : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)]'}`,
                                          children: e.name,
                                        },
                                        e.id
                                      )
                                    ),
                                  }),
                                  a.jsx('p', {
                                    className: 'text-xs text-[var(--foreground-muted)] mt-2',
                                    children: 'Leave empty to include all domains',
                                  }),
                                ],
                              }),
                              (0, a.jsxs)('div', {
                                className: 'mb-6',
                                children: [
                                  a.jsx('label', {
                                    className: 'block text-sm font-medium mb-2',
                                    children: 'Number of Questions',
                                  }),
                                  a.jsx('div', {
                                    className: 'flex gap-2',
                                    children: [10, 20, 30, 50].map(e =>
                                      a.jsx(
                                        'button',
                                        {
                                          onClick: () => b(e),
                                          className: `px-4 py-2 rounded-lg text-sm font-medium transition ${v === e ? 'bg-[var(--primary)] text-white' : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)]'}`,
                                          children: e,
                                        },
                                        e
                                      )
                                    ),
                                  }),
                                ],
                              }),
                              a.jsx('button', {
                                onClick: w,
                                disabled: N,
                                className: 'btn btn-primary w-full',
                                children: N ? 'Starting...' : 'Start Practice Session',
                              }),
                            ],
                          }),
                          m?.weakDomains &&
                            m.weakDomains.length > 0 &&
                            (0, a.jsxs)('div', {
                              className: 'card mt-6',
                              children: [
                                a.jsx('h2', {
                                  className: 'font-semibold mb-4',
                                  children: 'Focus Areas',
                                }),
                                a.jsx('p', {
                                  className: 'text-sm text-[var(--foreground-muted)] mb-4',
                                  children: 'Based on your practice history, focus on these areas:',
                                }),
                                a.jsx('div', {
                                  className: 'flex flex-wrap gap-2',
                                  children: m.weakDomains.map((e, s) =>
                                    a.jsx(
                                      'span',
                                      { className: 'badge badge-warning', children: e },
                                      s
                                    )
                                  ),
                                }),
                              ],
                            }),
                        ],
                      }),
                      (0, a.jsxs)('div', {
                        className: 'space-y-6',
                        children: [
                          (0, a.jsxs)('div', {
                            className: 'card',
                            children: [
                              a.jsx('div', {
                                className:
                                  'w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center mb-4',
                                children: a.jsx('svg', {
                                  className: 'w-6 h-6 text-white',
                                  fill: 'none',
                                  stroke: 'currentColor',
                                  viewBox: '0 0 24 24',
                                  children: a.jsx('path', {
                                    strokeLinecap: 'round',
                                    strokeLinejoin: 'round',
                                    strokeWidth: 2,
                                    d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
                                  }),
                                }),
                              }),
                              a.jsx('h2', {
                                className: 'text-lg font-semibold',
                                children: 'Full Mock Exam',
                              }),
                              a.jsx('p', {
                                className: 'text-sm text-[var(--foreground-muted)] mt-2',
                                children:
                                  'Simulate the real PMP exam with 180 questions and a 3h 50min time limit.',
                              }),
                              S
                                ? a.jsx('button', {
                                    onClick: k,
                                    disabled: N,
                                    className: 'btn btn-primary w-full mt-4',
                                    children: 'Start Mock Exam',
                                  })
                                : (0, a.jsxs)('div', {
                                    className: 'mt-4',
                                    children: [
                                      a.jsx('p', {
                                        className: 'text-xs text-[var(--foreground-muted)] mb-2',
                                        children: 'Available for High-End and Corporate tiers',
                                      }),
                                      a.jsx(n.default, {
                                        href: '/pricing',
                                        className: 'btn btn-secondary w-full',
                                        children: 'Upgrade to Access',
                                      }),
                                    ],
                                  }),
                            ],
                          }),
                          (0, a.jsxs)('div', {
                            className: 'card',
                            children: [
                              a.jsx('h2', {
                                className: 'font-semibold mb-2',
                                children: 'Flagged Questions',
                              }),
                              a.jsx('p', {
                                className: 'text-sm text-[var(--foreground-muted)]',
                                children: "Review questions you've flagged for later.",
                              }),
                              a.jsx(n.default, {
                                href: '/practice/flagged',
                                className: 'btn btn-secondary w-full mt-4',
                                children: 'View Flagged',
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          });
        }
      },
      7523: (e, s, t) => {
        'use strict';
        (t.r(s), t.d(s, { default: () => a }));
        let a = (0, t(3189).createProxy)(
          String.raw`/Users/dustinober/Projects/pmp_application/packages/web/src/app/practice/page.tsx#default`
        );
      },
    }));
  var s = require('../../webpack-runtime.js');
  s.C(e);
  var t = e => s((s.s = e)),
    a = s.X(0, [136, 568, 198], () => t(7234));
  module.exports = a;
})();
