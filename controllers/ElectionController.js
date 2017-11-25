const Election = require('../models/election');
const handleRequest = require('../helpers/handleRequest');

exports.getAll = () => (req, res) => {
  if (req.userCap === 'unit') {
    Election.find({ unit: req.userUnit }, handleRequest(res));
  } else {
    Election.find(handleRequest(res));
  }
};
