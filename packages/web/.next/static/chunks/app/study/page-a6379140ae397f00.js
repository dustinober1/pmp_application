(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [768],
  {
    5194: function (e, s, r) {
      Promise.resolve().then(r.bind(r, 7864));
    },
    7864: function (e, s, r) {
      'use strict';
      (r.r(s),
        r.d(s, {
          default: function () {
            return c;
          },
        }));
      var t = r(7573),
        a = r(7653),
        i = r(1695),
        n = r(8146),
        d = r(7070),
        l = r(7701),
        o = r(5118);
      function c() {
        var e, s, r;
        let c = (0, i.useRouter)(),
          { isAuthenticated: m, isLoading: u } = (0, d.a)(),
          [x, h] = (0, a.useState)([]),
          [v, f] = (0, a.useState)(!0),
          [g, p] = (0, a.useState)(null);
        ((0, a.useEffect)(() => {
          u || m || c.push('/login');
        }, [u, m, c]),
          (0, a.useEffect)(() => {
            m && j();
          }, [m]));
        let j = async () => {
          try {
            var e;
            let s = await o.sA.getDomains();
            h((null === (e = s.data) || void 0 === e ? void 0 : e.domains) || []);
          } catch (e) {
            console.error('Failed to fetch domains:', e);
          } finally {
            f(!1);
          }
        };
        if (u || v)
          return (0, t.jsx)('div', {
            className: 'min-h-screen flex items-center justify-center',
            children: (0, t.jsx)('div', {
              className: 'animate-pulse text-[var(--foreground-muted)]',
              children: 'Loading...',
            }),
          });
        let N = {
          PEOPLE: 'from-blue-500 to-indigo-600',
          PROCESS: 'from-emerald-500 to-teal-600',
          BUSINESS: 'from-orange-500 to-amber-600',
        };
        return (0, t.jsxs)('div', {
          className: 'min-h-screen',
          children: [
            (0, t.jsx)(l.w, {}),
            (0, t.jsxs)('main', {
              className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
              children: [
                (0, t.jsxs)('div', {
                  className: 'mb-8',
                  children: [
                    (0, t.jsx)('h1', { className: 'text-2xl font-bold', children: 'Study Guide' }),
                    (0, t.jsx)('p', {
                      className: 'text-[var(--foreground-muted)]',
                      children: 'Master the PMP domains with comprehensive study materials.',
                    }),
                  ],
                }),
                (0, t.jsx)('div', {
                  className: 'grid md:grid-cols-3 gap-6 mb-8',
                  children: x.map(e => {
                    var s, r;
                    return (0, t.jsxs)(
                      'div',
                      {
                        className: 'card cursor-pointer transition-all hover:scale-[1.02] '.concat(
                          g === e.id ? 'ring-2 ring-[var(--primary)]' : ''
                        ),
                        onClick: () => p(g === e.id ? null : e.id),
                        children: [
                          (0, t.jsx)('div', {
                            className: 'w-12 h-12 rounded-lg bg-gradient-to-br '.concat(
                              N[e.code] || 'from-gray-500 to-gray-600',
                              ' flex items-center justify-center mb-4'
                            ),
                            children: (0, t.jsxs)('span', {
                              className: 'text-white font-bold text-lg',
                              children: [e.weightPercentage, '%'],
                            }),
                          }),
                          (0, t.jsx)('h2', {
                            className: 'text-lg font-semibold',
                            children: e.name,
                          }),
                          (0, t.jsxs)('p', {
                            className: 'text-sm text-[var(--foreground-muted)] mt-2',
                            children: [
                              null === (s = e.description) || void 0 === s
                                ? void 0
                                : s.substring(0, 100),
                              '...',
                            ],
                          }),
                          (0, t.jsxs)('div', {
                            className:
                              'flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]',
                            children: [
                              (0, t.jsxs)('span', {
                                className: 'text-sm text-[var(--foreground-muted)]',
                                children: [
                                  (null === (r = e.tasks) || void 0 === r ? void 0 : r.length) || 0,
                                  ' tasks',
                                ],
                              }),
                              (0, t.jsx)('span', {
                                className: 'text-[var(--primary)] text-sm font-medium',
                                children: g === e.id ? 'View Tasks ↓' : 'Expand →',
                              }),
                            ],
                          }),
                        ],
                      },
                      e.id
                    );
                  }),
                }),
                g &&
                  (0, t.jsxs)('div', {
                    className: 'card animate-slideUp',
                    children: [
                      (0, t.jsxs)('h2', {
                        className: 'font-semibold mb-4',
                        children: [
                          null === (e = x.find(e => e.id === g)) || void 0 === e ? void 0 : e.name,
                          ' - Tasks',
                        ],
                      }),
                      (0, t.jsx)('div', {
                        className: 'grid gap-3',
                        children:
                          null === (r = x.find(e => e.id === g)) || void 0 === r
                            ? void 0
                            : null === (s = r.tasks) || void 0 === s
                              ? void 0
                              : s.map(e => {
                                  var s;
                                  return (0, t.jsxs)(
                                    n.default,
                                    {
                                      href: '/study/'.concat(e.id),
                                      className:
                                        'flex items-center justify-between p-4 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--secondary)] transition-colors',
                                      children: [
                                        (0, t.jsxs)('div', {
                                          className: 'flex items-center gap-4',
                                          children: [
                                            (0, t.jsx)('span', {
                                              className: 'badge badge-primary',
                                              children: e.code,
                                            }),
                                            (0, t.jsxs)('div', {
                                              children: [
                                                (0, t.jsx)('p', {
                                                  className: 'font-medium',
                                                  children: e.name,
                                                }),
                                                (0, t.jsxs)('p', {
                                                  className:
                                                    'text-sm text-[var(--foreground-muted)]',
                                                  children: [
                                                    null === (s = e.description) || void 0 === s
                                                      ? void 0
                                                      : s.substring(0, 80),
                                                    '...',
                                                  ],
                                                }),
                                              ],
                                            }),
                                          ],
                                        }),
                                        (0, t.jsx)('svg', {
                                          className: 'w-5 h-5 text-[var(--foreground-muted)]',
                                          fill: 'none',
                                          stroke: 'currentColor',
                                          viewBox: '0 0 24 24',
                                          children: (0, t.jsx)('path', {
                                            strokeLinecap: 'round',
                                            strokeLinejoin: 'round',
                                            strokeWidth: 2,
                                            d: 'M9 5l7 7-7 7',
                                          }),
                                        }),
                                      ],
                                    },
                                    e.id
                                  );
                                }),
                      }),
                    ],
                  }),
                0 === x.length &&
                  (0, t.jsx)('div', {
                    className: 'text-center py-12',
                    children: (0, t.jsx)('p', {
                      className: 'text-[var(--foreground-muted)]',
                      children: 'No study content available yet.',
                    }),
                  }),
              ],
            }),
          ],
        });
      }
    },
  },
  function (e) {
    (e.O(0, [340, 644, 293, 528, 744], function () {
      return e((e.s = 5194));
    }),
      (_N_E = e.O()));
  },
]);
