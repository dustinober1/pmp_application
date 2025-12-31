(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [979],
  {
    9536: function (e, t, a) {
      Promise.resolve().then(a.bind(a, 2691));
    },
    8146: function (e, t, a) {
      'use strict';
      a.d(t, {
        default: function () {
          return n.a;
        },
      });
      var s = a(6340),
        n = a.n(s);
    },
    4859: function (e, t, a) {
      'use strict';
      var s, n;
      e.exports =
        (null == (s = a.g.process) ? void 0 : s.env) &&
        'object' == typeof (null == (n = a.g.process) ? void 0 : n.env)
          ? a.g.process
          : a(9566);
    },
    9566: function (e) {
      !(function () {
        var t = {
            229: function (e) {
              var t,
                a,
                s,
                n = (e.exports = {});
              function r() {
                throw Error('setTimeout has not been defined');
              }
              function i() {
                throw Error('clearTimeout has not been defined');
              }
              function o(e) {
                if (t === setTimeout) return setTimeout(e, 0);
                if ((t === r || !t) && setTimeout) return ((t = setTimeout), setTimeout(e, 0));
                try {
                  return t(e, 0);
                } catch (a) {
                  try {
                    return t.call(null, e, 0);
                  } catch (a) {
                    return t.call(this, e, 0);
                  }
                }
              }
              !(function () {
                try {
                  t = 'function' == typeof setTimeout ? setTimeout : r;
                } catch (e) {
                  t = r;
                }
                try {
                  a = 'function' == typeof clearTimeout ? clearTimeout : i;
                } catch (e) {
                  a = i;
                }
              })();
              var c = [],
                l = !1,
                d = -1;
              function u() {
                l && s && ((l = !1), s.length ? (c = s.concat(c)) : (d = -1), c.length && m());
              }
              function m() {
                if (!l) {
                  var e = o(u);
                  l = !0;
                  for (var t = c.length; t; ) {
                    for (s = c, c = []; ++d < t; ) s && s[d].run();
                    ((d = -1), (t = c.length));
                  }
                  ((s = null),
                    (l = !1),
                    (function (e) {
                      if (a === clearTimeout) return clearTimeout(e);
                      if ((a === i || !a) && clearTimeout)
                        return ((a = clearTimeout), clearTimeout(e));
                      try {
                        a(e);
                      } catch (t) {
                        try {
                          return a.call(null, e);
                        } catch (t) {
                          return a.call(this, e);
                        }
                      }
                    })(e));
                }
              }
              function f(e, t) {
                ((this.fun = e), (this.array = t));
              }
              function h() {}
              ((n.nextTick = function (e) {
                var t = Array(arguments.length - 1);
                if (arguments.length > 1)
                  for (var a = 1; a < arguments.length; a++) t[a - 1] = arguments[a];
                (c.push(new f(e, t)), 1 !== c.length || l || o(m));
              }),
                (f.prototype.run = function () {
                  this.fun.apply(null, this.array);
                }),
                (n.title = 'browser'),
                (n.browser = !0),
                (n.env = {}),
                (n.argv = []),
                (n.version = ''),
                (n.versions = {}),
                (n.on = h),
                (n.addListener = h),
                (n.once = h),
                (n.off = h),
                (n.removeListener = h),
                (n.removeAllListeners = h),
                (n.emit = h),
                (n.prependListener = h),
                (n.prependOnceListener = h),
                (n.listeners = function (e) {
                  return [];
                }),
                (n.binding = function (e) {
                  throw Error('process.binding is not supported');
                }),
                (n.cwd = function () {
                  return '/';
                }),
                (n.chdir = function (e) {
                  throw Error('process.chdir is not supported');
                }),
                (n.umask = function () {
                  return 0;
                }));
            },
          },
          a = {};
        function s(e) {
          var n = a[e];
          if (void 0 !== n) return n.exports;
          var r = (a[e] = { exports: {} }),
            i = !0;
          try {
            (t[e](r, r.exports, s), (i = !1));
          } finally {
            i && delete a[e];
          }
          return r.exports;
        }
        s.ab = '//';
        var n = s(229);
        e.exports = n;
      })();
    },
    7668: function (e, t, a) {
      'use strict';
      var s = Object.create
          ? function (e, t, a, s) {
              void 0 === s && (s = a);
              var n = Object.getOwnPropertyDescriptor(t, a);
              ((!n || ('get' in n ? !t.__esModule : n.writable || n.configurable)) &&
                (n = {
                  enumerable: !0,
                  get: function () {
                    return t[a];
                  },
                }),
                Object.defineProperty(e, s, n));
            }
          : function (e, t, a, s) {
              (void 0 === s && (s = a), (e[s] = t[a]));
            },
        n = function (e, t) {
          for (var a in e)
            'default' === a || Object.prototype.hasOwnProperty.call(t, a) || s(t, e, a);
        };
      (Object.defineProperty(t, '__esModule', { value: !0 }),
        n(a(9323), t),
        n(a(4481), t),
        n(a(7158), t),
        n(a(8918), t),
        n(a(2987), t),
        n(a(7075), t),
        n(a(6649), t),
        n(a(8345), t),
        n(a(5949), t),
        n(a(3139), t));
    },
    6649: function (e, t) {
      'use strict';
      Object.defineProperty(t, '__esModule', { value: !0 });
    },
    9323: function (e, t) {
      'use strict';
      Object.defineProperty(t, '__esModule', { value: !0 });
    },
    3139: function (e, t) {
      'use strict';
      Object.defineProperty(t, '__esModule', { value: !0 });
    },
    7158: function (e, t) {
      'use strict';
      Object.defineProperty(t, '__esModule', { value: !0 });
    },
    5949: function (e, t) {
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
    8918: function (e, t) {
      'use strict';
      (Object.defineProperty(t, '__esModule', { value: !0 }),
        (t.SM2_DEFAULTS = void 0),
        (t.SM2_DEFAULTS = {
          INITIAL_EASE_FACTOR: 2.5,
          MINIMUM_EASE_FACTOR: 1.3,
          INITIAL_INTERVAL: 1,
        }));
    },
    7075: function (e, t) {
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
          CV: { symbol: 'CV', name: 'Cost Variance', description: 'Difference between EV and AC' },
          SV: {
            symbol: 'SV',
            name: 'Schedule Variance',
            description: 'Difference between EV and PV',
          },
        }));
    },
    2987: function (e, t) {
      'use strict';
      (Object.defineProperty(t, '__esModule', { value: !0 }),
        (t.PMP_EXAM = void 0),
        (t.PMP_EXAM = {
          TIME_LIMIT_MINUTES: 230,
          TOTAL_QUESTIONS: 180,
          PASSING_SCORE_PERCENTAGE: 61,
        }));
    },
    4481: function (e, t) {
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
    8345: function (e, t) {
      'use strict';
      Object.defineProperty(t, '__esModule', { value: !0 });
    },
    2691: function (e, t, a) {
      'use strict';
      (a.r(t),
        a.d(t, {
          default: function () {
            return c;
          },
        }));
      var s = a(7573),
        n = a(7653),
        r = a(8146),
        i = a(7070),
        o = a(7668);
      function c() {
        let { user: e } = (0, i.a)(),
          [t, a] = (0, n.useState)('monthly'),
          c = [
            {
              id: 'free',
              name: 'Free Starter',
              price: 0,
              description: 'Perfect for exploring the platform and starting your PMP journey.',
              features: o.DEFAULT_TIER_FEATURES.free,
              buttonText: e ? 'Current Plan' : 'Get Started',
              buttonHref: e ? '/dashboard' : '/register',
              highlight: !1,
            },
            {
              id: 'high-end',
              name: 'PMP Pro',
              price: 'monthly' === t ? 29 : 290,
              description: 'Everything you need to pass the exam with confidence.',
              features: o.DEFAULT_TIER_FEATURES['high-end'],
              buttonText:
                (null == e ? void 0 : e.tier) === 'high-end' ? 'Current Plan' : 'Upgrade to Pro',
              buttonHref: '/checkout?tier=high-end',
              highlight: !0,
              popular: !0,
            },
            {
              id: 'corporate',
              name: 'Corporate Team',
              price: 'monthly' === t ? 99 : 990,
              description: 'Manage a team of PMP candidates with advanced reporting.',
              features: o.DEFAULT_TIER_FEATURES.corporate,
              buttonText:
                (null == e ? void 0 : e.tier) === 'corporate' ? 'Current Plan' : 'Start Team Plan',
              buttonHref: '/checkout?tier=corporate',
              highlight: !1,
            },
          ];
        return (0, s.jsx)('div', {
          className: 'bg-gray-900 min-h-screen py-24 sm:py-32',
          children: (0, s.jsxs)('div', {
            className: 'mx-auto max-w-7xl px-6 lg:px-8',
            children: [
              (0, s.jsxs)('div', {
                className: 'mx-auto max-w-4xl text-center',
                children: [
                  (0, s.jsx)('h2', {
                    className: 'text-base font-semibold leading-7 text-primary-400',
                    children: 'Pricing',
                  }),
                  (0, s.jsx)('p', {
                    className: 'mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl',
                    children: 'Invest in your PMP success',
                  }),
                  (0, s.jsx)('p', {
                    className: 'mt-6 text-lg leading-8 text-gray-400',
                    children:
                      'Choose the plan that fits your study needs. All plans include access to our core learning engine.',
                  }),
                ],
              }),
              (0, s.jsx)('div', {
                className: 'mt-16 flex justify-center',
                children: (0, s.jsxs)('div', {
                  className: 'relative flex bg-gray-800 rounded-full p-1 border border-gray-700',
                  children: [
                    (0, s.jsx)('button', {
                      onClick: () => a('monthly'),
                      className: ''.concat(
                        'monthly' === t
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-400 hover:text-white',
                        ' rounded-full px-6 py-2 text-sm font-medium transition-all duration-200'
                      ),
                      children: 'Monthly',
                    }),
                    (0, s.jsxs)('button', {
                      onClick: () => a('annual'),
                      className: ''.concat(
                        'annual' === t
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-400 hover:text-white',
                        ' rounded-full px-6 py-2 text-sm font-medium transition-all duration-200'
                      ),
                      children: [
                        'Annual ',
                        (0, s.jsx)('span', {
                          className: 'text-xs ml-1 opacity-75',
                          children: '(Save 20%)',
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              (0, s.jsx)('div', {
                className:
                  'isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 md:max-w-2xl md:grid-cols-2 lg:max-w-4xl xl:mx-0 xl:max-w-none xl:grid-cols-3',
                children: c.map(e =>
                  (0, s.jsxs)(
                    'div',
                    {
                      className: 'rounded-3xl p-8 ring-1 ring-white/10 '.concat(
                        e.highlight
                          ? 'bg-white/5 ring-primary-500 scale-105 shadow-xl relative'
                          : 'bg-gray-800/20',
                        ' xl:p-10 transition-transform hover:-translate-y-1'
                      ),
                      children: [
                        e.popular &&
                          (0, s.jsx)('div', {
                            className:
                              'absolute top-0 right-0 -mt-2 -mr-2 px-3 py-1 bg-primary-500 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg',
                            children: 'Most Popular',
                          }),
                        (0, s.jsx)('div', {
                          className: 'flex items-center justify-between gap-x-4',
                          children: (0, s.jsx)('h3', {
                            id: e.id,
                            className: 'text-lg font-semibold leading-8 text-white',
                            children: e.name,
                          }),
                        }),
                        (0, s.jsx)('p', {
                          className: 'mt-4 text-sm leading-6 text-gray-300',
                          children: e.description,
                        }),
                        (0, s.jsxs)('p', {
                          className: 'mt-6 flex items-baseline gap-x-1',
                          children: [
                            (0, s.jsxs)('span', {
                              className: 'text-4xl font-bold tracking-tight text-white',
                              children: ['$', e.price],
                            }),
                            (0, s.jsxs)('span', {
                              className: 'text-sm font-semibold leading-6 text-gray-300',
                              children: ['/', 'monthly' === t ? 'mo' : 'yr'],
                            }),
                          ],
                        }),
                        (0, s.jsx)(r.default, {
                          href: e.buttonHref,
                          className:
                            'mt-6 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 '.concat(
                              e.highlight
                                ? 'bg-primary-600 text-white shadow-sm hover:bg-primary-500 focus-visible:outline-primary-500'
                                : 'bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white'
                            ),
                          children: e.buttonText,
                        }),
                        (0, s.jsxs)('ul', {
                          role: 'list',
                          className: 'mt-8 space-y-3 text-sm leading-6 text-gray-300 xl:mt-10',
                          children: [
                            (0, s.jsxs)('li', {
                              className: 'flex gap-x-3',
                              children: [
                                (0, s.jsx)('span', {
                                  className: 'text-primary-400',
                                  children: '✓',
                                }),
                                'full' === e.features.studyGuidesAccess
                                  ? 'Full Study Guides'
                                  : 'Limited Study Guides',
                              ],
                            }),
                            (0, s.jsxs)('li', {
                              className: 'flex gap-x-3',
                              children: [
                                (0, s.jsx)('span', {
                                  className: 'text-primary-400',
                                  children: '✓',
                                }),
                                'unlimited' === e.features.flashcardsLimit
                                  ? 'Unlimited Flashcards'
                                  : ''.concat(e.features.flashcardsLimit, ' Flashcards'),
                              ],
                            }),
                            (0, s.jsxs)('li', {
                              className: 'flex gap-x-3',
                              children: [
                                (0, s.jsx)('span', {
                                  className: 'text-primary-400',
                                  children: '✓',
                                }),
                                e.features.practiceQuestionsPerDomain,
                                ' Questions / Domain',
                              ],
                            }),
                            (0, s.jsxs)('li', {
                              className: 'flex gap-x-3',
                              children: [
                                (0, s.jsx)('span', {
                                  className: e.features.mockExams
                                    ? 'text-primary-400'
                                    : 'text-gray-600',
                                  children: e.features.mockExams ? '✓' : '✕',
                                }),
                                (0, s.jsx)('span', {
                                  className: e.features.mockExams ? '' : 'text-gray-500',
                                  children: 'Mock Exams',
                                }),
                              ],
                            }),
                            (0, s.jsxs)('li', {
                              className: 'flex gap-x-3',
                              children: [
                                (0, s.jsx)('span', {
                                  className: e.features.advancedAnalytics
                                    ? 'text-primary-400'
                                    : 'text-gray-600',
                                  children: e.features.advancedAnalytics ? '✓' : '✕',
                                }),
                                (0, s.jsx)('span', {
                                  className: e.features.advancedAnalytics ? '' : 'text-gray-500',
                                  children: 'Advanced Analytics',
                                }),
                              ],
                            }),
                            (0, s.jsxs)('li', {
                              className: 'flex gap-x-3',
                              children: [
                                (0, s.jsx)('span', {
                                  className: e.features.teamManagement
                                    ? 'text-primary-400'
                                    : 'text-gray-600',
                                  children: e.features.teamManagement ? '✓' : '✕',
                                }),
                                (0, s.jsx)('span', {
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
    7070: function (e, t, a) {
      'use strict';
      a.d(t, {
        H: function () {
          return c;
        },
        a: function () {
          return l;
        },
      });
      var s = a(7573),
        n = a(7653),
        r = a(4859);
      let i = (0, n.createContext)(void 0),
        o = r.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      function c(e) {
        let { children: t } = e,
          [a, r] = (0, n.useState)({ user: null, token: null, isLoading: !0, isAuthenticated: !1 });
        (0, n.useEffect)(() => {
          let e = localStorage.getItem('accessToken');
          e ? c(e) : r(e => ({ ...e, isLoading: !1 }));
        }, []);
        let c = async e => {
            try {
              let t = await fetch(''.concat(o, '/auth/me'), {
                headers: { Authorization: 'Bearer '.concat(e) },
              });
              if (t.ok) {
                let a = await t.json();
                r({ user: a.data.user, token: e, isLoading: !1, isAuthenticated: !0 });
              } else await m();
            } catch (e) {
              (console.error('Failed to fetch user:', e), u());
            }
          },
          l = async (e, t) => {
            let a = await fetch(''.concat(o, '/auth/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: e, password: t }),
              }),
              s = await a.json();
            if (!a.ok) {
              var n;
              throw Error(
                (null === (n = s.error) || void 0 === n ? void 0 : n.message) || 'Login failed'
              );
            }
            let { accessToken: i, refreshToken: c, user: l } = s.data;
            (localStorage.setItem('accessToken', i),
              localStorage.setItem('refreshToken', c),
              r({ user: l, token: i, isLoading: !1, isAuthenticated: !0 }));
          },
          d = async (e, t, a) => {
            let s = await fetch(''.concat(o, '/auth/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: e, password: t, name: a }),
              }),
              n = await s.json();
            if (!s.ok) {
              var i;
              throw Error(
                (null === (i = n.error) || void 0 === i ? void 0 : i.message) ||
                  'Registration failed'
              );
            }
            let { accessToken: c, refreshToken: l, user: d } = n.data;
            (localStorage.setItem('accessToken', c),
              localStorage.setItem('refreshToken', l),
              r({ user: d, token: c, isLoading: !1, isAuthenticated: !0 }));
          },
          u = () => {
            (localStorage.removeItem('accessToken'),
              localStorage.removeItem('refreshToken'),
              r({ user: null, token: null, isLoading: !1, isAuthenticated: !1 }));
          },
          m = async () => {
            let e = localStorage.getItem('refreshToken');
            if (!e) {
              u();
              return;
            }
            try {
              let t = await fetch(''.concat(o, '/auth/refresh'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: e }),
              });
              if (t.ok) {
                let { accessToken: e, refreshToken: a } = (await t.json()).data;
                (localStorage.setItem('accessToken', e),
                  localStorage.setItem('refreshToken', a),
                  await c(e));
              } else u();
            } catch (e) {
              (console.error('Token refresh failed:', e), u());
            }
          };
        return (0, s.jsx)(i.Provider, {
          value: { ...a, login: l, register: d, logout: u, refreshToken: m },
          children: t,
        });
      }
      function l() {
        let e = (0, n.useContext)(i);
        if (void 0 === e) throw Error('useAuth must be used within an AuthProvider');
        return e;
      }
    },
  },
  function (e) {
    (e.O(0, [340, 293, 528, 744], function () {
      return e((e.s = 9536));
    }),
      (_N_E = e.O()));
  },
]);
