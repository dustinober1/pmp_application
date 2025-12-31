(() => {
  var e = {};
  ((e.id = 979),
    (e.ids = [979]),
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
      3748: (e, t, s) => {
        'use strict';
        (s.r(t),
          s.d(t, {
            GlobalError: () => o.a,
            __next_app__: () => u,
            originalPathname: () => m,
            pages: () => d,
            routeModule: () => p,
            tree: () => c,
          }),
          s(2036),
          s(4773),
          s(7824));
        var a = s(3282),
          r = s(5736),
          i = s(3906),
          o = s.n(i),
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
                'pricing',
                {
                  children: [
                    '__PAGE__',
                    {},
                    {
                      page: [
                        () => Promise.resolve().then(s.bind(s, 2036)),
                        '/Users/dustinober/Projects/pmp_application/packages/web/src/app/pricing/page.tsx',
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
          d = ['/Users/dustinober/Projects/pmp_application/packages/web/src/app/pricing/page.tsx'],
          m = '/pricing/page',
          u = { require: s, loadChunk: () => Promise.resolve() },
          p = new a.AppPageRouteModule({
            definition: {
              kind: r.x.APP_PAGE,
              page: '/pricing/page',
              pathname: '/pricing',
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
      2866: (e, t, s) => {
        Promise.resolve().then(s.bind(s, 8856));
      },
      649: (e, t, s) => {
        'use strict';
        s.d(t, { default: () => r.a });
        var a = s(6568),
          r = s.n(a);
      },
      7163: (e, t, s) => {
        'use strict';
        var a = Object.create
            ? function (e, t, s, a) {
                void 0 === a && (a = s);
                var r = Object.getOwnPropertyDescriptor(t, s);
                ((!r || ('get' in r ? !t.__esModule : r.writable || r.configurable)) &&
                  (r = {
                    enumerable: !0,
                    get: function () {
                      return t[s];
                    },
                  }),
                  Object.defineProperty(e, a, r));
              }
            : function (e, t, s, a) {
                (void 0 === a && (a = s), (e[a] = t[s]));
              },
          r = function (e, t) {
            for (var s in e)
              'default' === s || Object.prototype.hasOwnProperty.call(t, s) || a(t, e, s);
          };
        (Object.defineProperty(t, '__esModule', { value: !0 }),
          r(s(3462), t),
          r(s(9291), t),
          r(s(7224), t),
          r(s(3822), t),
          r(s(9855), t),
          r(s(4518), t),
          r(s(6313), t),
          r(s(5480), t),
          r(s(4144), t),
          r(s(662), t));
      },
      6313: (e, t) => {
        'use strict';
        Object.defineProperty(t, '__esModule', { value: !0 });
      },
      3462: (e, t) => {
        'use strict';
        Object.defineProperty(t, '__esModule', { value: !0 });
      },
      662: (e, t) => {
        'use strict';
        Object.defineProperty(t, '__esModule', { value: !0 });
      },
      7224: (e, t) => {
        'use strict';
        Object.defineProperty(t, '__esModule', { value: !0 });
      },
      4144: (e, t) => {
        'use strict';
        (Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.GENERIC_ERRORS =
            t.TEAM_ERRORS =
            t.SESSION_ERRORS =
            t.CONTENT_ERRORS =
            t.SUBSCRIPTION_ERRORS =
            t.AUTH_ERRORS =
              void 0),
          (t.AUTH_ERRORS = {
            AUTH_001: { code: 'AUTH_001', message: 'Invalid email format' },
            AUTH_002: { code: 'AUTH_002', message: 'Email already registered' },
            AUTH_003: { code: 'AUTH_003', message: 'Invalid credentials' },
            AUTH_004: { code: 'AUTH_004', message: 'Account locked' },
            AUTH_005: { code: 'AUTH_005', message: 'Invalid or expired token' },
            AUTH_006: { code: 'AUTH_006', message: 'Email not verified' },
          }),
          (t.SUBSCRIPTION_ERRORS = {
            SUB_001: { code: 'SUB_001', message: 'PayPal payment failed' },
            SUB_002: { code: 'SUB_002', message: 'Invalid tier selection' },
            SUB_003: { code: 'SUB_003', message: 'Feature not available in your tier' },
            SUB_004: { code: 'SUB_004', message: 'Subscription expired' },
            SUB_005: { code: 'SUB_005', message: 'PayPal webhook validation failed' },
          }),
          (t.CONTENT_ERRORS = {
            CONTENT_001: { code: 'CONTENT_001', message: 'Domain not found' },
            CONTENT_002: { code: 'CONTENT_002', message: 'Task not found' },
            CONTENT_003: { code: 'CONTENT_003', message: 'Study guide not found' },
            CONTENT_004: { code: 'CONTENT_004', message: 'Flashcard limit reached' },
            CONTENT_005: { code: 'CONTENT_005', message: 'Question limit reached' },
          }),
          (t.SESSION_ERRORS = {
            SESSION_001: { code: 'SESSION_001', message: 'Session not found' },
            SESSION_002: { code: 'SESSION_002', message: 'Session already completed' },
            SESSION_003: { code: 'SESSION_003', message: 'Invalid answer submission' },
            SESSION_004: { code: 'SESSION_004', message: 'Mock exam time expired' },
          }),
          (t.TEAM_ERRORS = {
            TEAM_001: { code: 'TEAM_001', message: 'Not authorized' },
            TEAM_002: { code: 'TEAM_002', message: 'License limit reached' },
            TEAM_003: { code: 'TEAM_003', message: 'Invalid invitation token' },
            TEAM_004: { code: 'TEAM_004', message: 'Member not found' },
            TEAM_005: { code: 'TEAM_005', message: 'Cannot remove self as admin' },
          }),
          (t.GENERIC_ERRORS = {
            INTERNAL_ERROR: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
            VALIDATION_ERROR: { code: 'VALIDATION_ERROR', message: 'Validation failed' },
            NOT_FOUND: { code: 'NOT_FOUND', message: 'Resource not found' },
            UNAUTHORIZED: { code: 'UNAUTHORIZED', message: 'Authentication required' },
            FORBIDDEN: { code: 'FORBIDDEN', message: 'Access denied' },
            RATE_LIMITED: { code: 'RATE_LIMITED', message: 'Too many requests' },
          }));
      },
      3822: (e, t) => {
        'use strict';
        (Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.SM2_DEFAULTS = void 0),
          (t.SM2_DEFAULTS = {
            INITIAL_EASE_FACTOR: 2.5,
            MINIMUM_EASE_FACTOR: 1.3,
            INITIAL_INTERVAL: 1,
          }));
      },
      4518: (e, t) => {
        'use strict';
        (Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.EVM_VARIABLES = void 0),
          (t.EVM_VARIABLES = {
            EV: { symbol: 'EV', name: 'Earned Value', description: 'Value of work performed' },
            PV: {
              symbol: 'PV',
              name: 'Planned Value',
              description: 'Authorized budget for scheduled work',
            },
            AC: { symbol: 'AC', name: 'Actual Cost', description: 'Actual cost incurred' },
            BAC: {
              symbol: 'BAC',
              name: 'Budget at Completion',
              description: 'Total authorized budget for the project',
            },
            EAC: {
              symbol: 'EAC',
              name: 'Estimate at Completion',
              description: 'Expected total cost at project completion',
            },
            ETC: {
              symbol: 'ETC',
              name: 'Estimate to Complete',
              description: 'Expected cost to finish remaining work',
            },
            VAC: {
              symbol: 'VAC',
              name: 'Variance at Completion',
              description: 'Projected budget surplus or deficit',
            },
            CPI: {
              symbol: 'CPI',
              name: 'Cost Performance Index',
              description: 'Measure of cost efficiency (EV/AC)',
            },
            SPI: {
              symbol: 'SPI',
              name: 'Schedule Performance Index',
              description: 'Measure of schedule efficiency (EV/PV)',
            },
            CV: {
              symbol: 'CV',
              name: 'Cost Variance',
              description: 'Difference between EV and AC',
            },
            SV: {
              symbol: 'SV',
              name: 'Schedule Variance',
              description: 'Difference between EV and PV',
            },
          }));
      },
      9855: (e, t) => {
        'use strict';
        (Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.PMP_EXAM = void 0),
          (t.PMP_EXAM = {
            TIME_LIMIT_MINUTES: 230,
            TOTAL_QUESTIONS: 180,
            PASSING_SCORE_PERCENTAGE: 61,
          }));
      },
      9291: (e, t) => {
        'use strict';
        (Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.DEFAULT_TIER_FEATURES = t.TIER_HIERARCHY = void 0),
          (t.TIER_HIERARCHY = { free: 0, 'mid-level': 1, 'high-end': 2, corporate: 3 }),
          (t.DEFAULT_TIER_FEATURES = {
            free: {
              studyGuidesAccess: 'limited',
              flashcardsLimit: 50,
              practiceQuestionsPerDomain: 25,
              customFlashcards: !1,
              mockExams: !1,
              formulaCalculator: !1,
              advancedAnalytics: !1,
              personalizedStudyPlan: !1,
              teamManagement: !1,
              dedicatedSupport: !1,
            },
            'mid-level': {
              studyGuidesAccess: 'full',
              flashcardsLimit: 'unlimited',
              practiceQuestionsPerDomain: 100,
              customFlashcards: !1,
              mockExams: !1,
              formulaCalculator: !1,
              advancedAnalytics: !0,
              personalizedStudyPlan: !1,
              teamManagement: !1,
              dedicatedSupport: !1,
            },
            'high-end': {
              studyGuidesAccess: 'full',
              flashcardsLimit: 'unlimited',
              practiceQuestionsPerDomain: 200,
              customFlashcards: !0,
              mockExams: !0,
              formulaCalculator: !0,
              advancedAnalytics: !0,
              personalizedStudyPlan: !0,
              teamManagement: !1,
              dedicatedSupport: !1,
            },
            corporate: {
              studyGuidesAccess: 'full',
              flashcardsLimit: 'unlimited',
              practiceQuestionsPerDomain: 200,
              customFlashcards: !0,
              mockExams: !0,
              formulaCalculator: !0,
              advancedAnalytics: !0,
              personalizedStudyPlan: !0,
              teamManagement: !0,
              dedicatedSupport: !0,
            },
          }));
      },
      5480: (e, t) => {
        'use strict';
        Object.defineProperty(t, '__esModule', { value: !0 });
      },
      8856: (e, t, s) => {
        'use strict';
        (s.r(t), s.d(t, { default: () => l }));
        var a = s(3227),
          r = s(3677),
          i = s(649),
          o = s(2278),
          n = s(7163);
        function l() {
          let { user: e } = (0, o.a)(),
            [t, s] = (0, r.useState)('monthly'),
            l = [
              {
                id: 'free',
                name: 'Free Starter',
                price: 0,
                description: 'Perfect for exploring the platform and starting your PMP journey.',
                features: n.DEFAULT_TIER_FEATURES.free,
                buttonText: e ? 'Current Plan' : 'Get Started',
                buttonHref: e ? '/dashboard' : '/register',
                highlight: !1,
              },
              {
                id: 'high-end',
                name: 'PMP Pro',
                price: 'monthly' === t ? 29 : 290,
                description: 'Everything you need to pass the exam with confidence.',
                features: n.DEFAULT_TIER_FEATURES['high-end'],
                buttonText: e?.tier === 'high-end' ? 'Current Plan' : 'Upgrade to Pro',
                buttonHref: '/checkout?tier=high-end',
                highlight: !0,
                popular: !0,
              },
              {
                id: 'corporate',
                name: 'Corporate Team',
                price: 'monthly' === t ? 99 : 990,
                description: 'Manage a team of PMP candidates with advanced reporting.',
                features: n.DEFAULT_TIER_FEATURES.corporate,
                buttonText: e?.tier === 'corporate' ? 'Current Plan' : 'Start Team Plan',
                buttonHref: '/checkout?tier=corporate',
                highlight: !1,
              },
            ];
          return a.jsx('div', {
            className: 'bg-gray-900 min-h-screen py-24 sm:py-32',
            children: (0, a.jsxs)('div', {
              className: 'mx-auto max-w-7xl px-6 lg:px-8',
              children: [
                (0, a.jsxs)('div', {
                  className: 'mx-auto max-w-4xl text-center',
                  children: [
                    a.jsx('h2', {
                      className: 'text-base font-semibold leading-7 text-primary-400',
                      children: 'Pricing',
                    }),
                    a.jsx('p', {
                      className: 'mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl',
                      children: 'Invest in your PMP success',
                    }),
                    a.jsx('p', {
                      className: 'mt-6 text-lg leading-8 text-gray-400',
                      children:
                        'Choose the plan that fits your study needs. All plans include access to our core learning engine.',
                    }),
                  ],
                }),
                a.jsx('div', {
                  className: 'mt-16 flex justify-center',
                  children: (0, a.jsxs)('div', {
                    className: 'relative flex bg-gray-800 rounded-full p-1 border border-gray-700',
                    children: [
                      a.jsx('button', {
                        onClick: () => s('monthly'),
                        className: `${'monthly' === t ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'} rounded-full px-6 py-2 text-sm font-medium transition-all duration-200`,
                        children: 'Monthly',
                      }),
                      (0, a.jsxs)('button', {
                        onClick: () => s('annual'),
                        className: `${'annual' === t ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'} rounded-full px-6 py-2 text-sm font-medium transition-all duration-200`,
                        children: [
                          'Annual ',
                          a.jsx('span', {
                            className: 'text-xs ml-1 opacity-75',
                            children: '(Save 20%)',
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
                a.jsx('div', {
                  className:
                    'isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 md:max-w-2xl md:grid-cols-2 lg:max-w-4xl xl:mx-0 xl:max-w-none xl:grid-cols-3',
                  children: l.map(e =>
                    (0, a.jsxs)(
                      'div',
                      {
                        className: `rounded-3xl p-8 ring-1 ring-white/10 ${e.highlight ? 'bg-white/5 ring-primary-500 scale-105 shadow-xl relative' : 'bg-gray-800/20'} xl:p-10 transition-transform hover:-translate-y-1`,
                        children: [
                          e.popular &&
                            a.jsx('div', {
                              className:
                                'absolute top-0 right-0 -mt-2 -mr-2 px-3 py-1 bg-primary-500 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg',
                              children: 'Most Popular',
                            }),
                          a.jsx('div', {
                            className: 'flex items-center justify-between gap-x-4',
                            children: a.jsx('h3', {
                              id: e.id,
                              className: 'text-lg font-semibold leading-8 text-white',
                              children: e.name,
                            }),
                          }),
                          a.jsx('p', {
                            className: 'mt-4 text-sm leading-6 text-gray-300',
                            children: e.description,
                          }),
                          (0, a.jsxs)('p', {
                            className: 'mt-6 flex items-baseline gap-x-1',
                            children: [
                              (0, a.jsxs)('span', {
                                className: 'text-4xl font-bold tracking-tight text-white',
                                children: ['$', e.price],
                              }),
                              (0, a.jsxs)('span', {
                                className: 'text-sm font-semibold leading-6 text-gray-300',
                                children: ['/', 'monthly' === t ? 'mo' : 'yr'],
                              }),
                            ],
                          }),
                          a.jsx(i.default, {
                            href: e.buttonHref,
                            className: `mt-6 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${e.highlight ? 'bg-primary-600 text-white shadow-sm hover:bg-primary-500 focus-visible:outline-primary-500' : 'bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white'}`,
                            children: e.buttonText,
                          }),
                          (0, a.jsxs)('ul', {
                            role: 'list',
                            className: 'mt-8 space-y-3 text-sm leading-6 text-gray-300 xl:mt-10',
                            children: [
                              (0, a.jsxs)('li', {
                                className: 'flex gap-x-3',
                                children: [
                                  a.jsx('span', { className: 'text-primary-400', children: '✓' }),
                                  'full' === e.features.studyGuidesAccess
                                    ? 'Full Study Guides'
                                    : 'Limited Study Guides',
                                ],
                              }),
                              (0, a.jsxs)('li', {
                                className: 'flex gap-x-3',
                                children: [
                                  a.jsx('span', { className: 'text-primary-400', children: '✓' }),
                                  'unlimited' === e.features.flashcardsLimit
                                    ? 'Unlimited Flashcards'
                                    : `${e.features.flashcardsLimit} Flashcards`,
                                ],
                              }),
                              (0, a.jsxs)('li', {
                                className: 'flex gap-x-3',
                                children: [
                                  a.jsx('span', { className: 'text-primary-400', children: '✓' }),
                                  e.features.practiceQuestionsPerDomain,
                                  ' Questions / Domain',
                                ],
                              }),
                              (0, a.jsxs)('li', {
                                className: 'flex gap-x-3',
                                children: [
                                  a.jsx('span', {
                                    className: e.features.mockExams
                                      ? 'text-primary-400'
                                      : 'text-gray-600',
                                    children: e.features.mockExams ? '✓' : '✕',
                                  }),
                                  a.jsx('span', {
                                    className: e.features.mockExams ? '' : 'text-gray-500',
                                    children: 'Mock Exams',
                                  }),
                                ],
                              }),
                              (0, a.jsxs)('li', {
                                className: 'flex gap-x-3',
                                children: [
                                  a.jsx('span', {
                                    className: e.features.advancedAnalytics
                                      ? 'text-primary-400'
                                      : 'text-gray-600',
                                    children: e.features.advancedAnalytics ? '✓' : '✕',
                                  }),
                                  a.jsx('span', {
                                    className: e.features.advancedAnalytics ? '' : 'text-gray-500',
                                    children: 'Advanced Analytics',
                                  }),
                                ],
                              }),
                              (0, a.jsxs)('li', {
                                className: 'flex gap-x-3',
                                children: [
                                  a.jsx('span', {
                                    className: e.features.teamManagement
                                      ? 'text-primary-400'
                                      : 'text-gray-600',
                                    children: e.features.teamManagement ? '✓' : '✕',
                                  }),
                                  a.jsx('span', {
                                    className: e.features.teamManagement ? '' : 'text-gray-500',
                                    children: 'Team Management',
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      },
                      e.id
                    )
                  ),
                }),
              ],
            }),
          });
        }
      },
      4076: (e, t, s) => {
        'use strict';
        s.d(t, { Providers: () => l });
        var a = s(3227),
          r = s(2278),
          i = s(7674);
        let o = 'pmp_offline_sync_queue';
        class n {
          constructor() {
            ((this.queue = []), (this.isSyncing = !1));
          }
          loadQueue() {
            let e = localStorage.getItem(o);
            e && (this.queue = JSON.parse(e));
          }
          saveQueue() {
            localStorage.setItem(o, JSON.stringify(this.queue));
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
                await (0, i.Nv)(`/study/sections/${e.payload.sectionId}/complete`, {
                  method: 'POST',
                });
                break;
              case 'SUBMIT_FLASHCARD_RESULT':
                await (0, i.Nv)(`/flashcards/${e.payload.flashcardId}/review`, {
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
      2278: (e, t, s) => {
        'use strict';
        s.d(t, { H: () => n, a: () => l });
        var a = s(3227),
          r = s(3677);
        let i = (0, r.createContext)(void 0),
          o = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        function n({ children: e }) {
          let [t, s] = (0, r.useState)({
              user: null,
              token: null,
              isLoading: !0,
              isAuthenticated: !1,
            }),
            n = async e => {
              try {
                let t = await fetch(`${o}/auth/me`, { headers: { Authorization: `Bearer ${e}` } });
                if (t.ok) {
                  let a = await t.json();
                  s({ user: a.data.user, token: e, isLoading: !1, isAuthenticated: !0 });
                } else await m();
              } catch (e) {
                (console.error('Failed to fetch user:', e), d());
              }
            },
            l = async (e, t) => {
              let a = await fetch(`${o}/auth/login`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: e, password: t }),
                }),
                r = await a.json();
              if (!a.ok) throw Error(r.error?.message || 'Login failed');
              let { accessToken: i, refreshToken: n, user: l } = r.data;
              (localStorage.setItem('accessToken', i),
                localStorage.setItem('refreshToken', n),
                s({ user: l, token: i, isLoading: !1, isAuthenticated: !0 }));
            },
            c = async (e, t, a) => {
              let r = await fetch(`${o}/auth/register`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: e, password: t, name: a }),
                }),
                i = await r.json();
              if (!r.ok) throw Error(i.error?.message || 'Registration failed');
              let { accessToken: n, refreshToken: l, user: c } = i.data;
              (localStorage.setItem('accessToken', n),
                localStorage.setItem('refreshToken', l),
                s({ user: c, token: n, isLoading: !1, isAuthenticated: !0 }));
            },
            d = () => {
              (localStorage.removeItem('accessToken'),
                localStorage.removeItem('refreshToken'),
                s({ user: null, token: null, isLoading: !1, isAuthenticated: !1 }));
            },
            m = async () => {
              let e = localStorage.getItem('refreshToken');
              if (!e) {
                d();
                return;
              }
              try {
                let t = await fetch(`${o}/auth/refresh`, {
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
          return a.jsx(i.Provider, {
            value: { ...t, login: l, register: c, logout: d, refreshToken: m },
            children: e,
          });
        }
        function l() {
          let e = (0, r.useContext)(i);
          if (void 0 === e) throw Error('useAuth must be used within an AuthProvider');
          return e;
        }
      },
      7674: (e, t, s) => {
        'use strict';
        s.d(t, { Lc: () => n, Nv: () => i, Sh: () => d, kx: () => c, sA: () => o, tF: () => l });
        let a = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        async function r() {
          return null;
        }
        async function i(e, t = {}) {
          let { method: s = 'GET', body: i, token: o } = t,
            n = o ?? (await r()),
            l = { 'Content-Type': 'application/json' };
          n && (l.Authorization = `Bearer ${n}`);
          let c = await fetch(`${a}${e}`, {
              method: s,
              headers: l,
              body: i ? JSON.stringify(i) : void 0,
            }),
            d = await c.json();
          if (!c.ok) throw Error(d.error?.message || 'Request failed');
          return d;
        }
        let o = {
            getDomains: () => i('/domains'),
            getDomain: e => i(`/domains/${e}`),
            getTasks: e => i(`/domains/${e}/tasks`),
            getStudyGuide: e => i(`/domains/tasks/${e}/study-guide`),
            markSectionComplete: e =>
              i(`/domains/progress/sections/${e}/complete`, { method: 'POST' }),
            getProgress: () => i('/domains/progress'),
          },
          n = {
            getFlashcards: e => {
              let t = new URLSearchParams();
              return (
                e?.domainId && t.set('domainId', e.domainId),
                e?.taskId && t.set('taskId', e.taskId),
                e?.limit && t.set('limit', String(e.limit)),
                i(`/flashcards?${t}`)
              );
            },
            getDueForReview: e => i(`/flashcards/review${e ? `?limit=${e}` : ''}`),
            getStats: () => i('/flashcards/stats'),
            startSession: e => i('/flashcards/sessions', { method: 'POST', body: e }),
            recordResponse: (e, t, s, a) =>
              i(`/flashcards/sessions/${e}/responses/${t}`, {
                method: 'POST',
                body: { rating: s, timeSpentMs: a },
              }),
            completeSession: e => i(`/flashcards/sessions/${e}/complete`, { method: 'POST' }),
            createCustom: e => i('/flashcards/custom', { method: 'POST', body: e }),
          },
          l = {
            startSession: e => i('/practice/sessions', { method: 'POST', body: e }),
            submitAnswer: (e, t, s, a) =>
              i(`/practice/sessions/${e}/answers/${t}`, {
                method: 'POST',
                body: { selectedOptionId: s, timeSpentMs: a },
              }),
            completeSession: e => i(`/practice/sessions/${e}/complete`, { method: 'POST' }),
            startMockExam: () => i('/practice/mock-exams', { method: 'POST' }),
            getFlagged: () => i('/practice/flagged'),
            flagQuestion: e => i(`/practice/questions/${e}/flag`, { method: 'POST' }),
            unflagQuestion: e => i(`/practice/questions/${e}/flag`, { method: 'DELETE' }),
            getStats: () => i('/practice/stats'),
          },
          c = {
            getDashboard: () => i('/dashboard'),
            getStreak: () => i('/dashboard/streak'),
            getProgress: () => i('/dashboard/progress'),
            getActivity: e => i(`/dashboard/activity${e ? `?limit=${e}` : ''}`),
            getReviews: e => i(`/dashboard/reviews${e ? `?limit=${e}` : ''}`),
            getWeakAreas: () => i('/dashboard/weak-areas'),
            getReadiness: () => i('/dashboard/readiness'),
            getRecommendations: () => i('/dashboard/recommendations'),
          },
          d = {
            getFormulas: e => i(`/formulas${e ? `?category=${e}` : ''}`),
            getFormula: e => i(`/formulas/${e}`),
            calculate: (e, t) =>
              i(`/formulas/${e}/calculate`, { method: 'POST', body: { inputs: t } }),
            getVariables: () => i('/formulas/variables'),
          };
      },
      4773: (e, t, s) => {
        'use strict';
        (s.r(t), s.d(t, { default: () => l, metadata: () => n }));
        var a = s(9013),
          r = s(5900),
          i = s.n(r);
        s(5556);
        let o = (0, s(3189).createProxy)(
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
              className: i().className,
              children: a.jsx(o, { children: e }),
            }),
          });
        }
      },
      2036: (e, t, s) => {
        'use strict';
        (s.r(t), s.d(t, { default: () => a }));
        let a = (0, s(3189).createProxy)(
          String.raw`/Users/dustinober/Projects/pmp_application/packages/web/src/app/pricing/page.tsx#default`
        );
      },
      5556: () => {},
    }));
  var t = require('../../webpack-runtime.js');
  t.C(e);
  var s = e => t((t.s = e)),
    a = t.X(0, [136, 568], () => s(3748));
  module.exports = a;
})();
