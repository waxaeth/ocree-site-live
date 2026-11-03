const rateLimit = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

function json(status, body) {
  return {statusCode: status, headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}, body: JSON.stringify(body)};
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
}

function getClientIp(request) {
  return request.headers['x-forwarded-for']?.split(',')[0]?.trim() || request.headers['x-real-ip'] || 'unknown';
}

module.exports = async function handler(request) {
  if (request.method !== 'POST') return json(405, {error: 'Method not allowed.'});

  const ip = getClientIp(request);
  const now = Date.now();
  const recent = (rateLimit.get(ip) || []).filter((timestamp) => now - timestamp < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) return json(429, {error: 'Too many requests. Please try again later.'});
  recent.push(now);
  rateLimit.set(ip, recent);

  let data;
  try {
    data = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
  } catch {
    return json(400, {error: 'Invalid request.'});
  }

  if (!data || data.website) return json(200, {ok: true});
  const fields = ['first', 'last', 'email', 'role', 'message'];
  if (fields.some((field) => typeof data[field] !== 'string' || !data[field].trim())) return json(400, {error: 'Please complete the required fields.'});
  if (data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return json(400, {error: 'Please enter a valid email address.'});
  if (data.message.length > 5000) return json(400, {error: 'Please shorten your message.'});
  if (!process.env.TURNSTILE_SECRET_KEY || !process.env.RESEND_API_KEY) return json(503, {error: 'The contact form is not configured yet.'});

  const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({secret: process.env.TURNSTILE_SECRET_KEY, response: data.turnstileToken || '', remoteip: ip})
  });
  const turnstileResult = await turnstileResponse.json();
  if (!turnstileResult.success) return json(400, {error: 'Please complete the security check again.'});

  const safe = Object.fromEntries(['first','last','email','phone','role','province','message'].map((field) => [field, escapeHtml(data[field] || '')]));
  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || 'website@ocreefg.com',
      to: [process.env.CONTACT_TO_EMAIL || 'contact@ocreefg.com'],
      reply_to: data.email,
      subject: `Website enquiry from ${safe.first} ${safe.last}`,
      text: `Name: ${data.first} ${data.last}\nEmail: ${data.email}\nPhone: ${data.phone || 'Not provided'}\nRole: ${data.role}\nProvince or country: ${data.province || 'Not provided'}\n\n${data.message}`,
      html: `<p><strong>Name:</strong> ${safe.first} ${safe.last}</p><p><strong>Email:</strong> ${safe.email}</p><p><strong>Phone:</strong> ${safe.phone || 'Not provided'}</p><p><strong>Role:</strong> ${safe.role}</p><p><strong>Province or country:</strong> ${safe.province || 'Not provided'}</p><p>${safe.message.replace(/\n/g, '<br>')}</p>`
    })
  });
  if (!resendResponse.ok) return json(502, {error: 'We could not deliver your message. Please email contact@ocreefg.com.'});
  return json(200, {ok: true});
};
