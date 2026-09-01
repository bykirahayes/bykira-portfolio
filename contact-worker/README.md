# Enquiry email relay

This Cloudflare Worker validates Cloudflare Turnstile, rate-limits abuse, and sends enquiries through Resend without exposing the destination mailbox in the public site source.

Required Worker secrets: `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, and `ENQUIRY_TO`.
