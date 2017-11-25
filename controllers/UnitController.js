const Unit = require('../models/unit');
const handleRequest = require('../helpers/handleRequest');

exports.getAll = (req, res) => {
  if (req.userCap === 'unit') {
    Unit.find({}, ['number', 'district'], handleRequest(res));
  } else {
    Unit.find(handleRequest(res));
  }
};
