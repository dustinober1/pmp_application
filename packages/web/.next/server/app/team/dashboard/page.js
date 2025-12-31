(() => {
  var e = {};
  ((e.id = 235),
    (e.ids = [235]),
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
      3280: (e, t, s) => {
        'use strict';
        (s.r(t),
          s.d(t, {
            GlobalError: () => o.a,
            __next_app__: () => h,
            originalPathname: () => m,
            pages: () => c,
            routeModule: () => u,
            tree: () => d,
          }),
          s(8791),
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
        let d = [
            '',
            {
              children: [
                'team',
                {
                  children: [
                    'dashboard',
                    {
                      children: [
                        '__PAGE__',
                        {},
                        {
                          page: [
                            () => Promise.resolve().then(s.bind(s, 8791)),
                            '/Users/dustinober/Projects/pmp_application/packages/web/src/app/team/dashboard/page.tsx',
                          ],
                        },
                      ],
                    },
                    {},
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
          c = [
            '/Users/dustinober/Projects/pmp_application/packages/web/src/app/team/dashboard/page.tsx',
          ],
          m = '/team/dashboard/page',
          h = { require: s, loadChunk: () => Promise.resolve() },
          u = new a.AppPageRouteModule({
            definition: {
              kind: r.x.APP_PAGE,
              page: '/team/dashboard/page',
              pathname: '/team/dashboard',
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
      9846: (e, t, s) => {
        Promise.resolve().then(s.bind(s, 1013));
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
      1013: (e, t, s) => {
        'use strict';
        (s.r(t), s.d(t, { default: () => n }));
        var a = s(3227),
          r = s(3677),
          i = s(1043),
          o = s(7674);
        function n() {
          let e = (0, i.useRouter)(),
            [t, s] = (0, r.useState)(!0),
            [n, l] = (0, r.useState)(null),
            [d, c] = (0, r.useState)(null),
            [m, h] = (0, r.useState)(''),
            [u, p] = (0, r.useState)(!1),
            [g, x] = (0, r.useState)(null),
            y = async () => {
              try {
                s(!0);
                let e = await (0, o.Nv)('/teams'),
                  t = e.data?.teams || [];
                if (0 === t.length) {
                  s(!1);
                  return;
                }
                let a = t[0];
                l(a);
                let r = await (0, o.Nv)(`/teams/${a.id}/dashboard`);
                r.data && c(r.data.dashboard);
              } catch (e) {
                console.error('Failed to load team data', e);
              } finally {
                s(!1);
              }
            },
            b = async e => {
              if ((e.preventDefault(), n && m)) {
                (p(!0), x(null));
                try {
                  (await (0, o.Nv)(`/teams/${n.id}/invitations`, {
                    method: 'POST',
                    body: { email: m },
                  }),
                    x({ type: 'success', message: `Invitation sent to ${m}` }),
                    h(''));
                } catch (e) {
                  (console.error('Invite failed', e),
                    x({ type: 'error', message: e.message || 'Failed to send invitation' }));
                } finally {
                  p(!1);
                }
              }
            },
            f = async (e, t) => {
              if (n && confirm(`Are you sure you want to remove ${t} from the team?`))
                try {
                  (await (0, o.Nv)(`/teams/${n.id}/members/${e}/preserve`, { method: 'DELETE' }),
                    y());
                } catch (e) {
                  (console.error('Failed to remove member', e), alert('Failed to remove member'));
                }
            },
            v = async e => {
              if (n)
                try {
                  (await (0, o.Nv)(`/teams/${n.id}/alerts/${e}/acknowledge`, { method: 'POST' }),
                    d && c({ ...d, alerts: d.alerts.filter(t => t.id !== e) }));
                } catch (e) {
                  console.error('Failed to acknowledge alert', e);
                }
            };
          return t
            ? a.jsx('div', {
                className: 'flex justify-center items-center min-h-[60vh]',
                children: a.jsx('div', {
                  className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600',
                }),
              })
            : n && d
              ? (0, a.jsxs)('div', {
                  className: 'max-w-7xl mx-auto px-4 py-8',
                  children: [
                    (0, a.jsxs)('div', {
                      className:
                        'flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4',
                      children: [
                        (0, a.jsxs)('div', {
                          children: [
                            a.jsx('h1', {
                              className: 'text-3xl font-bold text-white mb-2',
                              children: d.teamName,
                            }),
                            (0, a.jsxs)('div', {
                              className: 'flex gap-4 text-sm text-gray-400',
                              children: [
                                (0, a.jsxs)('span', {
                                  children: [
                                    'Members: ',
                                    a.jsx('span', {
                                      className: 'text-white font-medium',
                                      children: d.totalMembers,
                                    }),
                                  ],
                                }),
                                (0, a.jsxs)('span', {
                                  children: [
                                    'Active: ',
                                    a.jsx('span', {
                                      className: 'text-green-400 font-medium',
                                      children: d.activeMembers,
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, a.jsxs)('div', {
                          className: 'flex gap-4',
                          children: [
                            (0, a.jsxs)('div', {
                              className: 'text-right',
                              children: [
                                a.jsx('div', {
                                  className: 'text-sm text-gray-400',
                                  children: 'Avg. Progress',
                                }),
                                (0, a.jsxs)('div', {
                                  className: 'text-2xl font-bold text-primary-400',
                                  children: [d.averageProgress, '%'],
                                }),
                              ],
                            }),
                            (0, a.jsxs)('div', {
                              className: 'text-right pl-6 border-l border-gray-700',
                              children: [
                                a.jsx('div', {
                                  className: 'text-sm text-gray-400',
                                  children: 'Avg. Readiness',
                                }),
                                (0, a.jsxs)('div', {
                                  className: 'text-2xl font-bold text-green-400',
                                  children: [d.averageReadinessScore, '%'],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, a.jsxs)('div', {
                      className: 'grid grid-cols-1 lg:grid-cols-3 gap-8',
                      children: [
                        (0, a.jsxs)('div', {
                          className: 'lg:col-span-2 space-y-8',
                          children: [
                            d.alerts.length > 0 &&
                              (0, a.jsxs)('div', {
                                className:
                                  'bg-gray-800/50 border border-yellow-900/50 rounded-xl p-6',
                                children: [
                                  (0, a.jsxs)('h3', {
                                    className:
                                      'text-lg font-bold text-white mb-4 flex items-center',
                                    children: [
                                      a.jsx('span', {
                                        className: 'text-yellow-500 mr-2',
                                        children: '⚠️',
                                      }),
                                      ' Needs Attention',
                                    ],
                                  }),
                                  a.jsx('div', {
                                    className: 'space-y-3',
                                    children: d.alerts.map(e =>
                                      (0, a.jsxs)(
                                        'div',
                                        {
                                          className:
                                            'flex justify-between items-center bg-gray-900/50 p-4 rounded-lg border border-gray-800',
                                          children: [
                                            (0, a.jsxs)('div', {
                                              children: [
                                                a.jsx('span', {
                                                  className: `inline-block px-2 py-0.5 rounded text-xs uppercase font-bold mr-3 ${'inactive' === e.type ? 'bg-gray-700 text-gray-300' : 'struggling' === e.type ? 'bg-red-900/50 text-red-400' : 'bg-yellow-900/50 text-yellow-400'}`,
                                                  children: e.type.replace('_', ' '),
                                                }),
                                                a.jsx('span', {
                                                  className: 'text-gray-300',
                                                  children: e.message,
                                                }),
                                              ],
                                            }),
                                            a.jsx('button', {
                                              onClick: () => v(e.id),
                                              className: 'text-gray-500 hover:text-white text-sm',
                                              children: 'Dismiss',
                                            }),
                                          ],
                                        },
                                        e.id
                                      )
                                    ),
                                  }),
                                ],
                              }),
                            (0, a.jsxs)('div', {
                              className:
                                'bg-gray-900 border border-gray-800 rounded-xl overflow-hidden',
                              children: [
                                a.jsx('div', {
                                  className:
                                    'p-6 border-b border-gray-800 flex justify-between items-center',
                                  children: a.jsx('h3', {
                                    className: 'text-xl font-bold text-white',
                                    children: 'Team Members',
                                  }),
                                }),
                                a.jsx('div', {
                                  className: 'overflow-x-auto',
                                  children: (0, a.jsxs)('table', {
                                    className: 'w-full text-left',
                                    children: [
                                      a.jsx('thead', {
                                        children: (0, a.jsxs)('tr', {
                                          className:
                                            'bg-gray-800/50 text-gray-400 text-sm uppercase tracking-wider',
                                          children: [
                                            a.jsx('th', {
                                              className: 'px-6 py-4',
                                              children: 'Member',
                                            }),
                                            a.jsx('th', {
                                              className: 'px-6 py-4',
                                              children: 'Progress',
                                            }),
                                            a.jsx('th', {
                                              className: 'px-6 py-4',
                                              children: 'Last Active',
                                            }),
                                            a.jsx('th', {
                                              className: 'px-6 py-4 text-right',
                                              children: 'Actions',
                                            }),
                                          ],
                                        }),
                                      }),
                                      (0, a.jsxs)('tbody', {
                                        className: 'divide-y divide-gray-800',
                                        children: [
                                          d.memberStats.map(e =>
                                            (0, a.jsxs)(
                                              'tr',
                                              {
                                                className: 'hover:bg-gray-800/30 transition',
                                                children: [
                                                  a.jsx('td', {
                                                    className: 'px-6 py-4',
                                                    children: a.jsx('div', {
                                                      className: 'font-medium text-white',
                                                      children: e.userName,
                                                    }),
                                                  }),
                                                  a.jsx('td', {
                                                    className: 'px-6 py-4',
                                                    children: (0, a.jsxs)('div', {
                                                      className: 'flex items-center gap-3',
                                                      children: [
                                                        a.jsx('div', {
                                                          className:
                                                            'w-24 h-2 bg-gray-700 rounded-full overflow-hidden',
                                                          children: a.jsx('div', {
                                                            className: 'h-full bg-primary-500',
                                                            style: { width: `${e.progress}%` },
                                                          }),
                                                        }),
                                                        (0, a.jsxs)('span', {
                                                          className: 'text-gray-300 text-sm',
                                                          children: [e.progress, '%'],
                                                        }),
                                                      ],
                                                    }),
                                                  }),
                                                  a.jsx('td', {
                                                    className: 'px-6 py-4 text-gray-400 text-sm',
                                                    children: e.lastActiveDate
                                                      ? new Date(
                                                          e.lastActiveDate
                                                        ).toLocaleDateString()
                                                      : 'Never',
                                                  }),
                                                  a.jsx('td', {
                                                    className: 'px-6 py-4 text-right',
                                                    children: a.jsx('button', {
                                                      onClick: () => f(e.userId, e.userName),
                                                      className:
                                                        'text-red-400 hover:text-red-300 text-sm font-medium transition',
                                                      children: 'Remove',
                                                    }),
                                                  }),
                                                ],
                                              },
                                              e.memberId
                                            )
                                          ),
                                          0 === d.memberStats.length &&
                                            a.jsx('tr', {
                                              children: a.jsx('td', {
                                                colSpan: 4,
                                                className: 'px-6 py-12 text-center text-gray-500',
                                                children:
                                                  'No members found. Invite someone to get started!',
                                              }),
                                            }),
                                        ],
                                      }),
                                    ],
                                  }),
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, a.jsxs)('div', {
                          className: 'space-y-8',
                          children: [
                            (0, a.jsxs)('div', {
                              className: 'bg-gray-900 border border-gray-800 rounded-xl p-6',
                              children: [
                                a.jsx('h3', {
                                  className: 'text-lg font-bold text-white mb-4',
                                  children: 'Invite Member',
                                }),
                                (0, a.jsxs)('form', {
                                  onSubmit: b,
                                  className: 'space-y-4',
                                  children: [
                                    (0, a.jsxs)('div', {
                                      children: [
                                        a.jsx('label', {
                                          className: 'block text-sm text-gray-400 mb-1',
                                          children: 'Email Address',
                                        }),
                                        a.jsx('input', {
                                          type: 'email',
                                          required: !0,
                                          value: m,
                                          onChange: e => h(e.target.value),
                                          placeholder: 'colleague@company.com',
                                          className:
                                            'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 transition',
                                        }),
                                      ],
                                    }),
                                    g &&
                                      a.jsx('div', {
                                        className: `p-3 rounded text-sm ${'success' === g.type ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`,
                                        children: g.message,
                                      }),
                                    a.jsx('button', {
                                      type: 'submit',
                                      disabled: u,
                                      className:
                                        'w-full py-2 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-200 transition disabled:opacity-50',
                                      children: u ? 'Sending...' : 'Send Invitation',
                                    }),
                                    (0, a.jsxs)('p', {
                                      className: 'text-xs text-center text-gray-500 mt-2',
                                      children: [
                                        'You have used ',
                                        d.totalMembers,
                                        ' of 10 licenses.',
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            (0, a.jsxs)('div', {
                              className:
                                'bg-gray-900 border border-gray-800 rounded-xl p-6 opacity-60',
                              children: [
                                a.jsx('h3', {
                                  className: 'text-lg font-bold text-gray-400 mb-4',
                                  children: 'Team Goals',
                                }),
                                a.jsx('div', {
                                  className: 'text-center py-8 text-gray-600',
                                  children: 'Goals feature coming soon',
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                })
              : (0, a.jsxs)('div', {
                  className: 'max-w-4xl mx-auto px-4 py-12 text-center text-white',
                  children: [
                    a.jsx('h2', {
                      className: 'text-2xl font-bold mb-4',
                      children: 'No Team Found',
                    }),
                    a.jsx('p', {
                      className: 'text-gray-400 mb-8',
                      children: "You don't seem to have a corporate team set up yet.",
                    }),
                    a.jsx('button', {
                      onClick: () => e.push('/dashboard'),
                      className: 'px-6 py-2 bg-gray-800 rounded hover:bg-gray-700 transition',
                      children: 'Back to Dashboard',
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
                (console.error('Failed to fetch user:', e), c());
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
            d = async (e, t, a) => {
              let r = await fetch(`${o}/auth/register`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: e, password: t, name: a }),
                }),
                i = await r.json();
              if (!r.ok) throw Error(i.error?.message || 'Registration failed');
              let { accessToken: n, refreshToken: l, user: d } = i.data;
              (localStorage.setItem('accessToken', n),
                localStorage.setItem('refreshToken', l),
                s({ user: d, token: n, isLoading: !1, isAuthenticated: !0 }));
            },
            c = () => {
              (localStorage.removeItem('accessToken'),
                localStorage.removeItem('refreshToken'),
                s({ user: null, token: null, isLoading: !1, isAuthenticated: !1 }));
            },
            m = async () => {
              let e = localStorage.getItem('refreshToken');
              if (!e) {
                c();
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
                } else c();
              } catch (e) {
                (console.error('Token refresh failed:', e), c());
              }
            };
          return a.jsx(i.Provider, {
            value: { ...t, login: l, register: d, logout: c, refreshToken: m },
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
        s.d(t, { Lc: () => n, Nv: () => i, Sh: () => c, kx: () => d, sA: () => o, tF: () => l });
        let a = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        async function r() {
          return null;
        }
        async function i(e, t = {}) {
          let { method: s = 'GET', body: i, token: o } = t,
            n = o ?? (await r()),
            l = { 'Content-Type': 'application/json' };
          n && (l.Authorization = `Bearer ${n}`);
          let d = await fetch(`${a}${e}`, {
              method: s,
              headers: l,
              body: i ? JSON.stringify(i) : void 0,
            }),
            c = await d.json();
          if (!d.ok) throw Error(c.error?.message || 'Request failed');
          return c;
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
          d = {
            getDashboard: () => i('/dashboard'),
            getStreak: () => i('/dashboard/streak'),
            getProgress: () => i('/dashboard/progress'),
            getActivity: e => i(`/dashboard/activity${e ? `?limit=${e}` : ''}`),
            getReviews: e => i(`/dashboard/reviews${e ? `?limit=${e}` : ''}`),
            getWeakAreas: () => i('/dashboard/weak-areas'),
            getReadiness: () => i('/dashboard/readiness'),
            getRecommendations: () => i('/dashboard/recommendations'),
          },
          c = {
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
      8791: (e, t, s) => {
        'use strict';
        (s.r(t), s.d(t, { default: () => a }));
        let a = (0, s(3189).createProxy)(
          String.raw`/Users/dustinober/Projects/pmp_application/packages/web/src/app/team/dashboard/page.tsx#default`
        );
      },
      5556: () => {},
    }));
  var t = require('../../../webpack-runtime.js');
  t.C(e);
  var s = e => t((t.s = e)),
    a = t.X(0, [136], () => s(3280));
  module.exports = a;
})();
