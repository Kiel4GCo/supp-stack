export const MAX_LOG_LENGTH = 60000;

export function canAnalyze(authenticated: boolean, admin: unknown) {
  return authenticated && admin === true;
}

export function redactLogs(value: string): string {
  return value
    .replace(/\x1b\[[0-9;]*m/g, '')
    .replace(/-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----/g, '[REDACTED PRIVATE KEY]')
    .replace(/\b(?:gh[pousr]_[A-Za-z0-9_]+|github_pat_[A-Za-z0-9_]+|sk-[A-Za-z0-9_-]+|AKIA[A-Z0-9]{16})\b/g, '[REDACTED]')
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[REDACTED TOKEN]')
    .replace(/(\b(?:authorization|password|passwd|secret|api[_-]?key|access[_-]?token|[A-Z_]*(?:TOKEN|SECRET|PASSWORD|API_KEY))\b\s*[:=]\s*)(?:["'][^"'\r\n]*["']|[^\r\n]+)/gi, '$1[REDACTED]')
    .replace(/(https?:\/\/)[^\s/@]+:[^\s/@]+@/g, '$1[REDACTED]@');
}

export function safeGatewayError(body: string, fallback: string) {
  try {
    const parsed = JSON.parse(body);
    const message = parsed.message ?? parsed.error?.message;
    return typeof message === 'string' ? redactLogs(message).slice(0, 1500) : fallback;
  } catch {
    return fallback;
  }
}