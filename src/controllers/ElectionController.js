const { format } = require('date-fns');
const unitModel = require('models/unit');
const createError = require('helpers/error');
const Notify = require('helpers/notify');
const CRUDController = require('controllers/CRUDController');
const ElectionModel = require('models/election');

class ElectionController extends CRUDController {
  constructor() {
    super(ElectionModel);
  }
  async create(toCreate) {
    const election = new this.Model(toCreate);
    const { requestedDates, unit } = election;
    const { number, unitLeader: { fname, email } } = await unitModel.find({ id: unit });
    try {
      const dbItem = await this.Model.save(election);
      const message = `Hi ${fname},<br />
        Please save this email for your records. Thanks for requesting an OA election for ${number}! Here are the dates you requested:<br /><br />

        Date 1: ${format(requestedDates[0], 'MM/DD/YYYY')}<br />
        Date 2: ${format(requestedDates[1], 'MM/DD/YYYY')}<br />
        Date 3: ${format(requestedDates[2], 'MM/DD/YYYY')}<br />
        We’ll notify you automatically when your chapter confirms a date. You can log into your election request using the following credentials at https://elections.tahosa.co/<br /><br />

        You have what you need for now. In case you have questions you can contact elections@tahosalodge.org and we’ll respond as quickly as we can.<br /><br />

        In Scouting,<br /><br />

        Unit Elections Committee<br />
        Tahosa Lodge 383`;
      new Notify(email).sendEmail('Election request confirmation', message);
      return dbItem;
    } catch (error) {
      throw createError(error.message, 400);
    }
  }
}

module.exports = ElectionController;
