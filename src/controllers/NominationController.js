const json2csv = require('json2csv').parse;
const { format } = require('date-fns');

const CRUDController = require('controllers/CRUDController');
const UnitController = require('controllers/UnitController');
const ElectionController = require('controllers/ElectionController');
const createError = require('utils/error');
const { templateSender } = require('utils/email');
const NominationModel = require('models/nomination');
const { chapters } = require('constants/values');

class NominationController extends CRUDController {
  constructor() {
    super(NominationModel);
    this.UnitController = new UnitController();
    this.ElectionController = new ElectionController();
  }

  async generateCSV(newOnly) {
    try {
      const params = {
        status: 'Approved',
      };
      params.exported = newOnly ? { $exists: false } : null;
      const nominations = await this.Model.find(params).lean();
      const units = await this.UnitController.get();
      const elections = await this.ElectionController.get();
      if (nominations.length === 0) {
        throw createError('No nominations to export.', 400);
      }
      const fields = [
        {
          label: 'First Name',
          value: 'fname',
        },
        {
          label: 'Last Name',
          value: 'lname',
        },
        {
          label: 'Date Of Birth',
          value: nomination => {
            const { dob } = nomination;
            return format(dob, 'MM/DD/YYYY');
          },
        },
        {
          label: 'BSA ID',
          value: 'bsaid',
        },
        {
          label: 'Home Street 1',
          value: 'address.address1',
        },
        {
          label: 'Home City',
          value: 'address.city',
        },
        {
          label: 'Home State',
          value: 'address.state',
        },
        {
          label: 'Home Zip Code',
          value: 'address.zip',
        },
        {
          label: 'Home Phone Number',
          value: 'phone',
        },
        {
          label: 'Home Email Address',
          value: 'email',
        },
        {
          label: 'Chapter',
          value: nomination => {
            const { chapter } = nomination;
            const selectedChapter = chapters.find(c => c.value === chapter);
            return selectedChapter.chapter;
          },
        },
        {
          label: 'Unit Number',
          value: nomination => {
            const { electionId } = nomination;
            const { unitId } = elections.find(e => e.id === electionId);
            const { number } = units.find(u => u.id === unitId);
            return number;
          },
        },
        {
          label: 'Election Date',
          value: nomination => {
            const { electionId } = nomination;
            const { date } = elections.find(e => e.id === electionId);
            return format(date, 'MM/DD/YYYY');
          },
        },
      ];
      const csv = json2csv(nominations, { fields });
      if (newOnly) {
        nominations.forEach(({ _id }) => {
          this.update(_id, { exported: new Date() });
        });
      }
      return csv;
    } catch ({ message }) {
      throw createError(message);
    }
  }

  async update(_id, patch) {
    try {
      const nomination = await this.Model.findOneAndUpdate({ _id }, patch);
      const { email, status } = nomination;
      if (status === 'Approved') {
        templateSender(email, 'nomination/approved', nomination);
      }
      return nomination;
    } catch ({ message }) {
      throw createError(message);
    }
  }
}

module.exports = NominationController;
