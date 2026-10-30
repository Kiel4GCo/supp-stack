# Architecture rules
- Keep CI diagnosis inside the existing admin area and validate the caller with the existing server-side is_admin RPC; hidden controls are not authorization.
- Keep the CI analyzer AI SDK provider and prompts in its Edge Function directory; stream results and disable automatic retries to avoid duplicate billed work.
- Redact common credentials on both submission and server processing; do not persist CI logs or diagnoses in app storage.
- Check durable service-only AI denial state before analysis; fail closed when it cannot be read and require an explicit fresh request after access recovery.