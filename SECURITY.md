# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in PMP Study Pro, please email the maintainers directly instead of using the public issue tracker. This allows us to fix the issue and release a security update before public disclosure.

Please include the following information in your report:

- Description of the vulnerability
- Steps to reproduce the issue
- Affected versions
- Potential impact
- Suggested fix (if applicable)

## Security Considerations

PMP Study Pro is designed as an offline-first, client-side application with the following security characteristics:

- **No backend servers** - All data is stored locally in your browser
- **No authentication required** - The application requires no user login
- **No sensitive data transmission** - Your progress and study data never leave your device
- **Static content only** - The application is deployed as a static site on GitHub Pages

## Security Audit (January 2026)

### XSS (Cross-Site Scripting) Protection

| Component | Status | Details |
|-----------|--------|---------|
| DOMPurify Sanitization | Implemented | All `{@html}` content is sanitized with DOMPurify |
| Event Handler Blocking | Implemented | `onclick` and other event handlers stripped from sanitized HTML |
| Data Import Sanitization | Implemented | Zod schema validation with string sanitization on import |

**Implementation Details:**
- `SanitizedMarkdown.svelte`: Uses DOMPurify with strict configuration
- `PowerInterestGrid.svelte`: Sanitizes htmlContent props before rendering
- `dataPortability.ts`: Zod schemas sanitize all imported string values

### Content Security Policy (CSP)

The application implements CSP via meta tags in `app.html`:

```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: blob:;
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

**Note:** `unsafe-inline` is required for SvelteKit's runtime styling. This is mitigated by DOMPurify sanitization of user content.

### API Security

- **Development Only**: HTTP localhost URLs are only allowed in development mode
- **HTTPS Required**: Production API URLs must use HTTPS
- **Static-Only Mode**: When no API is configured, the app operates in static-only mode

### Service Worker Security

- **Cache Versioning**: Caches are versioned to ensure security updates are applied
- **Cache Expiration**: Runtime cache entries expire after 7 days
- **Same-Origin Only**: Only same-origin requests are cached
- **Stale-While-Revalidate**: Navigation requests update in background for security patches

### Data Storage Security

| Storage Type | Encryption | Validation | XSS Protection |
|--------------|------------|------------|----------------|
| localStorage | No (non-sensitive data) | Zod schemas | DOMPurify sanitization |
| Service Worker Cache | N/A | Response validation | Same-origin only |

**Note:** localStorage is appropriate for this use case as no sensitive data (passwords, tokens, PII) is stored.

## Dependencies

### Current Vulnerability Status

```bash
npm audit
# 4 low severity vulnerabilities (cookie package)
# No high or critical vulnerabilities
```

The `cookie` vulnerability is in a transitive dependency of `@sveltejs/kit`. Since this is a static site with no server-side cookie handling, the practical risk is minimal. This will be resolved when SvelteKit updates its dependency.

### Automated Security Scanning

| Tool | Schedule | Status |
|------|----------|--------|
| Dependabot | Weekly (Mondays) | Active |
| CodeQL | Weekly (Sundays) | Active |
| npm audit | CI pipeline | Active |

## Running Security Tools

### npm Audit

```bash
# Check all vulnerabilities
npm audit

# Check only high/critical
npm audit --audit-level=high

# Auto-fix where safe
npm audit fix
```

### Lighthouse Security Audit

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run security audit
lighthouse https://yourusername.github.io/pmp_application/ \
  --only-categories=best-practices \
  --output=json \
  --output-path=./lighthouse-report.json
```

### Snyk Vulnerability Scan

```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate
snyk auth

# Run scan
snyk test

# Monitor for new vulnerabilities
snyk monitor
```

### OWASP ZAP Scan

```bash
# Using Docker
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://yourusername.github.io/pmp_application/
```

### ESLint Security Plugin

```bash
# Install
npm install --save-dev eslint-plugin-security

# Add to .eslintrc
{
  "plugins": ["security"],
  "extends": ["plugin:security/recommended"]
}
```

## Security Updates

When a security vulnerability is discovered and fixed, we will:

1. Fix the vulnerability
2. Increment service worker cache version
3. Release a new version
4. Announce the security update in the release notes
5. Credit the reporter (if desired)

## Security Checklist for Contributors

Before submitting a PR:

- [ ] Run `npm audit` and address any high/critical vulnerabilities
- [ ] Ensure all user-input rendered with `{@html}` is sanitized with DOMPurify
- [ ] Use Zod schemas for validating imported data
- [ ] Avoid `eval()`, `new Function()`, and similar patterns
- [ ] Don't commit secrets, API keys, or credentials
- [ ] Test with browser DevTools security panel

## Scope

This security policy applies to the latest version of PMP Study Pro. Older versions may not receive security updates.

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Security                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Content Security Policy                  │  │
│  │  • Restricts script/style sources                     │  │
│  │  • Blocks framing (clickjacking protection)           │  │
│  │  • Limits form actions and base URIs                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              XSS Protection Layer                     │  │
│  │  • DOMPurify sanitization on all {@html} content      │  │
│  │  • Event handler stripping (onclick, etc.)            │  │
│  │  • Zod schema validation on data import               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Service Worker Security                  │  │
│  │  • Same-origin request caching only                   │  │
│  │  • Cache versioning for security updates              │  │
│  │  • Automatic cache expiration                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Security                             │  │
│  │  • HTTPS required in production                       │  │
│  │  • Development-only localhost fallback                │  │
│  │  • Static-only mode when no API configured            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```
