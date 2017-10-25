const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.login = (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      return res.status(500).send('Error on the server.');
    }
    if (!user) {
      return res.status(404).send('No user found.');
    }

    // check if the password is valid
    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({ auth: false, token: null });
    }
    // eslint-disable-next-line no-underscore-dangle
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: 86400,
    });

    return res.status(200).send({ auth: true, token });
  });
};

exports.register = (req, res) => {
  const hashedPassword = bcrypt.hashSync(req.body.password, 8);

  User.create(
    {
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    },
    (err, user) => {
      if (err) {
        return res.status(500).send('There was a problem registering the user.');
      }
      // eslint-disable-next-line no-underscore-dangle
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: 86400 });
      return res.status(200).send({ auth: true, token });
    },
  );
};

exports.me = (req, res) => {
  User.findById(req.userId, { password: 0 }, (err, user) => {
    if (err) {
      return res.status(500).send('There was a problem finding the user.');
    }
    if (!user) {
      return res.status(404).send('No user found');
    }
    return res.status(200).send(user);
  });
};

exports.verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  }
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  }
  // eslint-disable-next-line
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    }
    req.userId = decoded.id;
  });
  return next();
};
