const { format } = require('date-fns');
const unitModel = require('models/unit');
const userModel = require('models/user');
const createError = require('helpers/error');
const Notify = require('helpers/notify');
const CRUDController = require('controllers/CRUDController');
const ElectionModel = require('models/election');

class ElectionController extends CRUDController {
  constructor() {
    super(ElectionModel);
  }

  static async unitElectionNotification(params) {
    const {
      fname, number, requestedDates, email,
    } = params;
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
  }

  static async chapterElectionNotification(params) {
    const {
      number, requestedDates, electionId, chapter,
    } = params;
    const users = await userModel.find({ chapter, capability: 'chapter' });
    const message = `Troop ${number} has requested an election on one of these dates:<br /><br />
    Date 1: ${format(requestedDates[0], 'MM/DD/YYYY')}<br />
    Date 2: ${format(requestedDates[1], 'MM/DD/YYYY')}<br />
    Date 3: ${format(requestedDates[2], 'MM/DD/YYYY')}<br />
    <a href="https://elections.tahosa.co/elections/${electionId}">Click here</a> to schedule this election, which will notify the unit. <br />
    <em>If you need any technical support, or something here seems wrong, please contact Kevin McKernan.</em>`;
    users.map(user =>
      new Notify(user.email).sendEmail(
        `Tahosa Elections | Election Request from Troop ${number}`,
        message,
      ));
  }

  async create(toCreate) {
    try {
      const election = new this.Model(toCreate);
      const { requestedDates, unitId, _id: electionId } = election;
      const { number, unitLeader: { fname, email }, chapter } = await unitModel.findById(unitId);
      const dbItem = await election.save();
      await ElectionController.unitElectionNotification({
        fname,
        number,
        requestedDates,
        email,
      });
      await ElectionController.chapterElectionNotification({
        number,
        requestedDates,
        electionId,
        chapter,
      });
      return dbItem;
    } catch (error) {
      throw createError(error.message, 400);
    }
  }
}

module.exports = ElectionController;
