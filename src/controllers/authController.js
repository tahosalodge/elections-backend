const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Notify = require('../helpers/notify');
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
      return res.status(400).send({ message: 'Missing parameters.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: 'No user found.' });
    }
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({ message: 'Password incorrect.' });
    }
    const token = createToken(user);
    const { unit, capability } = user;
    return res.status(200).send({ token, unit, capability });
  } catch (e) {
    return res.status(500).send({ message: 'Error on the server.' });
  }
};

exports.register = async (req, res) => {
  const {
    lname, fname, email, password, chapter, capability,
  } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  const createuserData = {
    fname,
    lname,
    email,
    chapter,
    capability,
    password: hashedPassword,
  };
  try {
    const user = await User.create(createuserData);
    const token = createToken(user);
    new Notify(email).sendEmail(
      'Thanks for registering with Tahosa Lodge Elections',
      `Hey ${fname}, thanks for registering with Tahosa Lodge Elections. If you have any questions or issues, please contact us at elections@tahosalodge.org.`,
    );

    return res.status(200).send({ token, capability });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
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

exports.updateUser = async (userId, patch) => {
  const updatedUser = await User.findOneAndUpdate({ _id: userId }, patch);
  return updatedUser;
};

exports.getUser = async (userId) => {
  const user = await User.find({ _id: userId });
  return user;
};