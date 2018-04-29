/* eslint no-console: 0 */
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const path = require('path');
const Email = require('email-templates');

const {
  MAILGUN_KEY,
  MAILGUN_DOMAIN,
  FROM_EMAIL,
  NODE_ENV,
  SMTP_STRING,
} = process.env;

const mgAuth = {
  auth: {
    api_key: MAILGUN_KEY,
    domain: MAILGUN_DOMAIN,
  },
};

let transport = {};
if (NODE_ENV === 'development') {
  transport = nodemailer.createTransport(SMTP_STRING);
} else {
  transport = nodemailer.createTransport(mg(mgAuth));
}

const sendEmail = (subject, to, html) => {
  const options = {
    from: FROM_EMAIL,
    to,
    subject,
    html,
  };
  transport
    .sendMail(options)
    .then(info => console.log(info))
    .then(() => {
      if (NODE_ENV === 'development') {
        console.table(options);
      }
    })
    .catch(error => console.log(error));
};

const email = new Email({
  message: {
    from: FROM_EMAIL,
  },
  send: true,
  transport,
  views: {
    root: path.resolve('src/emails'),
    options: {
      extension: 'nunjucks',
    },
  },
  subjectPrefix: 'Tahosa Lodge Elections',
  preview: false,
});

const templateSender = (to, template, locals) => {
  email
    .send({
      template,
      message: {
        to,
      },
      locals,
    })
    .then(() => {
      console.log(`Sent email ${template} to ${to}`);
    })
    .catch(error => console.log(error));
};

module.exports = { sendEmail, templateSender };
