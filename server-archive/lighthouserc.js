module.exports = {
    ci: {
        collect: {
            // URL to run Lighthouse against
            url: ['http://localhost:5173/'],

            // Start the dev server before running Lighthouse
            startServerCommand: 'cd client/client && npm run preview',
            startServerReadyPattern: 'Local:',
            startServerReadyTimeout: 30000,

            // Number of runs to average results
            numberOfRuns: 3,

            // Browser settings
            settings: {
                preset: 'desktop',
                chromeFlags: '--no-sandbox --disable-gpu',
            },
        },

        upload: {
            // Upload to temporary public storage for CI
            target: 'temporary-public-storage',
        },

        assert: {
            // Performance budgets - fail if these thresholds are not met
            assertions: {
                // Core Web Vitals
                'first-contentful-paint': ['warn', { maxNumericValue: 2500 }],
                'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
                'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
                'total-blocking-time': ['warn', { maxNumericValue: 500 }],
                'speed-index': ['warn', { maxNumericValue: 4000 }],

                // Performance score (0-1 scale)
                'categories:performance': ['warn', { minScore: 0.7 }],

                // Accessibility score
                'categories:accessibility': ['warn', { minScore: 0.9 }],

                // Best practices score
                'categories:best-practices': ['warn', { minScore: 0.8 }],

                // SEO score
                'categories:seo': ['warn', { minScore: 0.8 }],
            },
        },
    },
};
