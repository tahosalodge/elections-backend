const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

function createToken(user) {
  const { _id: userId, capability: userCap, unit: userUnit } = user;
  const tokenVars = { userId, userCap };
  if (userCap === 'unit') {
    tokenVars.userUnit = userUnit;
  }
  return jwt.sign(tokenVars, process.env.JWT_SECRET, { expiresIn: 86400 });
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send('Missing parameters.');
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('No user found.');
    }
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send();
    }
    const token = createToken(user);
    const { unit, capability } = user;

    return res.status(200).send({ token, unit, capability });
  } catch (e) {
    return res.status(500).send('Error on the server.');
  }
};

exports.register = async (req, res) => {
  const {
    lname, fname, email, password, chapter,
  } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  const createuserData = {
    fname,
    lname,
    email,
    chapter,
    password: hashedPassword,
  };
  try {
    const user = await User.create(createuserData);
    const token = createToken(user);
    return res.status(200).send({ auth: true, token });
  } catch (err) {
    return res.status(500).send('There was a problem registering the user.');
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.userId, { password: 0 });

    if (!user) {
      return res.status(404).send('No user found');
    }
    return res.status(200).send(user);
  } catch (e) {
    return res.status(500).send('There was a problem finding the user.');
  }
};

exports.verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  }
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userCap = decoded.userCap;
  } catch (err) {
    return res.status(403).send({ auth: false, message: 'Failed to authenticate token.' });
  }
  return next();
};
