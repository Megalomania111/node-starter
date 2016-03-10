const nodemailer = require('nodemailer');

exports.transporter = nodemailer.createTransport({
  service: 'MailGun',
  auth: {
    user: process.env.MAILGUN_USER,
    pass: process.env.MAILGUN_PASSWORD
  }
});