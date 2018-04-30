const CRUDController = require('controllers/CRUDController');
const AuthController = require('controllers/AuthController');
const createError = require('utils/error');
const { templateSender } = require('utils/email');
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
        const user = await AuthController.updateUser(userId, {
          unit: unit._id,
        });
        templateSender(user.email, 'unit/electionImport', {
          fname: user.fname,
          number: unit.number,
          unitId: unit._id,
        });
      }
      return unit;
    } catch (e) {
      throw createError('Error creating unit.', 500);
    }
  }
}

module.exports = UnitController;
