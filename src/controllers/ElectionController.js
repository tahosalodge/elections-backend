const { format } = require('date-fns');
const unitModel = require('models/unit');
const userModel = require('models/user');
const createError = require('utils/error');
const { templateSender, emailToUsers } = require('utils/email');
const CRUDController = require('controllers/CRUDController');
const ElectionModel = require('models/election');
const CandidateModel = require('models/candidate');
const uniqueElectionDate = require('utils/uniqueDate');

class ElectionController extends CRUDController {
  constructor() {
    super(ElectionModel);
  }

  static electionCreateNotificationUnit(params) {
    const { requestedDates, email } = params;
    const dates = requestedDates.map(date => format(date), 'MM/DD?YYYY');
    templateSender(email, 'unit/requestElection', {
      ...params,
      dates,
    });
  }

  static async electionCreateNotificationChapter(params) {
    const { requestedDates, chapter } = params;
    const dates = requestedDates.map(date => format(date), 'MM/DD?YYYY');
    const users = await userModel.find({ chapter, capability: 'chapter' });
    emailToUsers(users, 'chapter/requestElection', {
      ...params,
      dates,
    });
  }

  async create(toCreate) {
    const electionParams = {
      ...toCreate,
      status: 'Requested',
    };
    try {
      uniqueElectionDate(electionParams.requestedDates);
      const election = new this.Model(electionParams);
      const { requestedDates, unitId, _id: electionId, season } = election;
      const existing = await this.get({ season, unitId });
      if (existing.length > 0) {
        throw createError('Election already exists for this unit.', 400);
      }
      const {
        number,
        unitLeader: { fname, email },
        chapter,
      } = await unitModel.findById(unitId);
      const dbItem = await election.save();
      ElectionController.electionCreateNotificationUnit({
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

  static electionUpdateNotificationUnit(params) {
    const { email, date } = params;
    templateSender(email, 'unit/scheduleElection', {
      ...params,
      date: format(date, 'MM/DD/YYYY'),
    });
  }

  static async electionUpdateNotificationChapter(params) {
    const { chapter, date } = params;
    const users = await userModel.find({ chapter, capability: 'chapter' });
    const formattedDate = format(date, 'MM/DD/YYYY');
    emailToUsers(users, 'chapter/scheduleElection', {
      ...params,
      date: formattedDate,
    });
  }

  async update(electionId, patch) {
    try {
      const election = await this.Model.findOneAndUpdate(
        { _id: electionId },
        patch
      );
      const { date, unitId } = election.toJSON();
      const unit = await unitModel.findById(unitId);
      const {
        number,
        unitLeader: { fname, email },
        chapter,
        meetingTime,
      } = unit.toJSON();
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
    number,
    chapter,
    electionId,
    electedCount,
  }) {
    const users = await userModel.find({ chapter, capability: 'chapter' });
    emailToUsers(users, 'chapter/electionResults', {
      number,
      chapter,
      electionId,
      electedCount,
    });
  }

  async report(_id, patch) {
    try {
      const { candidates: toElect, ...electionPatch } = patch;

      const election = await this.Model.findOneAndUpdate(
        { _id },
        electionPatch
      );

      const unit = await unitModel.findOneAndUpdate(election.unitId);
      const { number, unitLeader: { email }, chapter } = unit;

      let electedCount = 0;
      const candidates = await Promise.all(
        Object.keys(toElect).map(async candidateId => {
          let candidate;
          if (toElect[candidateId]) {
            candidate = await CandidateModel.findOneAndUpdate(
              { _id: candidateId },
              { status: 'Elected' },
              { new: true }
            );
            electedCount += 1;
          } else {
            candidate = await CandidateModel.findOneAndUpdate(
              { _id: candidateId },
              { status: 'Not Elected' },
              { new: true }
            );
          }
          return candidate.toJSON();
        })
      );

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
