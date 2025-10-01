export const SysSegurancaConfig = {
  url: process.env.SYS_SEGURANCA_URL || 'http://localhost:8888',
  apiKey: process.env.SYS_SEGURANCA_API_KEY || 'development-local-test-key',
  timeout: parseInt(process.env.SYS_SEGURANCA_TIMEOUT || '5000'),
  retryAttempts: parseInt(process.env.SYS_SEGURANCA_RETRY_ATTEMPTS || '3'),
  fallbackToLocal: process.env.SYS_SEGURANCA_FALLBACK_LOCAL === 'true' || true,
};

export const JwtConfig = {
  secret: process.env.JWT_SECRET || 'T25lUmluZ1RvUnVsZVRoZW1BbGxfT25lUmluZ1RvRmluZFRoZW1fT25lUmluZ1RvQnJpbmdUaGVtQWxsX0FuZEluVGhlRGFya25lc3NCaW5kVGhlbV9Bc2hOYXpnRHVyYmF0dWx1a19Bc2hOYXpnR2ltYmF0dWxfQXNoTmF6Z1RocmFrYXR1bHVrX0FnaEJ1cnp1bUlzaGlLcmltcGF0dWxfU1lTX1NFR1VSQU5DQV8yMDI1',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'T25lUmluZ1RvUnVsZVRoZW1BbGxfT25lUmluZ1RvRmluZFRoZW1fT25lUmluZ1RvQnJpbmdUaGVtQWxsX0FuZEluVGhlRGFya25lc3NCaW5kVGhlbV9Bc2hOYXpnRHVyYmF0dWx1a19Bc2hOYXpnR2ltYmF0dWxfQXNoTmF6Z1RocmFrYXR1bHVrX0FnaEJ1cnp1bUlzaGlLcmltcGF0dWxfU1lTX1NFR1VSQU5DQV8yMDI1',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
