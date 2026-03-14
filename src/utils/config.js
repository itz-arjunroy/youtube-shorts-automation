require('dotenv').config();

module.exports = {
  YT_API: process.env.YT_API,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_TO: process.env.EMAIL_TO || process.env.EMAIL_USER,
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT) || 465,
  SMTP_SECURE: process.env.SMTP_SECURE !== 'false',
  TIMEZONE: process.env.TIMEZONE || 'UTC',
  LOG_LEVEL: process.env.LOG_LEVEL || 'INFO'
};
