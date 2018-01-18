const Unit = require('../models/unit');
const AuthController = require('./authController');
const handleRequest = require('../helpers/handleRequest');
const Notify = require('../helpers/notify');

exports.getAll = async (req, res) => {
  const { userCap } = req;
  if (userCap === 'unit') {
    await Unit.find({}, ['number', 'district', 'unitLeader'], handleRequest(res));
  } else {
    await Unit.find(handleRequest(res));
  }
};

exports.create = async (req, res) => {
  const { userCap, userId } = req;
  const toCreate = {
    ...req.body,
    users: [userId],
  };
  const unit = await new Unit(toCreate);
  if (userCap === 'unit') {
    const user = AuthController.updateUser(userId, { unit: unit._id });
    new Notify(user.email).sendEmail(
      'Tahosa Lodge Elections - Unit Created',
      `Hey ${user.fname}, your unit ${unit.number}
      has been created. You can access it here: https://elections.tahosa.co/units/${unit._id} `,
    );
  }
  return unit.save(handleRequest(res));
};
