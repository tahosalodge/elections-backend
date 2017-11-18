const Unit = require('../models/unit');

const handleRequest = res => (err, response) => {
  if (err) {
    return res.status(err.status || 500).send(err);
  }

  return res.status(200).send(response || {});
};

exports.getAll = (req, res) => {
  if (req.userCap === 'unit') {
    Unit.find({}, ['number', 'district'], handleRequest(res));
  } else {
    Unit.find(handleRequest(res));
  }
};
