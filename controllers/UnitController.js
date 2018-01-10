const Unit = require('../models/unit');
const AuthController = require('./authController');
const handleRequest = require('../helpers/handleRequest');

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
  const created = await new Unit(toCreate);
  if (userCap === 'unit') {
    AuthController.updateUser(userId, { unit: created._id });
  }
  return created.save(handleRequest(res));
};
