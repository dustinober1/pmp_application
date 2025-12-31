(() => {
  var e = {};
  ((e.id = 11),
    (e.ids = [11]),
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
      1518: (e, t, s) => {
        'use strict';
        (s.r(t),
          s.d(t, {
            GlobalError: () => i.a,
            __next_app__: () => m,
            originalPathname: () => u,
            pages: () => d,
            routeModule: () => h,
            tree: () => c,
          }),
          s(6870),
          s(4773),
          s(7824));
        var a = s(3282),
          r = s(5736),
          o = s(3906),
          i = s.n(o),
          n = s(6880),
          l = {};
        for (let e in n)
          0 >
            [
              'default',
              'tree',
              'pages',
              'GlobalError',
              'originalPathname',
              '__next_app__',
              'routeModule',
            ].indexOf(e) && (l[e] = () => n[e]);
        s.d(t, l);
        let c = [
            '',
            {
              children: [
                'register',
                {
                  children: [
                    '__PAGE__',
                    {},
                    {
                      page: [
                        () => Promise.resolve().then(s.bind(s, 6870)),
                        '/Users/dustinober/Projects/pmp_application/packages/web/src/app/register/page.tsx',
                      ],
                    },
                  ],
                },
                {},
              ],
            },
            {
              layout: [
                () => Promise.resolve().then(s.bind(s, 4773)),
                '/Users/dustinober/Projects/pmp_application/packages/web/src/app/layout.tsx',
              ],
              'not-found': [
                () => Promise.resolve().then(s.t.bind(s, 7824, 23)),
                'next/dist/client/components/not-found-error',
              ],
            },
          ],
          d = ['/Users/dustinober/Projects/pmp_application/packages/web/src/app/register/page.tsx'],
          u = '/register/page',
          m = { require: s, loadChunk: () => Promise.resolve() },
          h = new a.AppPageRouteModule({
            definition: {
              kind: r.x.APP_PAGE,
              page: '/register/page',
              pathname: '/register',
              bundlePath: '',
              filename: '',
              appPaths: [],
            },
            userland: { loaderTree: c },
          });
      },
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
      3286: (e, t, s) => {
        Promise.resolve().then(s.bind(s, 2254));
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
      2254: (e, t, s) => {
        'use strict';
        (s.r(t), s.d(t, { default: () => l }));
        var a = s(3227),
          r = s(3677),
          o = s(1043),
          i = s(649),
          n = s(2278);
        function l() {
          let e = (0, o.useRouter)(),
            { register: t, isLoading: s } = (0, n.a)(),
            [l, c] = (0, r.useState)(''),
            [d, u] = (0, r.useState)(''),
            [m, h] = (0, r.useState)(''),
            [p, g] = (0, r.useState)(''),
            [f, x] = (0, r.useState)(''),
            [y, v] = (0, r.useState)(!1),
            b = async s => {
              if ((s.preventDefault(), x(''), m !== p)) {
                x('Passwords do not match');
                return;
              }
              if (m.length < 8) {
                x('Password must be at least 8 characters');
                return;
              }
              v(!0);
              try {
                (await t(d, m, l), e.push('/dashboard'));
              } catch (e) {
                x(e instanceof Error ? e.message : 'Registration failed');
              } finally {
                v(!1);
              }
            };
          return (0, a.jsxs)('div', {
            className: 'min-h-screen flex items-center justify-center px-4 py-12',
            children: [
              a.jsx('div', {
                className:
                  'absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-purple-600 to-indigo-800 opacity-5',
              }),
              (0, a.jsxs)('div', {
                className: 'card w-full max-w-md animate-slideUp relative',
                children: [
                  (0, a.jsxs)('div', {
                    className: 'text-center mb-8',
                    children: [
                      a.jsx(i.default, {
                        href: '/',
                        className: 'inline-flex items-center gap-2 mb-6',
                        children: a.jsx('div', {
                          className:
                            'w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center',
                          children: a.jsx('span', {
                            className: 'text-white font-bold',
                            children: 'PM',
                          }),
                        }),
                      }),
                      a.jsx('h1', {
                        className: 'text-2xl font-bold',
                        children: 'Create Your Account',
                      }),
                      a.jsx('p', {
                        className: 'text-[var(--foreground-muted)] mt-2',
                        children: 'Start your PMP certification journey today',
                      }),
                    ],
                  }),
                  (0, a.jsxs)('form', {
                    onSubmit: b,
                    className: 'space-y-4',
                    children: [
                      f &&
                        a.jsx('div', {
                          className:
                            'p-3 rounded-lg bg-[var(--error-light)] text-[var(--error)] text-sm',
                          children: f,
                        }),
                      (0, a.jsxs)('div', {
                        children: [
                          a.jsx('label', {
                            htmlFor: 'name',
                            className: 'block text-sm font-medium mb-1',
                            children: 'Full Name',
                          }),
                          a.jsx('input', {
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
                      (0, a.jsxs)('div', {
                        children: [
                          a.jsx('label', {
                            htmlFor: 'email',
                            className: 'block text-sm font-medium mb-1',
                            children: 'Email',
                          }),
                          a.jsx('input', {
                            id: 'email',
                            type: 'email',
                            value: d,
                            onChange: e => u(e.target.value),
                            className: 'input',
                            placeholder: 'you@example.com',
                            required: !0,
                          }),
                        ],
                      }),
                      (0, a.jsxs)('div', {
                        children: [
                          a.jsx('label', {
                            htmlFor: 'password',
                            className: 'block text-sm font-medium mb-1',
                            children: 'Password',
                          }),
                          a.jsx('input', {
                            id: 'password',
                            type: 'password',
                            value: m,
                            onChange: e => h(e.target.value),
                            className: 'input',
                            placeholder: '••••••••',
                            required: !0,
                            minLength: 8,
                          }),
                          a.jsx('p', {
                            className: 'text-xs text-[var(--foreground-muted)] mt-1',
                            children: 'Minimum 8 characters',
                          }),
                        ],
                      }),
                      (0, a.jsxs)('div', {
                        children: [
                          a.jsx('label', {
                            htmlFor: 'confirmPassword',
                            className: 'block text-sm font-medium mb-1',
                            children: 'Confirm Password',
                          }),
                          a.jsx('input', {
                            id: 'confirmPassword',
                            type: 'password',
                            value: p,
                            onChange: e => g(e.target.value),
                            className: 'input',
                            placeholder: '••••••••',
                            required: !0,
                          }),
                        ],
                      }),
                      (0, a.jsxs)('div', {
                        className: 'flex items-start gap-2 text-sm',
                        children: [
                          a.jsx('input', {
                            type: 'checkbox',
                            className: 'rounded border-[var(--border)] mt-1',
                            required: !0,
                          }),
                          (0, a.jsxs)('span', {
                            className: 'text-[var(--foreground-muted)]',
                            children: [
                              'I agree to the',
                              ' ',
                              a.jsx(i.default, {
                                href: '/terms',
                                className: 'text-[var(--primary)] hover:underline',
                                children: 'Terms of Service',
                              }),
                              ' ',
                              'and',
                              ' ',
                              a.jsx(i.default, {
                                href: '/privacy',
                                className: 'text-[var(--primary)] hover:underline',
                                children: 'Privacy Policy',
                              }),
                            ],
                          }),
                        ],
                      }),
                      a.jsx('button', {
                        type: 'submit',
                        disabled: y || s,
                        className: 'btn btn-primary w-full',
                        children: y ? 'Creating account...' : 'Create Account',
                      }),
                    ],
                  }),
                  (0, a.jsxs)('p', {
                    className: 'text-center text-sm text-[var(--foreground-muted)] mt-6',
                    children: [
                      'Already have an account?',
                      ' ',
                      a.jsx(i.default, {
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
                (console.error('Failed to fetch user:', e), d());
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
            c = async (e, t, a) => {
              let r = await fetch(`${i}/auth/register`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: e, password: t, name: a }),
                }),
                o = await r.json();
              if (!r.ok) throw Error(o.error?.message || 'Registration failed');
              let { accessToken: n, refreshToken: l, user: c } = o.data;
              (localStorage.setItem('accessToken', n),
                localStorage.setItem('refreshToken', l),
                s({ user: c, token: n, isLoading: !1, isAuthenticated: !0 }));
            },
            d = () => {
              (localStorage.removeItem('accessToken'),
                localStorage.removeItem('refreshToken'),
                s({ user: null, token: null, isLoading: !1, isAuthenticated: !1 }));
            },
            u = async () => {
              let e = localStorage.getItem('refreshToken');
              if (!e) {
                d();
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
                } else d();
              } catch (e) {
                (console.error('Token refresh failed:', e), d());
              }
            };
          return a.jsx(o.Provider, {
            value: { ...t, login: l, register: c, logout: d, refreshToken: u },
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
        s.d(t, { Lc: () => n, Nv: () => o, Sh: () => d, kx: () => c, sA: () => i, tF: () => l });
        let a = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        async function r() {
          return null;
        }
        async function o(e, t = {}) {
          let { method: s = 'GET', body: o, token: i } = t,
            n = i ?? (await r()),
            l = { 'Content-Type': 'application/json' };
          n && (l.Authorization = `Bearer ${n}`);
          let c = await fetch(`${a}${e}`, {
              method: s,
              headers: l,
              body: o ? JSON.stringify(o) : void 0,
            }),
            d = await c.json();
          if (!c.ok) throw Error(d.error?.message || 'Request failed');
          return d;
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
          c = {
            getDashboard: () => o('/dashboard'),
            getStreak: () => o('/dashboard/streak'),
            getProgress: () => o('/dashboard/progress'),
            getActivity: e => o(`/dashboard/activity${e ? `?limit=${e}` : ''}`),
            getReviews: e => o(`/dashboard/reviews${e ? `?limit=${e}` : ''}`),
            getWeakAreas: () => o('/dashboard/weak-areas'),
            getReadiness: () => o('/dashboard/readiness'),
            getRecommendations: () => o('/dashboard/recommendations'),
          },
          d = {
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
      6870: (e, t, s) => {
        'use strict';
        (s.r(t), s.d(t, { default: () => a }));
        let a = (0, s(3189).createProxy)(
          String.raw`/Users/dustinober/Projects/pmp_application/packages/web/src/app/register/page.tsx#default`
        );
      },
      5556: () => {},
    }));
  var t = require('../../webpack-runtime.js');
  t.C(e);
  var s = e => t((t.s = e)),
    a = t.X(0, [136, 568], () => s(1518));
  module.exports = a;
})();
