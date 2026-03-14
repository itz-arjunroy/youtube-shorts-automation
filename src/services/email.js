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

  logger.info('Email', `Attempting to send email to: ${config.EMAIL_TO} via ${config.SMTP_HOST}:${config.SMTP_PORT}`);

  try {
    // Verify connection configuration
    logger.info('Email', 'Verifying SMTP connection...');
    await transporter.verify();
    logger.info('Email', 'SMTP connection verified successfully.');

    const mailOptions = {
      from: config.EMAIL_USER,
      to: config.EMAIL_TO,
      subject: subject,
      text: reportText,
      html: reportHtml
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email', `Report sent successfully. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Email', `Detailed error: ${error.message}`);
    if (error.code === 'EAUTH') {
      logger.error('Email', 'AUTH FAILURE: Check your EMAIL_USER and EMAIL_PASS (App Password).');
    }
    return false;
  }
}

module.exports = {
  sendEmailReport
};
