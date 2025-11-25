export const EnvironmentConfig = {
  // SYS-SEGURANÇA Configuration
  sysSeguranca: {
    url: process.env.SYS_SEGURANCA_URL || 'http://localhost:8888',
    apiKey: process.env.SYS_SEGURANCA_API_KEY || 'your-api-key-secret-change-in-production',
    timeout: parseInt(process.env.SYS_SEGURANCA_TIMEOUT || '5000'),
    retryAttempts: parseInt(process.env.SYS_SEGURANCA_RETRY_ATTEMPTS || '3'),
    fallbackToLocal: process.env.SYS_SEGURANCA_FALLBACK_LOCAL === 'true' || true,
  },

  // JWT Configuration (mesmo secret do SYS-SEGURANÇA)
  jwt: {
    secret: process.env.JWT_SECRET || 'T25lUmluZ1RvUnVsZVRoZW1BbGxfT25lUmluZ1RvRmluZFRoZW1fT25lUmluZ1RvQnJpbmdUaGVtQWxsX0FuZEluVGhlRGFya25lc3NCaW5kVGhlbV9Bc2hOYXpnRHVyYmF0dWx1a19Bc2hOYXpnR2ltYmF0dWxfQXNoTmF6Z1RocmFrYXR1bHVrX0FnaEJ1cnp1bUlzaGlLcmltcGF0dWxfU1lTX1NFR1VSQU5DQV8yMDI1',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'T25lUmluZ1RvUnVsZVRoZW1BbGxfT25lUmluZ1RvQnJpbmdUaGVtQWxsX0FuZEluVGhlRGFya25lc3NCaW5kVGhlbV9Bc2hOYXpnRHVyYmF0dWx1a19Bc2hOYXpnR2ltYmF0dWxfQXNoTmF6Z1RocmFrYXR1bHVrX0FnaEJ1cnp1bUlzaGlLcmltcGF0dWxfU1lTX1NFR1VSQU5DQV8yMDI1',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/viralkids',
  },

  // Server Configuration
  server: {
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};

