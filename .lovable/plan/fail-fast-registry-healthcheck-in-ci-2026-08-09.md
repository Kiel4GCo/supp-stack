# Fail-fast registry healthcheck in CI

Add a short connectivity probe before dependency installation in both workflows, so infra problems surface in seconds with a clear message instead of after minutes of install retries.

## What changes

Both `.github/workflows/admin-access-tests.yml` and `.github/workflows/security-scan.yml` get a new step named **"Registry connectivity healthcheck"**, placed after Bun setup and before the install step.

The step:
- Probes `https://registry.npmjs.org/-/ping` and `https://bun.sh` with `curl --fail --silent --max-time 10`.
- Retries each endpoint up to 3 times with a 5s pause (so a single blip is not fatal).
- Prints a clear `::error::` annotation naming the unreachable endpoint and exits non-zero if a probe never succeeds.
- Whole step is bounded by `timeout-minutes: 2` so it can never hang the job.

In `security-scan.yml` the same step also covers the npm registry used by the `npm install --package-lock-only` audit step. The CodeQL and gitleaks jobs are untouched (they do not install npm dependencies).

## Notes

- Existing retry/backoff on Bun setup and install stays as-is; the healthcheck only shortens the feedback loop for hard outages.
- No application code or dependencies change.
