const jwt = require('jsonwebtoken');

const createToken = user => {
  const { _id: userId, capability: userCap, unit: userUnit } = user;
  const tokenVars = { userId, userCap };
  if (userCap === 'unit') {
    tokenVars.userUnit = userUnit;
  }
  return jwt.sign(tokenVars, process.env.JWT_SECRET, { expiresIn: 86400 });
};

const sendUserInfo = user => {
  const { fname, lname, capability, email, chapter, unit } = user;
  const token = createToken(user);
  const userInfo = {
    token,
    fname,
    lname,
    capability,
    email,
    chapter,
    unit,
  };
  return userInfo;
};

module.exports = {
  createToken,
  sendUserInfo,
};
