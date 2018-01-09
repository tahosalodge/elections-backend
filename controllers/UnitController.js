const Unit = require('../models/unit');
const handleRequest = require('../helpers/handleRequest');

exports.getAll = async (req, res) => {
  if (req.userCap === 'unit') {
    await Unit.find({}, ['number', 'district'], handleRequest(res));
  } else {
    await Unit.find(handleRequest(res));
  }
};

// exports.create = (req, res) => {};
