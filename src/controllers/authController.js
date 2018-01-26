const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Notify = require('helpers/notify');
const createError = require('helpers/error');
const User = require('models/user');

class AuthController {
  // eslint-disable-next-line
  createToken(user) {
    const { _id: userId, capability: userCap, unit: userUnit } = user;
    const tokenVars = { userId, userCap };
    if (userCap === 'unit') {
      tokenVars.userUnit = userUnit;
    }
    return jwt.sign(tokenVars, process.env.JWT_SECRET, { expiresIn: 86400 });
  }

  async login(email, password) {
    if (!email || !password) {
      throw createError('Missing parameters.', 400);
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw createError('No user found.', 404);
    }
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      throw createError('Password Incorrect', 401);
    }
    const token = this.createToken(user);
    const { unit, capability } = user;
    return { token, unit, capability };
  }

  async register(userInfo) {
    const {
      email, fname, password, capability,
    } = userInfo;
    const toCreate = {
      ...userInfo,
      password: bcrypt.hashSync(password, 8),
    };
    const user = await User.create(toCreate);
    const token = this.createToken(user);
    await new Notify(email).sendEmail(
      'Thanks for registering with Tahosa Lodge Elections',
      `Hey ${fname}, thanks for registering with Tahosa Lodge Elections. If you have any questions or issues, please contact us at elections@tahosalodge.org.`,
    );
    return { token, capability };
  }

  static async me(userId) {
    const user = await User.findById(userId, { password: 0 });
    if (!user) {
      throw createError('No user found.', 404);
    }
    return user;
  }

  static async tokenMiddleware(req, res, next) {
    try {
      if (!req.headers.authorization) {
        throw createError('No token provided.', 403);
      }
      const token = req.headers.authorization.split(' ')[1];
      if (!token) {
        throw createError('No token provided.', 403);
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.userCap = decoded.userCap;
        return next();
      } catch (error) {
        throw createError('Failed to authenticate token.', 403);
      }
    } catch ({ code, message }) {
      return res.status(code).send({ message });
    }
  }

  static async updateUser(userId, patch) {
    const updatedUser = await User.findOneAndUpdate({ _id: userId }, patch);
    return updatedUser;
  }

  static async getUser(userId) {
    const user = await User.find({ _id: userId });
    return user;
  }

  static async adminMiddleware(req, res, next) {
    const { userId } = req;
    const { email } = await User.findOne({ _id: userId });
    if (email.indexOf('@mckernan.in') !== -1) {
      return next();
    }
    return res.status(403).send({ message: 'User not authorized for admin access' });
  }
}

module.exports = AuthController;
