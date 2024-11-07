// add-security-Headers.js

function handler(event) {
    var response = event.response;
    var headers = response.headers;

    headers['content-security-policy'] = {
        value: "default-src 'self'; script-src 'self'; style-src 'self';"
    };

    headers['strict-transport-security'] = {
        value: 'max-age=63072000; includeSubDomains; preload'
    };
    headers['x-content-type-options'] = {
        value: 'nosniff'
    };
    headers['x-frame-options'] = {
        value: 'DENY'
    };
    headers['x-xss-protection'] = {
        value: '1; mode=block'
    };

    return response;
}

