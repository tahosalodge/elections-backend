/* eslint no-console: 0 */
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

const {
  MAILGUN_KEY, MAILGUN_DOMAIN, FROM_EMAIL, ADMIN_EMAIL, NODE_ENV,
} = process.env;
const mgAuth = {
  auth: {
    api_key: MAILGUN_KEY,
    domain: MAILGUN_DOMAIN,
  },
};
const mailer = nodemailer.createTransport(mg(mgAuth));

class Notify {
  constructor(toAddress) {
    if (NODE_ENV === 'development') {
      this.toAddress = ADMIN_EMAIL;
    } else {
      this.toAddress = toAddress;
    }
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
