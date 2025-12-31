(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [702],
  {
    1508: function (e, s, a) {
      Promise.resolve().then(a.bind(a, 1285));
    },
    1285: function (e, s, a) {
      'use strict';
      (a.r(s),
        a.d(s, {
          default: function () {
            return o;
          },
        }));
      var r = a(7573),
        t = a(7653),
        l = a(1695),
        d = a(8146),
        i = a(7070),
        n = a(6973),
        c = a(5118);
      function o() {
        var e, s, a, o, m, x, u;
        let h = (0, l.useRouter)(),
          { user: v, isAuthenticated: j, isLoading: p } = (0, i.a)(),
          [N, f] = (0, t.useState)(null),
          [g, y] = (0, t.useState)(!0);
        ((0, t.useEffect)(() => {
          p || j || h.push('/login');
        }, [p, j, h]),
          (0, t.useEffect)(() => {
            j && b();
          }, [j]));
        let b = async () => {
          try {
            var e;
            let s = await c.kx.getDashboard();
            f(null === (e = s.data) || void 0 === e ? void 0 : e.dashboard);
          } catch (e) {
            console.error('Failed to fetch dashboard:', e);
          } finally {
            y(!1);
          }
        };
        return p || g
          ? (0, r.jsx)('div', {
              className: 'min-h-screen flex items-center justify-center',
              children: (0, r.jsx)('div', {
                className: 'animate-pulse text-[var(--foreground-muted)]',
                children: 'Loading...',
              }),
            })
          : (0, r.jsxs)('div', {
              className: 'min-h-screen',
              children: [
                (0, r.jsx)(n.w, {}),
                (0, r.jsxs)('main', {
                  className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
                  children: [
                    (0, r.jsxs)('div', {
                      className: 'mb-8',
                      children: [
                        (0, r.jsxs)('h1', {
                          className: 'text-2xl font-bold',
                          children: [
                            'Welcome back, ',
                            null == v
                              ? void 0
                              : null === (e = v.name) || void 0 === e
                                ? void 0
                                : e.split(' ')[0],
                            '! \uD83D\uDC4B',
                          ],
                        }),
                        (0, r.jsx)('p', {
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
                            (0, r.jsx)('p', {
                              className: 'text-sm text-[var(--foreground-muted)]',
                              children: 'Current Streak',
                            }),
                            (0, r.jsxs)('p', {
                              className: 'text-3xl font-bold mt-1',
                              children: [
                                (null == N
                                  ? void 0
                                  : null === (s = N.streak) || void 0 === s
                                    ? void 0
                                    : s.currentStreak) || 0,
                                ' \uD83D\uDD25',
                              ],
                            }),
                            (0, r.jsxs)('p', {
                              className: 'text-xs text-[var(--foreground-muted)] mt-1',
                              children: [
                                'Best: ',
                                (null == N
                                  ? void 0
                                  : null === (a = N.streak) || void 0 === a
                                    ? void 0
                                    : a.longestStreak) || 0,
                                ' days',
                              ],
                            }),
                          ],
                        }),
                        (0, r.jsxs)('div', {
                          className: 'card',
                          children: [
                            (0, r.jsx)('p', {
                              className: 'text-sm text-[var(--foreground-muted)]',
                              children: 'Overall Progress',
                            }),
                            (0, r.jsxs)('p', {
                              className: 'text-3xl font-bold mt-1',
                              children: [(null == N ? void 0 : N.overallProgress) || 0, '%'],
                            }),
                            (0, r.jsx)('div', {
                              className: 'progress mt-2',
                              children: (0, r.jsx)('div', {
                                className: 'progress-bar',
                                style: {
                                  width: ''.concat(
                                    (null == N ? void 0 : N.overallProgress) || 0,
                                    '%'
                                  ),
                                },
                              }),
                            }),
                          ],
                        }),
                        (0, r.jsxs)('div', {
                          className: 'card',
                          children: [
                            (0, r.jsx)('p', {
                              className: 'text-sm text-[var(--foreground-muted)]',
                              children: 'Cards to Review',
                            }),
                            (0, r.jsx)('p', {
                              className: 'text-3xl font-bold mt-1',
                              children:
                                (null == N
                                  ? void 0
                                  : null === (o = N.upcomingReviews) || void 0 === o
                                    ? void 0
                                    : o.length) || 0,
                            }),
                            (0, r.jsx)(d.default, {
                              href: '/flashcards/review',
                              className: 'text-xs text-[var(--primary)] mt-1 hover:underline',
                              children: 'Start review →',
                            }),
                          ],
                        }),
                        (0, r.jsxs)('div', {
                          className: 'card',
                          children: [
                            (0, r.jsx)('p', {
                              className: 'text-sm text-[var(--foreground-muted)]',
                              children: 'Weak Areas',
                            }),
                            (0, r.jsx)('p', {
                              className: 'text-3xl font-bold mt-1',
                              children:
                                (null == N
                                  ? void 0
                                  : null === (m = N.weakAreas) || void 0 === m
                                    ? void 0
                                    : m.length) || 0,
                            }),
                            (0, r.jsx)('p', {
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
                                (0, r.jsx)('h2', {
                                  className: 'font-semibold mb-4',
                                  children: 'Domain Progress',
                                }),
                                (0, r.jsx)('div', {
                                  className: 'space-y-4',
                                  children:
                                    null == N
                                      ? void 0
                                      : null === (x = N.domainProgress) || void 0 === x
                                        ? void 0
                                        : x.map(e =>
                                            (0, r.jsxs)(
                                              'div',
                                              {
                                                children: [
                                                  (0, r.jsxs)('div', {
                                                    className:
                                                      'flex justify-between items-center mb-1',
                                                    children: [
                                                      (0, r.jsx)('span', {
                                                        className: 'text-sm font-medium',
                                                        children: e.domainName,
                                                      }),
                                                      (0, r.jsxs)('span', {
                                                        className:
                                                          'text-sm text-[var(--foreground-muted)]',
                                                        children: [e.progress, '%'],
                                                      }),
                                                    ],
                                                  }),
                                                  (0, r.jsx)('div', {
                                                    className: 'progress',
                                                    children: (0, r.jsx)('div', {
                                                      className: 'progress-bar',
                                                      style: { width: ''.concat(e.progress, '%') },
                                                    }),
                                                  }),
                                                  (0, r.jsxs)('p', {
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
                            (null == N ? void 0 : N.weakAreas) &&
                              N.weakAreas.length > 0 &&
                              (0, r.jsxs)('div', {
                                className: 'card mt-6',
                                children: [
                                  (0, r.jsx)('h2', {
                                    className: 'font-semibold mb-4',
                                    children: 'Areas to Improve',
                                  }),
                                  (0, r.jsx)('div', {
                                    className: 'space-y-3',
                                    children: N.weakAreas.map(e =>
                                      (0, r.jsxs)(
                                        'div',
                                        {
                                          className:
                                            'flex items-center justify-between p-3 bg-[var(--secondary)] rounded-lg',
                                          children: [
                                            (0, r.jsxs)('div', {
                                              children: [
                                                (0, r.jsx)('p', {
                                                  className: 'font-medium text-sm',
                                                  children: e.taskName,
                                                }),
                                                (0, r.jsx)('p', {
                                                  className:
                                                    'text-xs text-[var(--foreground-muted)]',
                                                  children: e.domainName,
                                                }),
                                              ],
                                            }),
                                            (0, r.jsx)('div', {
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
                                (0, r.jsx)('h2', {
                                  className: 'font-semibold mb-4',
                                  children: 'Quick Actions',
                                }),
                                (0, r.jsxs)('div', {
                                  className: 'space-y-2',
                                  children: [
                                    (0, r.jsxs)(d.default, {
                                      href: '/study',
                                      className: 'btn btn-primary w-full justify-start gap-2',
                                      children: [
                                        (0, r.jsx)('svg', {
                                          className: 'w-5 h-5',
                                          fill: 'none',
                                          stroke: 'currentColor',
                                          viewBox: '0 0 24 24',
                                          children: (0, r.jsx)('path', {
                                            strokeLinecap: 'round',
                                            strokeLinejoin: 'round',
                                            strokeWidth: 2,
                                            d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
                                          }),
                                        }),
                                        'Continue Studying',
                                      ],
                                    }),
                                    (0, r.jsxs)(d.default, {
                                      href: '/flashcards',
                                      className: 'btn btn-secondary w-full justify-start gap-2',
                                      children: [
                                        (0, r.jsx)('svg', {
                                          className: 'w-5 h-5',
                                          fill: 'none',
                                          stroke: 'currentColor',
                                          viewBox: '0 0 24 24',
                                          children: (0, r.jsx)('path', {
                                            strokeLinecap: 'round',
                                            strokeLinejoin: 'round',
                                            strokeWidth: 2,
                                            d: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
                                          }),
                                        }),
                                        'Review Flashcards',
                                      ],
                                    }),
                                    (0, r.jsxs)(d.default, {
                                      href: '/practice',
                                      className: 'btn btn-secondary w-full justify-start gap-2',
                                      children: [
                                        (0, r.jsx)('svg', {
                                          className: 'w-5 h-5',
                                          fill: 'none',
                                          stroke: 'currentColor',
                                          viewBox: '0 0 24 24',
                                          children: (0, r.jsx)('path', {
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
                                (0, r.jsx)('h2', {
                                  className: 'font-semibold mb-4',
                                  children: 'Recent Activity',
                                }),
                                (0, r.jsxs)('div', {
                                  className: 'space-y-3',
                                  children: [
                                    null == N
                                      ? void 0
                                      : null === (u = N.recentActivity) || void 0 === u
                                        ? void 0
                                        : u
                                            .slice(0, 5)
                                            .map(e =>
                                              (0, r.jsxs)(
                                                'div',
                                                {
                                                  className: 'flex items-start gap-3 text-sm',
                                                  children: [
                                                    (0, r.jsx)('div', {
                                                      className:
                                                        'w-2 h-2 rounded-full bg-[var(--primary)] mt-2',
                                                    }),
                                                    (0, r.jsxs)('div', {
                                                      children: [
                                                        (0, r.jsx)('p', {
                                                          children: e.description,
                                                        }),
                                                        (0, r.jsx)('p', {
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
                                    (!(null == N ? void 0 : N.recentActivity) ||
                                      0 === N.recentActivity.length) &&
                                      (0, r.jsx)('p', {
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
    },
  },
  function (e) {
    (e.O(0, [340, 973, 293, 528, 744], function () {
      return e((e.s = 1508));
    }),
      (_N_E = e.O()));
  },
]);
