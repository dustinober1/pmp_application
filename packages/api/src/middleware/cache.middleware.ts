import { Request, Response, NextFunction } from 'express';

/**
 * Add Cache-Control headers to responses for static/semi-static content
 * This enables browser and CDN caching for frequently accessed endpoints
 */
export const addCacheHeaders = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    // Only cache GET requests
    if (req.method === 'GET') {
        // Static content - cache for 1 hour
        if (
            req.path.includes('/api/domains') ||
            req.path.includes('/api/formulas') ||
            req.path.includes('/api/ebook/chapters')
        ) {
            res.setHeader(
                'Cache-Control',
                'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
            );
        }
        // Semi-static content - cache for 15 minutes
        else if (
            req.path.includes('/api/tasks') ||
            req.path.includes('/api/flashcards')
        ) {
            res.setHeader(
                'Cache-Control',
                'public, max-age=900, s-maxage=900, stale-while-revalidate=1800',
            );
        }
        // User-specific data - cache for 5 minutes with revalidation
        else if (req.path.includes('/api/dashboard')) {
            res.setHeader(
                'Cache-Control',
                'private, max-age=300, must-revalidate',
            );
        }
    }

    next();
};

/**
 * Disable caching for endpoints that must always be fresh
 */
export const disableCache = (
    _req: Request,
    res: Response,
    next: NextFunction,
) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
};

/**
 * ETag middleware for conditional requests
 * Helps save bandwidth by returning 304 Not Modified when content hasn't changed
 */
export const etagMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    // Only apply to GET requests with query params (indicating potentially cacheable data)
    if (req.method === 'GET' && Object.keys(req.query).length > 0) {
        const originalJson = res.json.bind(res);

        res.json = function (this: Response, body: any) {
            // Generate a simple hash of the response body
            const bodyStr = JSON.stringify(body);
            const hash = Buffer.from(bodyStr).toString('base64').substring(0, 32);

            const etag = `"${hash}"`;
            res.setHeader('ETag', etag);

            // Check if client provided If-None-Match header
            const ifNoneMatch = req.get('If-None-Match');

            if (ifNoneMatch === etag) {
                return res.status(304).end();
            }

            return originalJson(body);
        };
    }

    next();
};
