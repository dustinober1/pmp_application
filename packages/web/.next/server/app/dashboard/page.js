(() => {
  var e = {};
  ((e.id = 702),
    (e.ids = [702]),
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
      3284: (e, s, a) => {
        'use strict';
        (a.r(s),
          a.d(s, {
            GlobalError: () => n.a,
            __next_app__: () => x,
            originalPathname: () => m,
            pages: () => o,
            routeModule: () => p,
            tree: () => c,
          }),
          a(8262),
          a(4773),
          a(7824));
        var r = a(3282),
          t = a(5736),
          i = a(3906),
          n = a.n(i),
          d = a(6880),
          l = {};
        for (let e in d)
          0 >
            [
              'default',
              'tree',
              'pages',
              'GlobalError',
              'originalPathname',
              '__next_app__',
              'routeModule',
            ].indexOf(e) && (l[e] = () => d[e]);
        a.d(s, l);
        let c = [
            '',
            {
              children: [
                'dashboard',
                {
                  children: [
                    '__PAGE__',
                    {},
                    {
                      page: [
                        () => Promise.resolve().then(a.bind(a, 8262)),
                        '/Users/dustinober/Projects/pmp_application/packages/web/src/app/dashboard/page.tsx',
                      ],
                    },
                  ],
                },
                {},
              ],
            },
            {
              layout: [
                () => Promise.resolve().then(a.bind(a, 4773)),
                '/Users/dustinober/Projects/pmp_application/packages/web/src/app/layout.tsx',
              ],
              'not-found': [
                () => Promise.resolve().then(a.t.bind(a, 7824, 23)),
                'next/dist/client/components/not-found-error',
              ],
            },
          ],
          o = [
            '/Users/dustinober/Projects/pmp_application/packages/web/src/app/dashboard/page.tsx',
          ],
          m = '/dashboard/page',
          x = { require: a, loadChunk: () => Promise.resolve() },
          p = new r.AppPageRouteModule({
            definition: {
              kind: t.x.APP_PAGE,
              page: '/dashboard/page',
              pathname: '/dashboard',
              bundlePath: '',
              filename: '',
              appPaths: [],
            },
            userland: { loaderTree: c },
          });
      },
      9658: (e, s, a) => {
        Promise.resolve().then(a.bind(a, 6664));
      },
      6664: (e, s, a) => {
        'use strict';
        (a.r(s), a.d(s, { default: () => c }));
        var r = a(3227),
          t = a(3677),
          i = a(1043),
          n = a(649),
          d = a(2278),
          l = a(7705);
        function c() {
          (0, i.useRouter)();
          let { user: e, isAuthenticated: s, isLoading: a } = (0, d.a)(),
            [c, o] = (0, t.useState)(null),
            [m, x] = (0, t.useState)(!0);
          return a || m
            ? r.jsx('div', {
                className: 'min-h-screen flex items-center justify-center',
                children: r.jsx('div', {
                  className: 'animate-pulse text-[var(--foreground-muted)]',
                  children: 'Loading...',
                }),
              })
            : (0, r.jsxs)('div', {
                className: 'min-h-screen',
                children: [
                  r.jsx(l.w, {}),
                  (0, r.jsxs)('main', {
                    className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
                    children: [
                      (0, r.jsxs)('div', {
                        className: 'mb-8',
                        children: [
                          (0, r.jsxs)('h1', {
                            className: 'text-2xl font-bold',
                            children: ['Welcome back, ', e?.name?.split(' ')[0], '! \uD83D\uDC4B'],
                          }),
                          r.jsx('p', {
                            className: 'text-[var(--foreground-muted)]',
                            children: "Here's your study progress at a glance.",
                          }),
                        ],
                      }),
                      (0, r.jsxs)('div', {
                        className: 'grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8',
                        children: [
                          (0, r.jsxs)('div', {
                            className: 'card',
                            children: [
                              r.jsx('p', {
                                className: 'text-sm text-[var(--foreground-muted)]',
                                children: 'Current Streak',
                              }),
                              (0, r.jsxs)('p', {
                                className: 'text-3xl font-bold mt-1',
                                children: [c?.streak?.currentStreak || 0, ' \uD83D\uDD25'],
                              }),
                              (0, r.jsxs)('p', {
                                className: 'text-xs text-[var(--foreground-muted)] mt-1',
                                children: ['Best: ', c?.streak?.longestStreak || 0, ' days'],
                              }),
                            ],
                          }),
                          (0, r.jsxs)('div', {
                            className: 'card',
                            children: [
                              r.jsx('p', {
                                className: 'text-sm text-[var(--foreground-muted)]',
                                children: 'Overall Progress',
                              }),
                              (0, r.jsxs)('p', {
                                className: 'text-3xl font-bold mt-1',
                                children: [c?.overallProgress || 0, '%'],
                              }),
                              r.jsx('div', {
                                className: 'progress mt-2',
                                children: r.jsx('div', {
                                  className: 'progress-bar',
                                  style: { width: `${c?.overallProgress || 0}%` },
                                }),
                              }),
                            ],
                          }),
                          (0, r.jsxs)('div', {
                            className: 'card',
                            children: [
                              r.jsx('p', {
                                className: 'text-sm text-[var(--foreground-muted)]',
                                children: 'Cards to Review',
                              }),
                              r.jsx('p', {
                                className: 'text-3xl font-bold mt-1',
                                children: c?.upcomingReviews?.length || 0,
                              }),
                              r.jsx(n.default, {
                                href: '/flashcards/review',
                                className: 'text-xs text-[var(--primary)] mt-1 hover:underline',
                                children: 'Start review →',
                              }),
                            ],
                          }),
                          (0, r.jsxs)('div', {
                            className: 'card',
                            children: [
                              r.jsx('p', {
                                className: 'text-sm text-[var(--foreground-muted)]',
                                children: 'Weak Areas',
                              }),
                              r.jsx('p', {
                                className: 'text-3xl font-bold mt-1',
                                children: c?.weakAreas?.length || 0,
                              }),
                              r.jsx('p', {
                                className: 'text-xs text-[var(--foreground-muted)] mt-1',
                                children: 'Topics needing focus',
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, r.jsxs)('div', {
                        className: 'grid lg:grid-cols-3 gap-6',
                        children: [
                          (0, r.jsxs)('div', {
                            className: 'lg:col-span-2',
                            children: [
                              (0, r.jsxs)('div', {
                                className: 'card',
                                children: [
                                  r.jsx('h2', {
                                    className: 'font-semibold mb-4',
                                    children: 'Domain Progress',
                                  }),
                                  r.jsx('div', {
                                    className: 'space-y-4',
                                    children: c?.domainProgress?.map(e =>
                                      r.jsxs(
                                        'div',
                                        {
                                          children: [
                                            r.jsxs('div', {
                                              className: 'flex justify-between items-center mb-1',
                                              children: [
                                                r.jsx('span', {
                                                  className: 'text-sm font-medium',
                                                  children: e.domainName,
                                                }),
                                                r.jsxs('span', {
                                                  className:
                                                    'text-sm text-[var(--foreground-muted)]',
                                                  children: [e.progress, '%'],
                                                }),
                                              ],
                                            }),
                                            r.jsx('div', {
                                              className: 'progress',
                                              children: r.jsx('div', {
                                                className: 'progress-bar',
                                                style: { width: `${e.progress}%` },
                                              }),
                                            }),
                                            r.jsxs('p', {
                                              className:
                                                'text-xs text-[var(--foreground-muted)] mt-1',
                                              children: [
                                                e.questionsAnswered,
                                                ' questions • ',
                                                e.accuracy,
                                                '% accuracy',
                                              ],
                                            }),
                                          ],
                                        },
                                        e.domainId
                                      )
                                    ),
                                  }),
                                ],
                              }),
                              c?.weakAreas &&
                                c.weakAreas.length > 0 &&
                                (0, r.jsxs)('div', {
                                  className: 'card mt-6',
                                  children: [
                                    r.jsx('h2', {
                                      className: 'font-semibold mb-4',
                                      children: 'Areas to Improve',
                                    }),
                                    r.jsx('div', {
                                      className: 'space-y-3',
                                      children: c.weakAreas.map(e =>
                                        (0, r.jsxs)(
                                          'div',
                                          {
                                            className:
                                              'flex items-center justify-between p-3 bg-[var(--secondary)] rounded-lg',
                                            children: [
                                              (0, r.jsxs)('div', {
                                                children: [
                                                  r.jsx('p', {
                                                    className: 'font-medium text-sm',
                                                    children: e.taskName,
                                                  }),
                                                  r.jsx('p', {
                                                    className:
                                                      'text-xs text-[var(--foreground-muted)]',
                                                    children: e.domainName,
                                                  }),
                                                ],
                                              }),
                                              r.jsx('div', {
                                                className: 'text-right',
                                                children: (0, r.jsxs)('span', {
                                                  className: 'badge badge-warning',
                                                  children: [e.accuracy, '%'],
                                                }),
                                              }),
                                            ],
                                          },
                                          e.taskId
                                        )
                                      ),
                                    }),
                                  ],
                                }),
                            ],
                          }),
                          (0, r.jsxs)('div', {
                            className: 'space-y-6',
                            children: [
                              (0, r.jsxs)('div', {
                                className: 'card',
                                children: [
                                  r.jsx('h2', {
                                    className: 'font-semibold mb-4',
                                    children: 'Quick Actions',
                                  }),
                                  (0, r.jsxs)('div', {
                                    className: 'space-y-2',
                                    children: [
                                      (0, r.jsxs)(n.default, {
                                        href: '/study',
                                        className: 'btn btn-primary w-full justify-start gap-2',
                                        children: [
                                          r.jsx('svg', {
                                            className: 'w-5 h-5',
                                            fill: 'none',
                                            stroke: 'currentColor',
                                            viewBox: '0 0 24 24',
                                            children: r.jsx('path', {
                                              strokeLinecap: 'round',
                                              strokeLinejoin: 'round',
                                              strokeWidth: 2,
                                              d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
                                            }),
                                          }),
                                          'Continue Studying',
                                        ],
                                      }),
                                      (0, r.jsxs)(n.default, {
                                        href: '/flashcards',
                                        className: 'btn btn-secondary w-full justify-start gap-2',
                                        children: [
                                          r.jsx('svg', {
                                            className: 'w-5 h-5',
                                            fill: 'none',
                                            stroke: 'currentColor',
                                            viewBox: '0 0 24 24',
                                            children: r.jsx('path', {
                                              strokeLinecap: 'round',
                                              strokeLinejoin: 'round',
                                              strokeWidth: 2,
                                              d: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
                                            }),
                                          }),
                                          'Review Flashcards',
                                        ],
                                      }),
                                      (0, r.jsxs)(n.default, {
                                        href: '/practice',
                                        className: 'btn btn-secondary w-full justify-start gap-2',
                                        children: [
                                          r.jsx('svg', {
                                            className: 'w-5 h-5',
                                            fill: 'none',
                                            stroke: 'currentColor',
                                            viewBox: '0 0 24 24',
                                            children: r.jsx('path', {
                                              strokeLinecap: 'round',
                                              strokeLinejoin: 'round',
                                              strokeWidth: 2,
                                              d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
                                            }),
                                          }),
                                          'Practice Questions',
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              (0, r.jsxs)('div', {
                                className: 'card',
                                children: [
                                  r.jsx('h2', {
                                    className: 'font-semibold mb-4',
                                    children: 'Recent Activity',
                                  }),
                                  (0, r.jsxs)('div', {
                                    className: 'space-y-3',
                                    children: [
                                      c?.recentActivity
                                        ?.slice(0, 5)
                                        .map(e =>
                                          r.jsxs(
                                            'div',
                                            {
                                              className: 'flex items-start gap-3 text-sm',
                                              children: [
                                                r.jsx('div', {
                                                  className:
                                                    'w-2 h-2 rounded-full bg-[var(--primary)] mt-2',
                                                }),
                                                r.jsxs('div', {
                                                  children: [
                                                    r.jsx('p', { children: e.description }),
                                                    r.jsx('p', {
                                                      className:
                                                        'text-xs text-[var(--foreground-muted)]',
                                                      children: new Date(
                                                        e.timestamp
                                                      ).toLocaleDateString(),
                                                    }),
                                                  ],
                                                }),
                                              ],
                                            },
                                            e.id
                                          )
                                        ),
                                      (!c?.recentActivity || 0 === c.recentActivity.length) &&
                                        r.jsx('p', {
                                          className: 'text-sm text-[var(--foreground-muted)]',
                                          children: 'No recent activity yet. Start studying!',
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
                  }),
                ],
              });
        }
        a(7674);
      },
      8262: (e, s, a) => {
        'use strict';
        (a.r(s), a.d(s, { default: () => r }));
        let r = (0, a(3189).createProxy)(
          String.raw`/Users/dustinober/Projects/pmp_application/packages/web/src/app/dashboard/page.tsx#default`
        );
      },
    }));
  var s = require('../../webpack-runtime.js');
  s.C(e);
  var a = e => s((s.s = e)),
    r = s.X(0, [136, 568, 516], () => a(3284));
  module.exports = r;
})();
