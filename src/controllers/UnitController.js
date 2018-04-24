const CRUDController = require('controllers/CRUDController');
const AuthController = require('controllers/AuthController');
const createError = require('utils/error');
const Notify = require('utils/notify');
const UnitModel = require('models/unit');

class UnitController extends CRUDController {
  constructor() {
    super(UnitModel);
    this.AuthController = new AuthController();
  }

  async create(toCreate, userCap, userId) {
    const unitParams = {
      ...toCreate,
      users: [userId],
    };
    try {
      const unit = await this.Model.create(unitParams);
      if (userCap === 'unit') {
        const user = await AuthController.updateUser(userId, { unit: unit._id });
        const message = `Hey ${user.fname}, your unit ${
          unit.number
        } has been created. You can access it here: https://elections.tahosa.co/units/${unit._id}.`;
        new Notify(user.email).sendEmail('Tahosa Lodge Elections - Unit Created', message);
      }
      return unit;
    } catch (e) {
      throw createError('Error creating unit.', 500);
    }
  }
}

module.exports = UnitController;
