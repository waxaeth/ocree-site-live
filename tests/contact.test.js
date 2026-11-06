const assert = require('node:assert/strict');
const {test} = require('node:test');
const handler = require('../api/contact');

function request(body, method = 'POST') {
  return {method, body, headers: {'x-forwarded-for': `test-${Math.random()}`}};
}

async function invoke(input) {
  const response = {
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
  await handler(input, response);
  return response;
}

const validBody = {
  first: 'Test', last: 'User', email: 'test@example.com',
  role: 'Media', message: 'A test message.', turnstileToken: 'valid-token'
};

test('returns HTTP responses for unsupported and invalid requests', async () => {
  assert.equal((await invoke(request({}, 'GET'))).statusCode, 405);
  assert.equal((await invoke(request({first: 'Test'}))).statusCode, 400);
});

test('reports missing configuration without hanging', async () => {
  const previous = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;
  try {
    const response = await invoke(request(validBody));
    assert.equal(response.statusCode, 503);
    assert.equal(response.body.error, 'The contact form is not configured yet.');
  } finally {
    if (previous === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previous;
  }
});

test('verifies Turnstile and sends email', async () => {
  const previousFetch = global.fetch;
  const previousSecret = process.env.TURNSTILE_SECRET_KEY;
  const previousKey = process.env.RESEND_API_KEY;
  const calls = [];
  process.env.TURNSTILE_SECRET_KEY = 'test-secret';
  process.env.RESEND_API_KEY = 'test-key';
  global.fetch = async (url, options) => {
    calls.push({url, options});
    return url.includes('turnstile')
      ? {ok: true, json: async () => ({success: true})}
      : {ok: true};
  };
  try {
    const response = await invoke(request(validBody));
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, {ok: true});
    assert.equal(calls.length, 2);
    assert.equal(calls[1].url, 'https://api.resend.com/emails');
    assert.equal(JSON.parse(calls[1].options.body).to[0], 'contact@ocreefg.com');
  } finally {
    global.fetch = previousFetch;
    if (previousSecret === undefined) delete process.env.TURNSTILE_SECRET_KEY;
    else process.env.TURNSTILE_SECRET_KEY = previousSecret;
    if (previousKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previousKey;
  }
});
