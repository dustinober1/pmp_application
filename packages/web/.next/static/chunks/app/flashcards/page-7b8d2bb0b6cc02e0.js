(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [643],
  {
    6924: function (e, s, t) {
      Promise.resolve().then(t.bind(t, 3065));
    },
    3065: function (e, s, t) {
      'use strict';
      (t.r(s),
        t.d(s, {
          default: function () {
            return c;
          },
        }));
      var r = t(7573),
        a = t(7653),
        n = t(1695),
        l = t(8146),
        d = t(7070),
        i = t(7701),
        o = t(5118);
      function c() {
        let e = (0, n.useRouter)(),
          { isAuthenticated: s, isLoading: t } = (0, d.a)(),
          [c, m] = (0, a.useState)(null),
          [x, u] = (0, a.useState)(0),
          [h, v] = (0, a.useState)(!0);
        ((0, a.useEffect)(() => {
          t || s || e.push('/login');
        }, [t, s, e]),
          (0, a.useEffect)(() => {
            s && f();
          }, [s]));
        let f = async () => {
            try {
              var e, s, t;
              let [r, a] = await Promise.all([o.Lc.getStats(), o.Lc.getDueForReview(10)]);
              (m(null === (e = r.data) || void 0 === e ? void 0 : e.stats),
                u(
                  (null === (t = a.data) || void 0 === t
                    ? void 0
                    : null === (s = t.cards) || void 0 === s
                      ? void 0
                      : s.length) || 0
                ));
            } catch (e) {
              console.error('Failed to fetch flashcard data:', e);
            } finally {
              v(!1);
            }
          },
          j = async s => {
            try {
              var t;
              let r = await o.Lc.startSession(
                  'review' === s ? { prioritizeReview: !0, cardCount: 20 } : { cardCount: 20 }
                ),
                a = null === (t = r.data) || void 0 === t ? void 0 : t.sessionId;
              a && e.push('/flashcards/session/'.concat(a));
            } catch (e) {
              console.error('Failed to start session:', e);
            }
          };
        return t || h
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
                (0, r.jsx)(i.w, {}),
                (0, r.jsxs)('main', {
                  className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
                  children: [
                    (0, r.jsxs)('div', {
                      className: 'mb-8',
                      children: [
                        (0, r.jsx)('h1', {
                          className: 'text-2xl font-bold',
                          children: 'Flashcards',
                        }),
                        (0, r.jsx)('p', {
                          className: 'text-[var(--foreground-muted)]',
                          children: 'Master key concepts with spaced repetition learning.',
                        }),
                      ],
                    }),
                    (0, r.jsxs)('div', {
                      className: 'grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8',
                      children: [
                        (0, r.jsxs)('div', {
                          className: 'card text-center',
                          children: [
                            (0, r.jsx)('p', {
                              className: 'text-3xl font-bold text-[var(--success)]',
                              children: (null == c ? void 0 : c.mastered) || 0,
                            }),
                            (0, r.jsx)('p', {
                              className: 'text-sm text-[var(--foreground-muted)]',
                              children: 'Mastered',
                            }),
                          ],
                        }),
                        (0, r.jsxs)('div', {
                          className: 'card text-center',
                          children: [
                            (0, r.jsx)('p', {
                              className: 'text-3xl font-bold text-[var(--warning)]',
                              children: (null == c ? void 0 : c.learning) || 0,
                            }),
                            (0, r.jsx)('p', {
                              className: 'text-sm text-[var(--foreground-muted)]',
                              children: 'Learning',
                            }),
                          ],
                        }),
                        (0, r.jsxs)('div', {
                          className: 'card text-center',
                          children: [
                            (0, r.jsx)('p', {
                              className: 'text-3xl font-bold text-[var(--primary)]',
                              children: x,
                            }),
                            (0, r.jsx)('p', {
                              className: 'text-sm text-[var(--foreground-muted)]',
                              children: 'Due Today',
                            }),
                          ],
                        }),
                        (0, r.jsxs)('div', {
                          className: 'card text-center',
                          children: [
                            (0, r.jsx)('p', {
                              className: 'text-3xl font-bold',
                              children: (null == c ? void 0 : c.totalCards) || 0,
                            }),
                            (0, r.jsx)('p', {
                              className: 'text-sm text-[var(--foreground-muted)]',
                              children: 'Total Cards',
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, r.jsxs)('div', {
                      className: 'grid md:grid-cols-2 lg:grid-cols-3 gap-6',
                      children: [
                        (0, r.jsxs)('div', {
                          className: 'card hover:border-[var(--primary)] transition-colors',
                          children: [
                            (0, r.jsx)('div', {
                              className:
                                'w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center mb-4',
                              children: (0, r.jsx)('svg', {
                                className: 'w-6 h-6 text-white',
                                fill: 'none',
                                stroke: 'currentColor',
                                viewBox: '0 0 24 24',
                                children: (0, r.jsx)('path', {
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  strokeWidth: 2,
                                  d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
                                }),
                              }),
                            }),
                            (0, r.jsx)('h2', {
                              className: 'text-lg font-semibold',
                              children: 'Review Due Cards',
                            }),
                            (0, r.jsx)('p', {
                              className: 'text-sm text-[var(--foreground-muted)] mt-2',
                              children:
                                x > 0
                                  ? 'You have '.concat(
                                      x,
                                      ' cards due for review. Keep your streak going!'
                                    )
                                  : 'No cards due right now. Great job staying on top of your reviews!',
                            }),
                            (0, r.jsx)('button', {
                              onClick: () => j('review'),
                              disabled: 0 === x,
                              className: 'btn btn-primary w-full mt-4',
                              children: 'Start Review',
                            }),
                          ],
                        }),
                        (0, r.jsxs)('div', {
                          className: 'card hover:border-[var(--primary)] transition-colors',
                          children: [
                            (0, r.jsx)('div', {
                              className:
                                'w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4',
                              children: (0, r.jsx)('svg', {
                                className: 'w-6 h-6 text-white',
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
                            }),
                            (0, r.jsx)('h2', {
                              className: 'text-lg font-semibold',
                              children: 'Study Session',
                            }),
                            (0, r.jsx)('p', {
                              className: 'text-sm text-[var(--foreground-muted)] mt-2',
                              children:
                                'Start a new study session with a mix of new and review cards.',
                            }),
                            (0, r.jsx)('button', {
                              onClick: () => j('all'),
                              className: 'btn btn-secondary w-full mt-4',
                              children: 'Start Session',
                            }),
                          ],
                        }),
                        (0, r.jsxs)('div', {
                          className: 'card hover:border-[var(--primary)] transition-colors',
                          children: [
                            (0, r.jsx)('div', {
                              className:
                                'w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mb-4',
                              children: (0, r.jsx)('svg', {
                                className: 'w-6 h-6 text-white',
                                fill: 'none',
                                stroke: 'currentColor',
                                viewBox: '0 0 24 24',
                                children: (0, r.jsx)('path', {
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  strokeWidth: 2,
                                  d: 'M12 4v16m8-8H4',
                                }),
                              }),
                            }),
                            (0, r.jsx)('h2', {
                              className: 'text-lg font-semibold',
                              children: 'Create Custom Card',
                            }),
                            (0, r.jsx)('p', {
                              className: 'text-sm text-[var(--foreground-muted)] mt-2',
                              children:
                                'Create your own flashcards for concepts you want to remember.',
                            }),
                            (0, r.jsx)(l.default, {
                              href: '/flashcards/create',
                              className: 'btn btn-secondary w-full mt-4',
                              children: 'Create Card',
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, r.jsxs)('div', {
                      className: 'card mt-8',
                      children: [
                        (0, r.jsx)('h2', {
                          className: 'font-semibold mb-4',
                          children: 'How Spaced Repetition Works',
                        }),
                        (0, r.jsxs)('div', {
                          className: 'grid md:grid-cols-3 gap-6',
                          children: [
                            (0, r.jsxs)('div', {
                              className: 'text-center',
                              children: [
                                (0, r.jsx)('div', {
                                  className:
                                    'w-12 h-12 rounded-full bg-[var(--success-light)] text-[var(--success)] flex items-center justify-center mx-auto mb-3',
                                  children: (0, r.jsx)('span', {
                                    className: 'text-lg font-bold',
                                    children: '1',
                                  }),
                                }),
                                (0, r.jsx)('p', { className: 'font-medium', children: 'Know It' }),
                                (0, r.jsx)('p', {
                                  className: 'text-sm text-[var(--foreground-muted)] mt-1',
                                  children: 'Cards you know well are shown less frequently.',
                                }),
                              ],
                            }),
                            (0, r.jsxs)('div', {
                              className: 'text-center',
                              children: [
                                (0, r.jsx)('div', {
                                  className:
                                    'w-12 h-12 rounded-full bg-[var(--warning-light)] text-[var(--warning)] flex items-center justify-center mx-auto mb-3',
                                  children: (0, r.jsx)('span', {
                                    className: 'text-lg font-bold',
                                    children: '2',
                                  }),
                                }),
                                (0, r.jsx)('p', { className: 'font-medium', children: 'Learning' }),
                                (0, r.jsx)('p', {
                                  className: 'text-sm text-[var(--foreground-muted)] mt-1',
                                  children: "Cards you're learning are shown more often.",
                                }),
                              ],
                            }),
                            (0, r.jsxs)('div', {
                              className: 'text-center',
                              children: [
                                (0, r.jsx)('div', {
                                  className:
                                    'w-12 h-12 rounded-full bg-[var(--error-light)] text-[var(--error)] flex items-center justify-center mx-auto mb-3',
                                  children: (0, r.jsx)('span', {
                                    className: 'text-lg font-bold',
                                    children: '3',
                                  }),
                                }),
                                (0, r.jsx)('p', {
                                  className: 'font-medium',
                                  children: "Don't Know",
                                }),
                                (0, r.jsx)('p', {
                                  className: 'text-sm text-[var(--foreground-muted)] mt-1',
                                  children: "Cards you don't know are shown again soon.",
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
    (e.O(0, [340, 644, 293, 528, 744], function () {
      return e((e.s = 6924));
    }),
      (_N_E = e.O()));
  },
]);
