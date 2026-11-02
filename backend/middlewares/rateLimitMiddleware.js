const rateLimit = require("express-rate-limit");

// Rate limit for login (5 attempts per 15 minutes)
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: "Too many login attempts, please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === "development";
  },
});

// Rate limit for signup (3 attempts per 1 hour)
exports.signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: "Too many signup attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit for password reset (3 attempts per 1 hour)
exports.passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: "Too many password reset attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limit (100 requests per 15 minutes)
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
