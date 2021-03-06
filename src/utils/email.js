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
  subjectPrefix: 'Tahosa Lodge Elections | ',
  preview: false,
});

/**
 * Send an email with a template
 * @param {String} to email recipient
 * @param {String} template path to template
 * @param {Object} locals variables to pass to the template
 */
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

/**
 * Send email to array of users
 * @param {Array} users Array of users
 * @param {String} template path to template
 * @param {Object} locals variables to pass to the template
 */
const emailToUsers = (users, template, locals) => {
  if (!users || users.length === 0) {
    return;
  }
  users.forEach(user => {
    templateSender(user.email, template, locals);
  });
};

module.exports = { sendEmail, templateSender, emailToUsers };
