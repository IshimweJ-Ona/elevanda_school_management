const REQUIRED_ENV_VARS = ["DATABASE_URL", "JWT_SECRET"];

const assertRequiredEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};

const env = {
  port: Number(process.env.PORT || 8000),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:5174,http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
};

module.exports = { assertRequiredEnv, env };
