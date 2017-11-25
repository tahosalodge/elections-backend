const handleRequest = require('../helpers/handleRequest');

exports.getAll = Model => (req, res) => {
  Model.find(handleRequest(res));
};

exports.getAllByUser = Model => (req, res) => {
  Model.find({ userId: req.userId }, handleRequest(res));
};

exports.getOne = Model => (req, res) => {
  Model.find({ _id: req.params.id }, handleRequest(res));
};

exports.create = Model => (req, res) => {
  const created = new Model(req.body);
  return created.save(handleRequest(res));
};

exports.update = Model => (req, res) => {
  Model.findOneAndUpdate({ _id: req.params.id }, req.body, handleRequest(res));
};

exports.delete = Model => (req, res) => {
  Model.remove({ _id: req.params.id }, handleRequest(res));
};
