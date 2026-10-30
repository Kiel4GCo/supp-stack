import { describe, expect, it } from 'vitest';
import { canAnalyze, redactLogs, safeGatewayError } from '../../supabase/functions/analyze-ci-logs/security';

describe('CI analyzer safeguards', () => {
  it('rejects signed-out callers even if an admin value is supplied', () => {
    expect(canAnalyze(false, true)).toBe(false);
  });
  it('rejects authenticated non-maintainers', () => {
    expect(canAnalyze(true, false)).toBe(false);
    expect(canAnalyze(true, 'true')).toBe(false);
  });
  it('allows an authenticated administrator', () => {
    expect(canAnalyze(true, true)).toBe(true);
  });
  it('masks common credential assignments while preserving failure evidence', () => {
    const text = redactLogs('TEST_ADMIN_PASSWORD="sensitive-value"\nAuthorization: Bearer abcdef\nerror: lockfile is out of date');
    expect(text).not.toContain('sensitive-value');
    expect(text).not.toContain('abcdef');
    expect(text).toContain('error: lockfile is out of date');
  });
  it('preserves a safe upstream credit remedy instead of inventing a diagnosis', () => {
    expect(safeGatewayError('{"message":"Add AI credits to continue."}', 'failed')).toBe('Add AI credits to continue.');
  });
});