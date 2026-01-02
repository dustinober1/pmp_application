function handler(event) {
  var response = event.response;
  var headers = response.headers;

  // Only add CORS headers for API requests
  if (event.request.uri.startsWith('/api/')) {
    headers['access-control-allow-origin'] = {
      value: '*' // Restrict in production
    };

    headers['access-control-allow-methods'] = {
      value: 'GET, POST, PUT, DELETE, OPTIONS'
    };

    headers['access-control-allow-headers'] = {
      value: 'Content-Type, Authorization'
    };

    headers['access-control-expose-headers'] = {
      value: 'Content-Length, Content-Range'
    };

    headers['access-control-max-age'] = {
      value: '86400'
    };
  }

  return response;
}
