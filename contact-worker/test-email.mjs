import assert from 'node:assert/strict';
import worker from './src/index.js';

const outbound = [];
globalThis.fetch = async (url, options) => {
  outbound.push({ url: String(url), options });
  if (String(url).includes('/siteverify')) {
    return Response.json({ success: true, hostname: 'bykira.co.uk' });
  }
  return Response.json({ id: 'email_test' });
};

const enquiry = {
  name: 'Alex & Co <Studio>',
  email: 'alex@example.com',
  business: 'Example Studio',
  service: 'Landing page',
  budget: '£1,000–£2,500',
  launch: '2026-10-12',
  website: 'https://example.com/?one=1&two=2',
  details: 'A clear first line.\nA useful second line.',
  source: 'Recommendation',
  companyWebsite: '',
  turnstileToken: 'test-token'
};

const backgroundTasks = [];
const response = await worker.fetch(new Request('https://contact.bykira.co.uk/enquiry', {
  method: 'POST',
  headers: { Origin: 'https://bykira.co.uk', 'Content-Type': 'application/json' },
  body: JSON.stringify(enquiry)
}), {
  ENQUIRY_RATE_LIMITER: { limit: async () => ({ success: true }) },
  TURNSTILE_SECRET_KEY: 'test-secret',
  RESEND_API_KEY: 'test-key',
  ENQUIRY_FROM: 'By Kira <enquiries@example.com>',
  ENQUIRY_TO: 'owner@example.com',
  ENQUIRY_ANALYTICS: { writeDataPoint: () => {} }
}, {
  waitUntil: (promise) => backgroundTasks.push(promise)
});

await Promise.all(backgroundTasks);

assert.equal(response.status, 200);
assert.equal(outbound.length, 3);

const email = JSON.parse(outbound[1].options.body);
assert.equal(email.reply_to, enquiry.email);
assert.equal(email.subject, 'New website enquiry · Landing page · £1,000–£2,500');
assert.match(email.html, /Alex &amp; Co &lt;Studio&gt;/);
assert.doesNotMatch(email.html, /Alex & Co <Studio>/);
assert.match(email.html, /A clear first line\.<br>A useful second line\./);
assert.match(email.html, /Reply to enquiry/);
assert.match(email.text, /01 \/ CONTACT/);
assert.match(email.text, /12 October 2026/);

const acknowledgement = JSON.parse(outbound[2].options.body);
assert.deepEqual(acknowledgement.to, [enquiry.email]);
assert.equal(acknowledgement.subject, 'Your project brief has arrived — By Kira');
assert.match(acknowledgement.html, /Your idea is safely with me/);
assert.doesNotMatch(acknowledgement.html, /A useful second line/);

let journeyPoint;
const eventResponse = await worker.fetch(new Request('https://contact.bykira.co.uk/event', {
  method: 'POST',
  headers: { Origin: 'https://bykira.co.uk', 'Content-Type': 'application/json' },
  body: JSON.stringify({ event: 'enquiry_started', path: '/enquiry/', device: 'desktop' })
}), {
  JOURNEY_RATE_LIMITER: { limit: async () => ({ success: true }) },
  ENQUIRY_ANALYTICS: { writeDataPoint: (point) => { journeyPoint = point; } }
}, { waitUntil: () => {} });

assert.equal(eventResponse.status, 204);
assert.deepEqual(journeyPoint.blobs.slice(0, 3), ['enquiry_started', '/enquiry/', 'desktop']);

console.log('Email template checks passed.');
