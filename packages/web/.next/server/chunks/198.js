((exports.id = 198),
  (exports.ids = [198]),
  (exports.modules = {
    9674: (e, t, s) => {
      (Promise.resolve().then(s.t.bind(s, 4424, 23)),
        Promise.resolve().then(s.t.bind(s, 7752, 23)),
        Promise.resolve().then(s.t.bind(s, 5275, 23)),
        Promise.resolve().then(s.t.bind(s, 9842, 23)),
        Promise.resolve().then(s.t.bind(s, 1633, 23)),
        Promise.resolve().then(s.t.bind(s, 9224, 23)));
    },
    5653: (e, t, s) => {
      Promise.resolve().then(s.bind(s, 4076));
    },
    649: (e, t, s) => {
      'use strict';
      s.d(t, { default: () => r.a });
      var a = s(6568),
        r = s.n(a);
    },
    1043: (e, t, s) => {
      'use strict';
      var a = s(2854);
      (s.o(a, 'useParams') &&
        s.d(t, {
          useParams: function () {
            return a.useParams;
          },
        }),
        s.o(a, 'useRouter') &&
          s.d(t, {
            useRouter: function () {
              return a.useRouter;
            },
          }),
        s.o(a, 'useSearchParams') &&
          s.d(t, {
            useSearchParams: function () {
              return a.useSearchParams;
            },
          }));
    },
    4076: (e, t, s) => {
      'use strict';
      s.d(t, { Providers: () => l });
      var a = s(3227),
        r = s(2278),
        o = s(7674);
      let i = 'pmp_offline_sync_queue';
      class n {
        constructor() {
          ((this.queue = []), (this.isSyncing = !1));
        }
        loadQueue() {
          let e = localStorage.getItem(i);
          e && (this.queue = JSON.parse(e));
        }
        saveQueue() {
          localStorage.setItem(i, JSON.stringify(this.queue));
        }
        async queueAction(e, t) {
          let s = { id: crypto.randomUUID(), type: e, payload: t, timestamp: Date.now() };
          (this.queue.push(s), this.saveQueue(), navigator.onLine && (await this.sync()));
        }
        async sync() {
          if (this.isSyncing || 0 === this.queue.length || !navigator.onLine) return;
          this.isSyncing = !0;
          let e = [],
            t = [...this.queue];
          for (let s of (console.log(`[Sync] Processing ${t.length} actions...`), t))
            try {
              await this.processAction(s);
            } catch (t) {
              (console.error(`[Sync] Failed to process action ${s.id}`, t), e.push(s));
            }
          ((this.queue = e),
            this.saveQueue(),
            (this.isSyncing = !1),
            0 === e.length
              ? console.log('[Sync] Synchronization complete.')
              : console.warn(`[Sync] Completed with ${e.length} failures.`));
        }
        async processAction(e) {
          switch (e.type) {
            case 'MARK_SECTION_COMPLETE':
              await (0, o.Nv)(`/study/sections/${e.payload.sectionId}/complete`, {
                method: 'POST',
              });
              break;
            case 'SUBMIT_FLASHCARD_RESULT':
              await (0, o.Nv)(`/flashcards/${e.payload.flashcardId}/review`, {
                method: 'POST',
                body: JSON.stringify({ quality: e.payload.quality }),
              });
              break;
            default:
              console.warn('Unknown action type', e.type);
          }
        }
      }
      function l({ children: e }) {
        return a.jsx(r.H, { children: e });
      }
      new n();
    },
    2932: (e, t, s) => {
      'use strict';
      s.d(t, { w: () => d });
      var a = s(3227),
        r = s(649),
        o = s(2278),
        i = s(3677),
        n = s(1043);
      function l({ open: e, setOpen: t }) {
        (0, n.useRouter)();
        let [s, o] = (0, i.useState)(''),
          [l, d] = (0, i.useState)([]),
          [c, u] = (0, i.useState)(!1),
          h = (0, i.useRef)(null);
        return e
          ? (0, a.jsxs)('div', {
              className: 'relative z-[100]',
              role: 'dialog',
              'aria-modal': 'true',
              children: [
                a.jsx('div', {
                  className: 'fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity',
                  onClick: () => t(!1),
                }),
                a.jsx('div', {
                  className: 'fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-20',
                  children: (0, a.jsxs)('div', {
                    className:
                      'mx-auto max-w-2xl transform divide-y divide-gray-800 rounded-xl bg-gray-900 border border-gray-700 shadow-2xl transition-all',
                    children: [
                      (0, a.jsxs)('div', {
                        className: 'relative',
                        children: [
                          a.jsx('div', {
                            className:
                              'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400',
                            children: a.jsx('svg', {
                              className: 'h-5 w-5',
                              viewBox: '0 0 20 20',
                              fill: 'currentColor',
                              'aria-hidden': 'true',
                              children: a.jsx('path', {
                                fillRule: 'evenodd',
                                d: 'M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z',
                                clipRule: 'evenodd',
                              }),
                            }),
                          }),
                          a.jsx('input', {
                            ref: h,
                            type: 'text',
                            className:
                              'h-12 w-full border-0 bg-transparent pl-11 pr-4 text-white placeholder:text-gray-400 focus:ring-0 sm:text-sm',
                            placeholder: 'Search study guides, flashcards, questions...',
                            value: s,
                            onChange: e => o(e.target.value),
                          }),
                        ],
                      }),
                      c
                        ? a.jsx('div', {
                            className: 'p-4 text-center text-sm text-gray-400',
                            children: 'Searching...',
                          })
                        : 0 === l.length && s.trim().length >= 2
                          ? (0, a.jsxs)('div', {
                              className: 'p-4 text-center text-sm text-gray-400',
                              children: ['No results found for "', s, '"'],
                            })
                          : l.length > 0
                            ? a.jsx('ul', {
                                className:
                                  'max-h-96 scroll-py-2 overflow-y-auto py-2 text-sm text-gray-200',
                                children: l.map(e =>
                                  a.jsx(
                                    'li',
                                    {
                                      children: (0, a.jsxs)(r.default, {
                                        href: (function (e) {
                                          switch (e.type) {
                                            case 'study_guide':
                                              return `/study/${e.taskId}`;
                                            case 'flashcard':
                                              return '/flashcards';
                                            case 'question':
                                              return '/practice';
                                            case 'formula':
                                              return '/formulas';
                                            default:
                                              return '/dashboard';
                                          }
                                        })(e),
                                        className:
                                          'group flex select-none items-center px-4 py-2 hover:bg-gray-800 hover:text-white',
                                        children: [
                                          a.jsx('span', {
                                            className: 'flex-none text-xl mr-3',
                                            children: (function (e) {
                                              switch (e) {
                                                case 'study_guide':
                                                  return '\uD83D\uDCDA';
                                                case 'flashcard':
                                                  return '\uD83D\uDDC2️';
                                                case 'question':
                                                  return '❓';
                                                case 'formula':
                                                  return '∑';
                                                default:
                                                  return '\uD83D\uDCC4';
                                              }
                                            })(e.type),
                                          }),
                                          (0, a.jsxs)('div', {
                                            className: 'flex-auto truncate',
                                            children: [
                                              a.jsx('p', {
                                                className: 'truncate font-medium',
                                                children: e.title,
                                              }),
                                              a.jsx('p', {
                                                className: 'truncate text-xs text-gray-500',
                                                children: e.excerpt,
                                              }),
                                            ],
                                          }),
                                          a.jsx('span', {
                                            className:
                                              'ml-3 flex-none text-xs font-medium text-gray-500 capitalize',
                                            children: e.type.replace('_', ' '),
                                          }),
                                        ],
                                      }),
                                    },
                                    `${e.type}-${e.id}`
                                  )
                                ),
                              })
                            : a.jsx('div', {
                                className: 'py-14 px-6 text-center text-sm sm:px-14',
                                children: (0, a.jsxs)('p', {
                                  className: 'mt-4 text-gray-400',
                                  children: [
                                    'Press',
                                    ' ',
                                    a.jsx('kbd', {
                                      className:
                                        'mx-1 flex h-5 w-5 items-center justify-center rounded border border-gray-700 bg-gray-800 font-semibold text-white sm:mx-2',
                                      children: '↵',
                                    }),
                                    ' ',
                                    'to select,',
                                    ' ',
                                    a.jsx('kbd', {
                                      className:
                                        'mx-1 flex h-5 w-5 items-center justify-center rounded border border-gray-700 bg-gray-800 font-semibold text-white sm:mx-2',
                                      children: 'Esc',
                                    }),
                                    ' ',
                                    'to close',
                                  ],
                                }),
                              }),
                    ],
                  }),
                }),
              ],
            })
          : null;
      }
      function d() {
        let { user: e, isAuthenticated: t, logout: s } = (0, o.a)(),
          [n, d] = (0, i.useState)(!1),
          [c, u] = (0, i.useState)(!1);
        return (0, a.jsxs)(a.Fragment, {
          children: [
            a.jsx('nav', {
              className: 'glass border-b border-[var(--border)] sticky top-0 z-50',
              children: (0, a.jsxs)('div', {
                className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
                children: [
                  (0, a.jsxs)('div', {
                    className: 'flex justify-between h-16',
                    children: [
                      a.jsx('div', {
                        className: 'flex items-center',
                        children: (0, a.jsxs)(r.default, {
                          href: '/',
                          className: 'flex items-center gap-2',
                          children: [
                            a.jsx('div', {
                              className:
                                'w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center',
                              children: a.jsx('span', {
                                className: 'text-white font-bold text-sm',
                                children: 'PM',
                              }),
                            }),
                            a.jsx('span', {
                              className: 'font-semibold text-lg hidden sm:block',
                              children: 'PMP Study Pro',
                            }),
                          ],
                        }),
                      }),
                      t &&
                        (0, a.jsxs)('div', {
                          className: 'hidden md:flex items-center gap-6',
                          children: [
                            a.jsx(r.default, {
                              href: '/dashboard',
                              className:
                                'text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition',
                              children: 'Dashboard',
                            }),
                            a.jsx(r.default, {
                              href: '/study',
                              className:
                                'text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition',
                              children: 'Study',
                            }),
                            a.jsx(r.default, {
                              href: '/flashcards',
                              className:
                                'text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition',
                              children: 'Flashcards',
                            }),
                            a.jsx(r.default, {
                              href: '/practice',
                              className:
                                'text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition',
                              children: 'Practice',
                            }),
                            a.jsx(r.default, {
                              href: '/formulas',
                              className:
                                'text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition',
                              children: 'Formulas',
                            }),
                          ],
                        }),
                      (0, a.jsxs)('div', {
                        className: 'flex items-center gap-4',
                        children: [
                          t &&
                            a.jsx('button', {
                              type: 'button',
                              onClick: () => u(!0),
                              className: 'p-2 text-gray-400 hover:text-white transition-colors',
                              'aria-label': 'Search',
                              children: a.jsx('svg', {
                                className: 'h-5 w-5',
                                viewBox: '0 0 20 20',
                                fill: 'currentColor',
                                'aria-hidden': 'true',
                                children: a.jsx('path', {
                                  fillRule: 'evenodd',
                                  d: 'M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z',
                                  clipRule: 'evenodd',
                                }),
                              }),
                            }),
                          t
                            ? (0, a.jsxs)('div', {
                                className: 'flex items-center gap-3',
                                children: [
                                  (0, a.jsxs)('div', {
                                    className: 'hidden sm:block text-sm',
                                    children: [
                                      a.jsx('p', { className: 'font-medium', children: e?.name }),
                                      (0, a.jsxs)('p', {
                                        className:
                                          'text-[var(--foreground-muted)] text-xs capitalize',
                                        children: [e?.tier, ' Tier'],
                                      }),
                                    ],
                                  }),
                                  a.jsx('button', {
                                    onClick: s,
                                    className: 'btn btn-secondary text-sm',
                                    children: 'Logout',
                                  }),
                                ],
                              })
                            : (0, a.jsxs)('div', {
                                className: 'flex items-center gap-2',
                                children: [
                                  a.jsx(r.default, {
                                    href: '/login',
                                    className: 'btn btn-secondary text-sm',
                                    children: 'Login',
                                  }),
                                  a.jsx(r.default, {
                                    href: '/register',
                                    className: 'btn btn-primary text-sm',
                                    children: 'Get Started',
                                  }),
                                ],
                              }),
                          t &&
                            a.jsx('button', {
                              onClick: () => d(!n),
                              className: 'md:hidden p-2 text-[var(--foreground-muted)]',
                              children: a.jsx('svg', {
                                className: 'w-6 h-6',
                                fill: 'none',
                                stroke: 'currentColor',
                                viewBox: '0 0 24 24',
                                children: n
                                  ? a.jsx('path', {
                                      strokeLinecap: 'round',
                                      strokeLinejoin: 'round',
                                      strokeWidth: 2,
                                      d: 'M6 18L18 6M6 6l12 12',
                                    })
                                  : a.jsx('path', {
                                      strokeLinecap: 'round',
                                      strokeLinejoin: 'round',
                                      strokeWidth: 2,
                                      d: 'M4 6h16M4 12h16M4 18h16',
                                    }),
                              }),
                            }),
                        ],
                      }),
                    ],
                  }),
                  t &&
                    n &&
                    a.jsx('div', {
                      className: 'md:hidden py-4 border-t border-[var(--border)]',
                      children: (0, a.jsxs)('div', {
                        className: 'flex flex-col gap-2',
                        children: [
                          a.jsx(r.default, {
                            href: '/dashboard',
                            className: 'px-4 py-2 hover:bg-[var(--secondary)] rounded-lg',
                            children: 'Dashboard',
                          }),
                          a.jsx(r.default, {
                            href: '/study',
                            className: 'px-4 py-2 hover:bg-[var(--secondary)] rounded-lg',
                            children: 'Study',
                          }),
                          a.jsx(r.default, {
                            href: '/flashcards',
                            className: 'px-4 py-2 hover:bg-[var(--secondary)] rounded-lg',
                            children: 'Flashcards',
                          }),
                          a.jsx(r.default, {
                            href: '/practice',
                            className: 'px-4 py-2 hover:bg-[var(--secondary)] rounded-lg',
                            children: 'Practice',
                          }),
                          a.jsx(r.default, {
                            href: '/formulas',
                            className: 'px-4 py-2 hover:bg-[var(--secondary)] rounded-lg',
                            children: 'Formulas',
                          }),
                        ],
                      }),
                    }),
                ],
              }),
            }),
            a.jsx(l, { open: c, setOpen: u }),
          ],
        });
      }
      s(7674);
    },
    2278: (e, t, s) => {
      'use strict';
      s.d(t, { H: () => n, a: () => l });
      var a = s(3227),
        r = s(3677);
      let o = (0, r.createContext)(void 0),
        i = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      function n({ children: e }) {
        let [t, s] = (0, r.useState)({
            user: null,
            token: null,
            isLoading: !0,
            isAuthenticated: !1,
          }),
          n = async e => {
            try {
              let t = await fetch(`${i}/auth/me`, { headers: { Authorization: `Bearer ${e}` } });
              if (t.ok) {
                let a = await t.json();
                s({ user: a.data.user, token: e, isLoading: !1, isAuthenticated: !0 });
              } else await u();
            } catch (e) {
              (console.error('Failed to fetch user:', e), c());
            }
          },
          l = async (e, t) => {
            let a = await fetch(`${i}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: e, password: t }),
              }),
              r = await a.json();
            if (!a.ok) throw Error(r.error?.message || 'Login failed');
            let { accessToken: o, refreshToken: n, user: l } = r.data;
            (localStorage.setItem('accessToken', o),
              localStorage.setItem('refreshToken', n),
              s({ user: l, token: o, isLoading: !1, isAuthenticated: !0 }));
          },
          d = async (e, t, a) => {
            let r = await fetch(`${i}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: e, password: t, name: a }),
              }),
              o = await r.json();
            if (!r.ok) throw Error(o.error?.message || 'Registration failed');
            let { accessToken: n, refreshToken: l, user: d } = o.data;
            (localStorage.setItem('accessToken', n),
              localStorage.setItem('refreshToken', l),
              s({ user: d, token: n, isLoading: !1, isAuthenticated: !0 }));
          },
          c = () => {
            (localStorage.removeItem('accessToken'),
              localStorage.removeItem('refreshToken'),
              s({ user: null, token: null, isLoading: !1, isAuthenticated: !1 }));
          },
          u = async () => {
            let e = localStorage.getItem('refreshToken');
            if (!e) {
              c();
              return;
            }
            try {
              let t = await fetch(`${i}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: e }),
              });
              if (t.ok) {
                let { accessToken: e, refreshToken: s } = (await t.json()).data;
                (localStorage.setItem('accessToken', e),
                  localStorage.setItem('refreshToken', s),
                  await n(e));
              } else c();
            } catch (e) {
              (console.error('Token refresh failed:', e), c());
            }
          };
        return a.jsx(o.Provider, {
          value: { ...t, login: l, register: d, logout: c, refreshToken: u },
          children: e,
        });
      }
      function l() {
        let e = (0, r.useContext)(o);
        if (void 0 === e) throw Error('useAuth must be used within an AuthProvider');
        return e;
      }
    },
    7674: (e, t, s) => {
      'use strict';
      s.d(t, { Lc: () => n, Nv: () => o, Sh: () => c, kx: () => d, sA: () => i, tF: () => l });
      let a = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      async function r() {
        return null;
      }
      async function o(e, t = {}) {
        let { method: s = 'GET', body: o, token: i } = t,
          n = i ?? (await r()),
          l = { 'Content-Type': 'application/json' };
        n && (l.Authorization = `Bearer ${n}`);
        let d = await fetch(`${a}${e}`, {
            method: s,
            headers: l,
            body: o ? JSON.stringify(o) : void 0,
          }),
          c = await d.json();
        if (!d.ok) throw Error(c.error?.message || 'Request failed');
        return c;
      }
      let i = {
          getDomains: () => o('/domains'),
          getDomain: e => o(`/domains/${e}`),
          getTasks: e => o(`/domains/${e}/tasks`),
          getStudyGuide: e => o(`/domains/tasks/${e}/study-guide`),
          markSectionComplete: e =>
            o(`/domains/progress/sections/${e}/complete`, { method: 'POST' }),
          getProgress: () => o('/domains/progress'),
        },
        n = {
          getFlashcards: e => {
            let t = new URLSearchParams();
            return (
              e?.domainId && t.set('domainId', e.domainId),
              e?.taskId && t.set('taskId', e.taskId),
              e?.limit && t.set('limit', String(e.limit)),
              o(`/flashcards?${t}`)
            );
          },
          getDueForReview: e => o(`/flashcards/review${e ? `?limit=${e}` : ''}`),
          getStats: () => o('/flashcards/stats'),
          startSession: e => o('/flashcards/sessions', { method: 'POST', body: e }),
          recordResponse: (e, t, s, a) =>
            o(`/flashcards/sessions/${e}/responses/${t}`, {
              method: 'POST',
              body: { rating: s, timeSpentMs: a },
            }),
          completeSession: e => o(`/flashcards/sessions/${e}/complete`, { method: 'POST' }),
          createCustom: e => o('/flashcards/custom', { method: 'POST', body: e }),
        },
        l = {
          startSession: e => o('/practice/sessions', { method: 'POST', body: e }),
          submitAnswer: (e, t, s, a) =>
            o(`/practice/sessions/${e}/answers/${t}`, {
              method: 'POST',
              body: { selectedOptionId: s, timeSpentMs: a },
            }),
          completeSession: e => o(`/practice/sessions/${e}/complete`, { method: 'POST' }),
          startMockExam: () => o('/practice/mock-exams', { method: 'POST' }),
          getFlagged: () => o('/practice/flagged'),
          flagQuestion: e => o(`/practice/questions/${e}/flag`, { method: 'POST' }),
          unflagQuestion: e => o(`/practice/questions/${e}/flag`, { method: 'DELETE' }),
          getStats: () => o('/practice/stats'),
        },
        d = {
          getDashboard: () => o('/dashboard'),
          getStreak: () => o('/dashboard/streak'),
          getProgress: () => o('/dashboard/progress'),
          getActivity: e => o(`/dashboard/activity${e ? `?limit=${e}` : ''}`),
          getReviews: e => o(`/dashboard/reviews${e ? `?limit=${e}` : ''}`),
          getWeakAreas: () => o('/dashboard/weak-areas'),
          getReadiness: () => o('/dashboard/readiness'),
          getRecommendations: () => o('/dashboard/recommendations'),
        },
        c = {
          getFormulas: e => o(`/formulas${e ? `?category=${e}` : ''}`),
          getFormula: e => o(`/formulas/${e}`),
          calculate: (e, t) =>
            o(`/formulas/${e}/calculate`, { method: 'POST', body: { inputs: t } }),
          getVariables: () => o('/formulas/variables'),
        };
    },
    4773: (e, t, s) => {
      'use strict';
      (s.r(t), s.d(t, { default: () => l, metadata: () => n }));
      var a = s(9013),
        r = s(5900),
        o = s.n(r);
      s(5556);
      let i = (0, s(3189).createProxy)(
          String.raw`/Users/dustinober/Projects/pmp_application/packages/web/src/app/providers.tsx#Providers`
        ),
        n = {
          title: 'PMP Study Pro',
          description: 'Comprehensive study platform for the 2026 PMP certification exam',
          keywords: ['PMP', 'Project Management', 'Certification', 'Study', 'Exam Prep'],
          manifest: '/manifest.json',
          themeColor: '#7c3aed',
          viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
          appleWebApp: { capable: !0, statusBarStyle: 'default', title: 'PMP Pro' },
        };
      function l({ children: e }) {
        return a.jsx('html', {
          lang: 'en',
          children: a.jsx('body', {
            className: o().className,
            children: a.jsx(i, { children: e }),
          }),
        });
      }
    },
    5556: () => {},
  }));
