((exports.id = 516),
  (exports.ids = [516]),
  (exports.modules = {
    9674: (e, s, t) => {
      (Promise.resolve().then(t.t.bind(t, 4424, 23)),
        Promise.resolve().then(t.t.bind(t, 7752, 23)),
        Promise.resolve().then(t.t.bind(t, 5275, 23)),
        Promise.resolve().then(t.t.bind(t, 9842, 23)),
        Promise.resolve().then(t.t.bind(t, 1633, 23)),
        Promise.resolve().then(t.t.bind(t, 9224, 23)));
    },
    5653: (e, s, t) => {
      Promise.resolve().then(t.bind(t, 3592));
    },
    649: (e, s, t) => {
      'use strict';
      t.d(s, { default: () => a.a });
      var r = t(6568),
        a = t.n(r);
    },
    1043: (e, s, t) => {
      'use strict';
      var r = t(2854);
      (t.o(r, 'useParams') &&
        t.d(s, {
          useParams: function () {
            return r.useParams;
          },
        }),
        t.o(r, 'useRouter') &&
          t.d(s, {
            useRouter: function () {
              return r.useRouter;
            },
          }),
        t.o(r, 'useSearchParams') &&
          t.d(s, {
            useSearchParams: function () {
              return r.useSearchParams;
            },
          }));
    },
    3592: (e, s, t) => {
      'use strict';
      t.d(s, { Providers: () => o });
      var r = t(3227),
        a = t(2278);
      function o({ children: e }) {
        return r.jsx(a.H, { children: e });
      }
    },
    7705: (e, s, t) => {
      'use strict';
      t.d(s, { w: () => n });
      var r = t(3227),
        a = t(649),
        o = t(2278),
        i = t(3677);
      function n() {
        let { user: e, isAuthenticated: s, logout: t } = (0, o.a)(),
          [n, d] = (0, i.useState)(!1);
        return r.jsx('nav', {
          className: 'glass border-b border-[var(--border)] sticky top-0 z-50',
          children: (0, r.jsxs)('div', {
            className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
            children: [
              (0, r.jsxs)('div', {
                className: 'flex justify-between h-16',
                children: [
                  r.jsx('div', {
                    className: 'flex items-center',
                    children: (0, r.jsxs)(a.default, {
                      href: '/',
                      className: 'flex items-center gap-2',
                      children: [
                        r.jsx('div', {
                          className:
                            'w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center',
                          children: r.jsx('span', {
                            className: 'text-white font-bold text-sm',
                            children: 'PM',
                          }),
                        }),
                        r.jsx('span', {
                          className: 'font-semibold text-lg hidden sm:block',
                          children: 'PMP Study Pro',
                        }),
                      ],
                    }),
                  }),
                  s &&
                    (0, r.jsxs)('div', {
                      className: 'hidden md:flex items-center gap-6',
                      children: [
                        r.jsx(a.default, {
                          href: '/dashboard',
                          className:
                            'text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition',
                          children: 'Dashboard',
                        }),
                        r.jsx(a.default, {
                          href: '/study',
                          className:
                            'text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition',
                          children: 'Study',
                        }),
                        r.jsx(a.default, {
                          href: '/flashcards',
                          className:
                            'text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition',
                          children: 'Flashcards',
                        }),
                        r.jsx(a.default, {
                          href: '/practice',
                          className:
                            'text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition',
                          children: 'Practice',
                        }),
                        r.jsx(a.default, {
                          href: '/formulas',
                          className:
                            'text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition',
                          children: 'Formulas',
                        }),
                      ],
                    }),
                  (0, r.jsxs)('div', {
                    className: 'flex items-center gap-4',
                    children: [
                      s
                        ? (0, r.jsxs)('div', {
                            className: 'flex items-center gap-3',
                            children: [
                              (0, r.jsxs)('div', {
                                className: 'hidden sm:block text-sm',
                                children: [
                                  r.jsx('p', { className: 'font-medium', children: e?.name }),
                                  (0, r.jsxs)('p', {
                                    className: 'text-[var(--foreground-muted)] text-xs capitalize',
                                    children: [e?.tier, ' Tier'],
                                  }),
                                ],
                              }),
                              r.jsx('button', {
                                onClick: t,
                                className: 'btn btn-secondary text-sm',
                                children: 'Logout',
                              }),
                            ],
                          })
                        : (0, r.jsxs)('div', {
                            className: 'flex items-center gap-2',
                            children: [
                              r.jsx(a.default, {
                                href: '/login',
                                className: 'btn btn-secondary text-sm',
                                children: 'Login',
                              }),
                              r.jsx(a.default, {
                                href: '/register',
                                className: 'btn btn-primary text-sm',
                                children: 'Get Started',
                              }),
                            ],
                          }),
                      s &&
                        r.jsx('button', {
                          onClick: () => d(!n),
                          className: 'md:hidden p-2 text-[var(--foreground-muted)]',
                          children: r.jsx('svg', {
                            className: 'w-6 h-6',
                            fill: 'none',
                            stroke: 'currentColor',
                            viewBox: '0 0 24 24',
                            children: n
                              ? r.jsx('path', {
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  strokeWidth: 2,
                                  d: 'M6 18L18 6M6 6l12 12',
                                })
                              : r.jsx('path', {
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
              s &&
                n &&
                r.jsx('div', {
                  className: 'md:hidden py-4 border-t border-[var(--border)]',
                  children: (0, r.jsxs)('div', {
                    className: 'flex flex-col gap-2',
                    children: [
                      r.jsx(a.default, {
                        href: '/dashboard',
                        className: 'px-4 py-2 hover:bg-[var(--secondary)] rounded-lg',
                        children: 'Dashboard',
                      }),
                      r.jsx(a.default, {
                        href: '/study',
                        className: 'px-4 py-2 hover:bg-[var(--secondary)] rounded-lg',
                        children: 'Study',
                      }),
                      r.jsx(a.default, {
                        href: '/flashcards',
                        className: 'px-4 py-2 hover:bg-[var(--secondary)] rounded-lg',
                        children: 'Flashcards',
                      }),
                      r.jsx(a.default, {
                        href: '/practice',
                        className: 'px-4 py-2 hover:bg-[var(--secondary)] rounded-lg',
                        children: 'Practice',
                      }),
                      r.jsx(a.default, {
                        href: '/formulas',
                        className: 'px-4 py-2 hover:bg-[var(--secondary)] rounded-lg',
                        children: 'Formulas',
                      }),
                    ],
                  }),
                }),
            ],
          }),
        });
      }
    },
    2278: (e, s, t) => {
      'use strict';
      t.d(s, { H: () => n, a: () => d });
      var r = t(3227),
        a = t(3677);
      let o = (0, a.createContext)(void 0),
        i = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      function n({ children: e }) {
        let [s, t] = (0, a.useState)({
            user: null,
            token: null,
            isLoading: !0,
            isAuthenticated: !1,
          }),
          n = async e => {
            try {
              let s = await fetch(`${i}/auth/me`, { headers: { Authorization: `Bearer ${e}` } });
              if (s.ok) {
                let r = await s.json();
                t({ user: r.data.user, token: e, isLoading: !1, isAuthenticated: !0 });
              } else await h();
            } catch (e) {
              (console.error('Failed to fetch user:', e), c());
            }
          },
          d = async (e, s) => {
            let r = await fetch(`${i}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: e, password: s }),
              }),
              a = await r.json();
            if (!r.ok) throw Error(a.error?.message || 'Login failed');
            let { accessToken: o, refreshToken: n, user: d } = a.data;
            (localStorage.setItem('accessToken', o),
              localStorage.setItem('refreshToken', n),
              t({ user: d, token: o, isLoading: !1, isAuthenticated: !0 }));
          },
          l = async (e, s, r) => {
            let a = await fetch(`${i}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: e, password: s, name: r }),
              }),
              o = await a.json();
            if (!a.ok) throw Error(o.error?.message || 'Registration failed');
            let { accessToken: n, refreshToken: d, user: l } = o.data;
            (localStorage.setItem('accessToken', n),
              localStorage.setItem('refreshToken', d),
              t({ user: l, token: n, isLoading: !1, isAuthenticated: !0 }));
          },
          c = () => {
            (localStorage.removeItem('accessToken'),
              localStorage.removeItem('refreshToken'),
              t({ user: null, token: null, isLoading: !1, isAuthenticated: !1 }));
          },
          h = async () => {
            let e = localStorage.getItem('refreshToken');
            if (!e) {
              c();
              return;
            }
            try {
              let s = await fetch(`${i}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: e }),
              });
              if (s.ok) {
                let { accessToken: e, refreshToken: t } = (await s.json()).data;
                (localStorage.setItem('accessToken', e),
                  localStorage.setItem('refreshToken', t),
                  await n(e));
              } else c();
            } catch (e) {
              (console.error('Token refresh failed:', e), c());
            }
          };
        return r.jsx(o.Provider, {
          value: { ...s, login: d, register: l, logout: c, refreshToken: h },
          children: e,
        });
      }
      function d() {
        let e = (0, a.useContext)(o);
        if (void 0 === e) throw Error('useAuth must be used within an AuthProvider');
        return e;
      }
    },
    7674: (e, s, t) => {
      'use strict';
      t.d(s, { Lc: () => n, Nv: () => o, Sh: () => c, kx: () => l, sA: () => i, tF: () => d });
      let r = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      async function a() {
        return null;
      }
      async function o(e, s = {}) {
        let { method: t = 'GET', body: o, token: i } = s,
          n = i ?? (await a()),
          d = { 'Content-Type': 'application/json' };
        n && (d.Authorization = `Bearer ${n}`);
        let l = await fetch(`${r}${e}`, {
            method: t,
            headers: d,
            body: o ? JSON.stringify(o) : void 0,
          }),
          c = await l.json();
        if (!l.ok) throw Error(c.error?.message || 'Request failed');
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
            let s = new URLSearchParams();
            return (
              e?.domainId && s.set('domainId', e.domainId),
              e?.taskId && s.set('taskId', e.taskId),
              e?.limit && s.set('limit', String(e.limit)),
              o(`/flashcards?${s}`)
            );
          },
          getDueForReview: e => o(`/flashcards/review${e ? `?limit=${e}` : ''}`),
          getStats: () => o('/flashcards/stats'),
          startSession: e => o('/flashcards/sessions', { method: 'POST', body: e }),
          recordResponse: (e, s, t, r) =>
            o(`/flashcards/sessions/${e}/responses/${s}`, {
              method: 'POST',
              body: { rating: t, timeSpentMs: r },
            }),
          completeSession: e => o(`/flashcards/sessions/${e}/complete`, { method: 'POST' }),
          createCustom: e => o('/flashcards/custom', { method: 'POST', body: e }),
        },
        d = {
          startSession: e => o('/practice/sessions', { method: 'POST', body: e }),
          submitAnswer: (e, s, t, r) =>
            o(`/practice/sessions/${e}/answers/${s}`, {
              method: 'POST',
              body: { selectedOptionId: t, timeSpentMs: r },
            }),
          completeSession: e => o(`/practice/sessions/${e}/complete`, { method: 'POST' }),
          startMockExam: () => o('/practice/mock-exams', { method: 'POST' }),
          getFlagged: () => o('/practice/flagged'),
          flagQuestion: e => o(`/practice/questions/${e}/flag`, { method: 'POST' }),
          unflagQuestion: e => o(`/practice/questions/${e}/flag`, { method: 'DELETE' }),
          getStats: () => o('/practice/stats'),
        },
        l = {
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
          calculate: (e, s) =>
            o(`/formulas/${e}/calculate`, { method: 'POST', body: { inputs: s } }),
          getVariables: () => o('/formulas/variables'),
        };
    },
    4773: (e, s, t) => {
      'use strict';
      (t.r(s), t.d(s, { default: () => d, metadata: () => n }));
      var r = t(9013),
        a = t(5900),
        o = t.n(a);
      t(5556);
      let i = (0, t(3189).createProxy)(
          String.raw`/Users/dustinober/Projects/pmp_application/packages/web/src/app/providers.tsx#Providers`
        ),
        n = {
          title: 'PMP Study Pro',
          description: 'Comprehensive study platform for the 2026 PMP certification exam',
          keywords: ['PMP', 'Project Management', 'Certification', 'Study', 'Exam Prep'],
        };
      function d({ children: e }) {
        return r.jsx('html', {
          lang: 'en',
          children: r.jsx('body', {
            className: o().className,
            children: r.jsx(i, { children: e }),
          }),
        });
      }
    },
    5556: () => {},
  }));
