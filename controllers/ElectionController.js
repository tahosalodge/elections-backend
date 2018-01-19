const Election = require('../models/election');
const authController = require('./authController');
const unitModel = require('../models/unit');
const handleRequest = require('../helpers/handleRequest');
const Notify = require('../helpers/notify');

exports.getAll = () => (req, res) => {
  if (req.userCap === 'unit') {
    Election.find({ unit: req.userUnit }, handleRequest(res));
  } else {
    Election.find(handleRequest(res));
  }
};

exports.create = () => async (req, res) => {
  const created = new Election(req.body);
  if (req.userCap === 'unit') {
    const { email, fname, unit } = await authController.getUser(req.userId);
    const { number } = await unitModel.find({ id: unit });
    new Notify(email).sendEmail(
      'Election request confirmation',
      `Hi ${fname},<br />

      Please save this email for your records. Thanks for requesting an OA election for ${number}! Here are the dates you requested:<br /><br />

      We’ll notify you automatically when your chapter confirms a date. You can log into your election request using the following credentials at https://elections.tahosa.co/<br /><br />

      You have what you need for now. In case you have questions you can contact elections@tahosalodge.org and we’ll respond as quickly as we can.<br /><br />

      In Scouting,<br /><br />

      Unit Elections Committee<br />
      Tahosa Lodge 383`,
    );
  }
  return created.save(handleRequest(res));
};
