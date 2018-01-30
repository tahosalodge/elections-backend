const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generatePassword = require('xkpasswd');
const Notify = require('helpers/notify');
const createError = require('helpers/error');
const User = require('models/user');

class AuthController {
  constructor() {
    this.user = User;
  }

  static sendUserInfo(user) {
    const {
      fname, lname, capability, email, chapter,
    } = user;
    const token = AuthController.createToken(user);
    const userInfo = {
      token,
      fname,
      lname,
      capability,
      email,
      chapter,
    };
    return userInfo;
  }

  static createToken(user) {
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
    const user = await this.user.findOne({ email });
    if (!user) {
      throw createError('No user found.', 404);
    }
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      throw createError('Password Incorrect', 401);
    }
    return AuthController.sendUserInfo(user);
  }

  async register(userInfo) {
    try {
      const { email, fname, password } = userInfo;
      const toCreate = {
        ...userInfo,
        password: bcrypt.hashSync(password, 8),
      };
      const user = await this.user.create(toCreate);
      await new Notify(email).sendEmail(
        'Thanks for registering with Tahosa Lodge Elections',
        `Hey ${fname}, thanks for registering with Tahosa Lodge Elections. If you have any questions or issues, please contact us at elections@tahosalodge.org.`,
      );
      return AuthController.sendUserInfo(user);
    } catch ({ message }) {
      throw createError(400, message);
    }
  }

  async me(userId) {
    const user = await this.user.findById(userId, { password: 0 });
    if (!user) {
      throw createError('No user found.', 404);
    }
    return AuthController.sendUserInfo(user);
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
    return User.findById(userId);
  }

  static async adminMiddleware(req, res, next) {
    const { userId } = req;
    const user = await User.findById(userId);
    if (!user || user.email.indexOf('@mckernan.in') === -1) {
      throw createError(400, 'User not authorized for admin access');
    }
    return next();
  }

  static async generateUser(data) {
    const password = generatePassword({ separators: '-' });
    const hashedPassword = bcrypt.hashSync(password, 8);
    const user = await User.create({ ...data, password: hashedPassword });
    user.plainPass = password;
    return user;
  }
}

module.exports = AuthController;
