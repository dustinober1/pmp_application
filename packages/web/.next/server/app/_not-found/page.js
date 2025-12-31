(() => {
  var e = {};
  ((e.id = 409),
    (e.ids = [409]),
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
      8042: (e, t, s) => {
        'use strict';
        (s.r(t),
          s.d(t, {
            GlobalError: () => n.a,
            __next_app__: () => h,
            originalPathname: () => u,
            pages: () => c,
            routeModule: () => m,
            tree: () => d,
          }),
          s(3627),
          s(7824),
          s(4773));
        var o = s(3282),
          a = s(5736),
          r = s(3906),
          n = s.n(r),
          i = s(6880),
          l = {};
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
            ].indexOf(e) && (l[e] = () => i[e]);
        s.d(t, l);
        let d = [
            '',
            {
              children: [
                '/_not-found',
                {
                  children: [
                    '__PAGE__',
                    {},
                    {
                      page: [
                        () => Promise.resolve().then(s.t.bind(s, 7824, 23)),
                        'next/dist/client/components/not-found-error',
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
          c = [],
          u = '/_not-found/page',
          h = { require: s, loadChunk: () => Promise.resolve() },
          m = new o.AppPageRouteModule({
            definition: {
              kind: a.x.APP_PAGE,
              page: '/_not-found/page',
              pathname: '/_not-found',
              bundlePath: '',
              filename: '',
              appPaths: [],
            },
            userland: { loaderTree: d },
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
      4076: (e, t, s) => {
        'use strict';
        s.d(t, { Providers: () => l });
        var o = s(3227),
          a = s(2278),
          r = s(7674);
        let n = 'pmp_offline_sync_queue';
        class i {
          constructor() {
            ((this.queue = []), (this.isSyncing = !1));
          }
          loadQueue() {
            let e = localStorage.getItem(n);
            e && (this.queue = JSON.parse(e));
          }
          saveQueue() {
            localStorage.setItem(n, JSON.stringify(this.queue));
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
                await (0, r.Nv)(`/study/sections/${e.payload.sectionId}/complete`, {
                  method: 'POST',
                });
                break;
              case 'SUBMIT_FLASHCARD_RESULT':
                await (0, r.Nv)(`/flashcards/${e.payload.flashcardId}/review`, {
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
          return o.jsx(a.H, { children: e });
        }
        new i();
      },
      2278: (e, t, s) => {
        'use strict';
        s.d(t, { H: () => i, a: () => l });
        var o = s(3227),
          a = s(3677);
        let r = (0, a.createContext)(void 0),
          n = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        function i({ children: e }) {
          let [t, s] = (0, a.useState)({
              user: null,
              token: null,
              isLoading: !0,
              isAuthenticated: !1,
            }),
            i = async e => {
              try {
                let t = await fetch(`${n}/auth/me`, { headers: { Authorization: `Bearer ${e}` } });
                if (t.ok) {
                  let o = await t.json();
                  s({ user: o.data.user, token: e, isLoading: !1, isAuthenticated: !0 });
                } else await u();
              } catch (e) {
                (console.error('Failed to fetch user:', e), c());
              }
            },
            l = async (e, t) => {
              let o = await fetch(`${n}/auth/login`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: e, password: t }),
                }),
                a = await o.json();
              if (!o.ok) throw Error(a.error?.message || 'Login failed');
              let { accessToken: r, refreshToken: i, user: l } = a.data;
              (localStorage.setItem('accessToken', r),
                localStorage.setItem('refreshToken', i),
                s({ user: l, token: r, isLoading: !1, isAuthenticated: !0 }));
            },
            d = async (e, t, o) => {
              let a = await fetch(`${n}/auth/register`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: e, password: t, name: o }),
                }),
                r = await a.json();
              if (!a.ok) throw Error(r.error?.message || 'Registration failed');
              let { accessToken: i, refreshToken: l, user: d } = r.data;
              (localStorage.setItem('accessToken', i),
                localStorage.setItem('refreshToken', l),
                s({ user: d, token: i, isLoading: !1, isAuthenticated: !0 }));
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
                let t = await fetch(`${n}/auth/refresh`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ refreshToken: e }),
                });
                if (t.ok) {
                  let { accessToken: e, refreshToken: s } = (await t.json()).data;
                  (localStorage.setItem('accessToken', e),
                    localStorage.setItem('refreshToken', s),
                    await i(e));
                } else c();
              } catch (e) {
                (console.error('Token refresh failed:', e), c());
              }
            };
          return o.jsx(r.Provider, {
            value: { ...t, login: l, register: d, logout: c, refreshToken: u },
            children: e,
          });
        }
        function l() {
          let e = (0, a.useContext)(r);
          if (void 0 === e) throw Error('useAuth must be used within an AuthProvider');
          return e;
        }
      },
      7674: (e, t, s) => {
        'use strict';
        s.d(t, { Lc: () => i, Nv: () => r, Sh: () => c, kx: () => d, sA: () => n, tF: () => l });
        let o = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        async function a() {
          return null;
        }
        async function r(e, t = {}) {
          let { method: s = 'GET', body: r, token: n } = t,
            i = n ?? (await a()),
            l = { 'Content-Type': 'application/json' };
          i && (l.Authorization = `Bearer ${i}`);
          let d = await fetch(`${o}${e}`, {
              method: s,
              headers: l,
              body: r ? JSON.stringify(r) : void 0,
            }),
            c = await d.json();
          if (!d.ok) throw Error(c.error?.message || 'Request failed');
          return c;
        }
        let n = {
            getDomains: () => r('/domains'),
            getDomain: e => r(`/domains/${e}`),
            getTasks: e => r(`/domains/${e}/tasks`),
            getStudyGuide: e => r(`/domains/tasks/${e}/study-guide`),
            markSectionComplete: e =>
              r(`/domains/progress/sections/${e}/complete`, { method: 'POST' }),
            getProgress: () => r('/domains/progress'),
          },
          i = {
            getFlashcards: e => {
              let t = new URLSearchParams();
              return (
                e?.domainId && t.set('domainId', e.domainId),
                e?.taskId && t.set('taskId', e.taskId),
                e?.limit && t.set('limit', String(e.limit)),
                r(`/flashcards?${t}`)
              );
            },
            getDueForReview: e => r(`/flashcards/review${e ? `?limit=${e}` : ''}`),
            getStats: () => r('/flashcards/stats'),
            startSession: e => r('/flashcards/sessions', { method: 'POST', body: e }),
            recordResponse: (e, t, s, o) =>
              r(`/flashcards/sessions/${e}/responses/${t}`, {
                method: 'POST',
                body: { rating: s, timeSpentMs: o },
              }),
            completeSession: e => r(`/flashcards/sessions/${e}/complete`, { method: 'POST' }),
            createCustom: e => r('/flashcards/custom', { method: 'POST', body: e }),
          },
          l = {
            startSession: e => r('/practice/sessions', { method: 'POST', body: e }),
            submitAnswer: (e, t, s, o) =>
              r(`/practice/sessions/${e}/answers/${t}`, {
                method: 'POST',
                body: { selectedOptionId: s, timeSpentMs: o },
              }),
            completeSession: e => r(`/practice/sessions/${e}/complete`, { method: 'POST' }),
            startMockExam: () => r('/practice/mock-exams', { method: 'POST' }),
            getFlagged: () => r('/practice/flagged'),
            flagQuestion: e => r(`/practice/questions/${e}/flag`, { method: 'POST' }),
            unflagQuestion: e => r(`/practice/questions/${e}/flag`, { method: 'DELETE' }),
            getStats: () => r('/practice/stats'),
          },
          d = {
            getDashboard: () => r('/dashboard'),
            getStreak: () => r('/dashboard/streak'),
            getProgress: () => r('/dashboard/progress'),
            getActivity: e => r(`/dashboard/activity${e ? `?limit=${e}` : ''}`),
            getReviews: e => r(`/dashboard/reviews${e ? `?limit=${e}` : ''}`),
            getWeakAreas: () => r('/dashboard/weak-areas'),
            getReadiness: () => r('/dashboard/readiness'),
            getRecommendations: () => r('/dashboard/recommendations'),
          },
          c = {
            getFormulas: e => r(`/formulas${e ? `?category=${e}` : ''}`),
            getFormula: e => r(`/formulas/${e}`),
            calculate: (e, t) =>
              r(`/formulas/${e}/calculate`, { method: 'POST', body: { inputs: t } }),
            getVariables: () => r('/formulas/variables'),
          };
      },
      8433: (e, t) => {
        'use strict';
        (Object.defineProperty(t, '__esModule', { value: !0 }),
          (function (e, t) {
            for (var s in t) Object.defineProperty(e, s, { enumerable: !0, get: t[s] });
          })(t, {
            isNotFoundError: function () {
              return a;
            },
            notFound: function () {
              return o;
            },
          }));
        let s = 'NEXT_NOT_FOUND';
        function o() {
          let e = Error(s);
          throw ((e.digest = s), e);
        }
        function a(e) {
          return 'object' == typeof e && null !== e && 'digest' in e && e.digest === s;
        }
        ('function' == typeof t.default || ('object' == typeof t.default && null !== t.default)) &&
          void 0 === t.default.__esModule &&
          (Object.defineProperty(t.default, '__esModule', { value: !0 }),
          Object.assign(t.default, t),
          (e.exports = t.default));
      },
      3627: (e, t, s) => {
        'use strict';
        (Object.defineProperty(t, '__esModule', { value: !0 }),
          (function (e, t) {
            for (var s in t) Object.defineProperty(e, s, { enumerable: !0, get: t[s] });
          })(t, {
            PARALLEL_ROUTE_DEFAULT_PATH: function () {
              return a;
            },
            default: function () {
              return r;
            },
          }));
        let o = s(8433),
          a = 'next/dist/client/components/parallel-route-default.js';
        function r() {
          (0, o.notFound)();
        }
        ('function' == typeof t.default || ('object' == typeof t.default && null !== t.default)) &&
          void 0 === t.default.__esModule &&
          (Object.defineProperty(t.default, '__esModule', { value: !0 }),
          Object.assign(t.default, t),
          (e.exports = t.default));
      },
      4773: (e, t, s) => {
        'use strict';
        (s.r(t), s.d(t, { default: () => l, metadata: () => i }));
        var o = s(9013),
          a = s(5900),
          r = s.n(a);
        s(5556);
        let n = (0, s(3189).createProxy)(
            String.raw`/Users/dustinober/Projects/pmp_application/packages/web/src/app/providers.tsx#Providers`
          ),
          i = {
            title: 'PMP Study Pro',
            description: 'Comprehensive study platform for the 2026 PMP certification exam',
            keywords: ['PMP', 'Project Management', 'Certification', 'Study', 'Exam Prep'],
            manifest: '/manifest.json',
            themeColor: '#7c3aed',
            viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
            appleWebApp: { capable: !0, statusBarStyle: 'default', title: 'PMP Pro' },
          };
        function l({ children: e }) {
          return o.jsx('html', {
            lang: 'en',
            children: o.jsx('body', {
              className: r().className,
              children: o.jsx(n, { children: e }),
            }),
          });
        }
      },
      5556: () => {},
    }));
  var t = require('../../webpack-runtime.js');
  t.C(e);
  var s = e => t((t.s = e)),
    o = t.X(0, [136], () => s(8042));
  module.exports = o;
})();
