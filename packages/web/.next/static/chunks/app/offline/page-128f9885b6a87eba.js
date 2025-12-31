(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [200],
  {
    4045: function (e, t, s) {
      Promise.resolve().then(s.bind(s, 6756));
    },
    8146: function (e, t, s) {
      'use strict';
      s.d(t, {
        default: function () {
          return r.a;
        },
      });
      var n = s(6340),
        r = s.n(n);
    },
    6756: function (e, t, s) {
      'use strict';
      (s.r(t),
        s.d(t, {
          default: function () {
            return a;
          },
        }));
      var n = s(7573),
        r = s(8146);
      function a() {
        return (0, n.jsxs)('div', {
          className: 'flex flex-col items-center justify-center min-h-[80vh] px-4 text-center',
          children: [
            (0, n.jsx)('h1', {
              className: 'text-4xl font-bold text-white mb-4',
              children: 'You are Offline',
            }),
            (0, n.jsx)('p', {
              className: 'text-gray-400 mb-8 max-w-md',
              children:
                "It seems you've lost your internet connection. Don't worry, you can still access content you've previously visited.",
            }),
            (0, n.jsxs)('div', {
              className: 'grid gap-4 w-full max-w-sm',
              children: [
                (0, n.jsxs)(r.default, {
                  href: '/study',
                  className:
                    'bg-gray-800 hover:bg-gray-700 text-white rounded-lg p-4 transition text-left',
                  children: [
                    (0, n.jsx)('span', {
                      className: 'block font-semibold',
                      children: '\uD83D\uDCDA Study Guides',
                    }),
                    (0, n.jsx)('span', {
                      className: 'text-sm text-gray-500',
                      children: 'Access previously opened guides',
                    }),
                  ],
                }),
                (0, n.jsxs)(r.default, {
                  href: '/flashcards',
                  className:
                    'bg-gray-800 hover:bg-gray-700 text-white rounded-lg p-4 transition text-left',
                  children: [
                    (0, n.jsx)('span', {
                      className: 'block font-semibold',
                      children: '\uD83D\uDDC2️ Flashcards',
                    }),
                    (0, n.jsx)('span', {
                      className: 'text-sm text-gray-500',
                      children: 'Review cached cards',
                    }),
                  ],
                }),
              ],
            }),
            (0, n.jsx)('button', {
              onClick: () => window.location.reload(),
              className:
                'mt-8 px-6 py-2 bg-[var(--primary)] text-white rounded-full hover:opacity-90 transition',
              children: 'Try Reconnecting',
            }),
          ],
        });
      }
    },
  },
  function (e) {
    (e.O(0, [340, 293, 528, 744], function () {
      return e((e.s = 4045));
    }),
      (_N_E = e.O()));
  },
]);
