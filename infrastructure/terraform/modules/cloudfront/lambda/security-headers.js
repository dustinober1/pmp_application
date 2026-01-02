function handler(event) {
  var response = event.response;
  var headers = response.headers;

  // Strict-Transport-Security
  headers['strict-transport-security'] = {
    value: 'max-age=31536000; includeSubDomains; preload'
  };

  // X-Content-Type-Options
  headers['x-content-type-options'] = {
    value: 'nosniff'
  };

  // X-Frame-Options
  headers['x-frame-options'] = {
    value: 'DENY'
  };

  // X-XSS-Protection
  headers['x-xss-protection'] = {
    value: '1; mode=block'
  };

  // Content-Security-Policy (basic, adjust based on needs)
  headers['content-security-policy'] = {
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com;"
  };

  // Referrer-Policy
  headers['referrer-policy'] = {
    value: 'strict-origin-when-cross-origin'
  };

  // Permissions-Policy
  headers['permissions-policy'] = {
    value: 'geolocation=(), microphone=(), camera=()'
  };

  return response;
}
