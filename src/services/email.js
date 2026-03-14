const nodemailer = require('nodemailer');
const config = require('../utils/config');
const logger = require('../utils/logger');

async function sendEmailReport(reportText, reportHtml, subject) {
  const transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_SECURE,
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: config.EMAIL_USER,
    to: config.EMAIL_TO,
    subject: subject,
    text: reportText,
    html: reportHtml
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Email', `Report sent: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Email', `Failed to send email: ${error.message}`);
    return false;
  }
}

module.exports = {
  sendEmailReport
};
