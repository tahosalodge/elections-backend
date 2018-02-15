const { format } = require('date-fns');
const unitModel = require('models/unit');
const userModel = require('models/user');
const createError = require('helpers/error');
const Notify = require('helpers/notify');
const CRUDController = require('controllers/CRUDController');
const ElectionModel = require('models/election');
const CandidateModel = require('models/candidate');

class ElectionController extends CRUDController {
  constructor() {
    super(ElectionModel);
  }

  static async electionCreateNotificationUnit(params) {
    const {
      fname, number, requestedDates, email,
    } = params;
    const message = `Hi ${fname},<br />
      Please save this email for your records. Thanks for requesting an OA election for Troop ${number}! Here are the dates you requested:<br /><br />

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

  static async electionCreateNotificationChapter(params) {
    const {
      number, requestedDates, electionId, chapter,
    } = params;
    const users = await userModel.find({ chapter, capability: 'chapter' });
    const message = `Troop ${number} has requested an election on one of these dates:<br /><br />
    Date 1: ${format(requestedDates[0], 'MM/DD/YYYY')}<br />
    Date 2: ${format(requestedDates[1], 'MM/DD/YYYY')}<br />
    Date 3: ${format(requestedDates[2], 'MM/DD/YYYY')}<br />
    <a href="https://elections.tahosa.co/elections/${electionId}/edit">Click here</a> to schedule this election, which will notify the unit. <br />
    <em>If you need any technical support, or something here seems wrong, please contact Kevin McKernan.</em>`;
    users.map(user =>
      new Notify(user.email).sendEmail(
        `Tahosa Elections | Election Request from Troop ${number}`,
        message,
      ));
  }

  async create(toCreate) {
    const electionParams = {
      ...toCreate,
      status: 'Requested',
    };
    try {
      const election = new this.Model(electionParams);
      const { requestedDates, unitId, _id: electionId } = election;
      const { number, unitLeader: { fname, email }, chapter } = await unitModel.findById(unitId);
      const dbItem = await election.save();
      await ElectionController.electionCreateNotificationUnit({
        fname,
        number,
        requestedDates,
        email,
      });
      await ElectionController.electionCreateNotificationChapter({
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

  static async electionUpdateNotificationUnit(params) {
    const {
      fname, number, email, date, electionId, meetingTime,
    } = params;
    const message = `Hi ${fname},<br />
    Thanks for requesting an OA election for Troop ${number}!<br />
    Your unit election is confirmed for ${format(date, 'MM/DD/YYYY')}.<br />
    The OA chapter election team will arrive 15 minutes before your meeting begins at ${meetingTime}.<br />
    A Scoutmaster or other unit leader will need to confirm the unit’s active attendance (50% required for the election) and eligible candidates on the ballot at that time.
    <br /><br />
    Be sure to log in and add eligible Scouts to your election here: <a href="https://elections.tahosa.co/elections/${electionId}">My Election</a>.<br />
    We’ll remind you about this 14 days, 7 days and 2 days prior to your election.<br />
    Really important -- your unit ballot is LOCKED 24 hours prior to your scheduled election and cannot change.<br />
    For questions about elections procedure or website functions contact elections@tahosalodge.org.<br />

    In Scouting,<br /><br />

    Unit Elections Committee<br />
    Tahosa Lodge 383`;
    new Notify(email).sendEmail('OA Election Scheduling Notification', message);
  }

  static async electionUpdateNotificationChapter(params) {
    const {
      number, electionId, chapter, date,
    } = params;
    const users = await userModel.find({ chapter, capability: 'chapter' });
    const formattedDate = format(date, 'MM/DD/YYYY');
    const message = `An election has been scheduled for Troop ${number} on ${formattedDate}<br /><br />
    <a href="https://elections.tahosa.co/elections/${electionId}">Click here</a> to see the details of this election.<br />
    <em>If you need any technical support, or something here seems wrong, please contact Kevin McKernan.</em>`;
    users.map(user =>
      new Notify(user.email).sendEmail(
        `Tahosa Elections | Election Scheduled for Troop ${number}`,
        message,
      ));
  }

  async update(_id, patch) {
    try {
      const election = await this.Model.findOneAndUpdate({ _id }, patch);
      const { date, unitId, _id: electionId } = election;
      const unit = await unitModel.findOneAndUpdate(unitId);
      const {
        number, unitLeader: { fname, email }, chapter, meetingTime,
      } = unit;
      await ElectionController.electionUpdateNotificationUnit({
        fname,
        number,
        email,
        date,
        electionId,
        meetingTime,
      });
      await ElectionController.electionUpdateNotificationChapter({
        number,
        electionId,
        chapter,
        date,
      });
      return election;
    } catch ({ message }) {
      throw createError(message);
    }
  }

  async electionReportNotification({
    number, chapter, email, electionId, electedCount,
  }) {
    const users = await userModel.find({ chapter, capability: 'chapter' });
    const message = `
    The election results have been entered for Troop ${number}.<br /><br />

    ${electedCount} candidates were elected.<br />

    <a href="https://elections.tahosa.co/elections/${electionId}">Click here</a> to see the details of this election.<br />
    `;
    new Notify(email).sendEmail(`Tahosa Elections | Results Entered for Troop ${number}`, message);
    users.map(({ email: userEmail }) =>
      new Notify(userEmail).sendEmail(
        `Tahosa Elections | Results Entered for Troop ${number}`,
        message,
      ));
  }

  async report(_id, patch) {
    try {
      const { candidates: toElect, ...electionPatch } = patch;

      const election = await this.Model.findOneAndUpdate({ _id }, electionPatch);

      const unit = await unitModel.findOneAndUpdate(election.unitId);
      const { number, unitLeader: { email }, chapter } = unit;

      let electedCount = 0;
      const candidates = await Promise.all(Object.keys(toElect).map(async (candidateId) => {
        let candidate;
        if (toElect[candidateId]) {
          candidate = await CandidateModel.findOneAndUpdate(
            { _id: candidateId },
            { status: 'Elected' },
            { new: true },
          );
          electedCount += 1;
        } else {
          candidate = await CandidateModel.findOneAndUpdate(
            { _id: candidateId },
            { status: 'Not Elected' },
            { new: true },
          );
        }
        return candidate.toJSON();
      }));

      // Send emails
      await this.electionReportNotification({
        number,
        chapter,
        email,
        electedCount,
        electionId: _id,
      });

      return { election: election.toJSON(), candidates };
    } catch (error) {
      throw createError(error.message);
    }
  }
}

module.exports = ElectionController;
