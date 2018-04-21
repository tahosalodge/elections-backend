const json2csv = require('json2csv').parse;
const CRUDController = require('controllers/CRUDController');
const AuthController = require('controllers/AuthController');
const UnitController = require('controllers/UnitController');
const ElectionController = require('controllers/ElectionController');
const createError = require('helpers/error');
const CandidateModel = require('models/candidate');
const { format } = require('date-fns');
const { chapters } = require('constants/values');

class CandidateController extends CRUDController {
  constructor() {
    super(CandidateModel);
    this.AuthController = new AuthController();
    this.UnitController = new UnitController();
    this.ElectionController = new ElectionController();
  }

  async generateCSV(newOnly) {
    const params = {
      status: 'Elected',
    };
    params.exported = newOnly ? { $exists: false } : null;
    const candidates = await this.Model.find(params).lean();
    const units = await this.UnitController.get();
    const elections = await this.ElectionController.get();
    if (candidates.length === 0) {
      throw createError('No candidates to export.', 400);
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
        value: candidate => {
          const { dob } = candidate;
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
        value: 'parentPhone',
      },
      {
        label: 'Home Email Address',
        value: 'parentEmail',
      },
      {
        label: 'Mobile Phone Number',
        value: 'youthPhone',
      },
      {
        label: 'School Email Address',
        value: 'youthEmail',
      },
      {
        label: 'Chapter',
        value: candidate => {
          const { chapter } = candidate;
          const selectedChapter = chapters.find(c => c.value === chapter);
          return selectedChapter.chapter;
        },
      },
      {
        label: 'Unit Number',
        value: candidate => {
          const { unitId } = candidate;
          const { number } = units.find(u => u.id === unitId);
          return number;
        },
      },
      {
        label: 'Election Date',
        value: candidate => {
          const { electionId } = candidate;
          const { date } = elections.find(e => e.id === electionId);
          return format(date, 'MM/DD/YYYY');
        },
      },
    ];
    const csv = json2csv(candidates, { fields });
    if (newOnly) {
      candidates.forEach(({ _id }) => {
        this.update(_id, { exported: new Date() });
      });
    }
    return csv;
  }
}

module.exports = CandidateController;
