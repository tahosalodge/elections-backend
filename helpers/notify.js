const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

const { MAILGUN_KEY, MAILGUN_DOMAIN, FROM_EMAIL } = process.env;
const mgAuth = {
  auth: {
    api_key: MAILGUN_KEY,
    domain: MAILGUN_DOMAIN,
  },
};
const mailer = nodemailer.createTransport(mg(mgAuth));

class Notify {
  constructor(toAddress) {
    this.toAddress = toAddress;
  }

  sendEmail(subject, message) {
    const options = {
      from: FROM_EMAIL,
      to: this.toAddress,
      html: message,
    };
    mailer
      .sendMail(options)
      .then(info => console.log(info))
      .catch(error => console.log(error));
  }
}

module.exports = Notify;
