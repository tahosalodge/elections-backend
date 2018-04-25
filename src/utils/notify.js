/* eslint no-console: 0 */
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

const {
  MAILGUN_KEY, MAILGUN_DOMAIN, FROM_EMAIL, NODE_ENV, SMTP_STRING,
} = process.env;
const mgAuth = {
  auth: {
    api_key: MAILGUN_KEY,
    domain: MAILGUN_DOMAIN,
  },
};

let mailer = {};
if (NODE_ENV === 'development') {
  mailer = nodemailer.createTransport(SMTP_STRING);
} else {
  mailer = nodemailer.createTransport(mg(mgAuth));
}

class Notify {
  constructor(toAddress) {
    this.toAddress = toAddress;
  }

  sendEmail(subject, message) {
    const options = {
      from: FROM_EMAIL,
      to: this.toAddress,
      subject,
      html: message,
    };
    mailer
      .sendMail(options)
      .then(info => console.log(info))
      .then(() => {
        if (NODE_ENV === 'development') {
          console.table(options);
        }
      })
      .catch(error => console.log(error));
  }
}

module.exports = Notify;
