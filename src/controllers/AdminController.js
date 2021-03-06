const {
  parseLocation
} = require('parse-address');

const Unit = require('models/unit');
const User = require('models/user');
const Election = require('models/election');
const Candidate = require('models/candidate');
const CRUD = require('controllers/CRUDController');
const Auth = require('controllers/AuthController');
const csv = require('neat-csv');
const {
  templateSender
} = require('utils/email');
const createError = require('utils/error');
const {
  getActiveMembers,
  getAddress,
  getChapter,
  getOldElection,
  getElectionValue,
} = require('utils/import');

class AdminController {
  constructor() {
    this.unit = Unit;
    this.user = User;
    this.election = Election;
    this.candidate = Candidate;
    this.candidateController = new CRUD(Candidate);
  }

  static async createImportUser(unit) {
    const {
      chapter,
      unitLeader,
      number
    } = unit;
    const {
      fname,
      lname,
      email
    } = unitLeader;
    const userData = {
      fname,
      lname,
      email,
      chapter,
      capability: 'unit',
    };
    const user = await Auth.generateUser(userData);
    templateSender(email, 'unit/electionImport', {
      ...userData,
      number,
      password: user.plainPass,
    });
    return user;
  }

  // eslint-disable-next-line
  async importUnit(oldId) {
    // Get data from old election site
    const oldElection = await getOldElection(oldId);
    const {
      data: {
        cmb2: {
          unit_fields: unitFields
        }
      }
    } = oldElection;
    const address = parseLocation(
      getElectionValue(unitFields, 'unit', 'address_text')
    );
    // Parse to modify/remove anything
    const unit = {
      number: getElectionValue(unitFields, 'unit', 'number'),
      chapter: getChapter(unitFields),
      activeMembers: getActiveMembers(unitFields) || 0,
      address,
      meetingLocation: getAddress(unitFields),
      meetingTime: getElectionValue(unitFields, 'unit', 'meeting_time'),
      announce: getElectionValue(unitFields, 'unit', 'callout_timing'),
      unitLeader: {
        fname: getElectionValue(unitFields, 'leader', 'fname'),
        lname: getElectionValue(unitFields, 'leader', 'lname'),
        phone: getElectionValue(unitFields, 'leader', 'phone'),
        email: getElectionValue(unitFields, 'leader', 'email'),
        involvement: getElectionValue(unitFields, 'leader', 'involvement'),
      },
      adultRepresentative: {
        fname: getElectionValue(unitFields, 'unit_adviser', 'fname'),
        lname: getElectionValue(unitFields, 'unit_adviser', 'lname'),
        phone: getElectionValue(unitFields, 'unit_adviser', 'phone'),
        email: getElectionValue(unitFields, 'unit_adviser', 'email'),
      },
      youthRepresentative: {
        fname: getElectionValue(unitFields, 'unit_representative', 'fname'),
        lname: getElectionValue(unitFields, 'unit_representative', 'lname'),
        phone: getElectionValue(unitFields, 'unit_representative', 'phone'),
        email: getElectionValue(unitFields, 'unit_representative', 'email'),
      },
    };
    const existingUser = await User.findOne({
      email: unit.unitLeader.email
    });
    const existingUnit = await Unit.findOne({
      number: unit.number
    });
    if (existingUser !== null) {
      throw new Error(`User ${unit.unitLeader.email} already exists`);
    }
    if (existingUnit !== null) {
      throw new Error(`Unit #${unit.number} already exists.`);
    }
    const newUnit = await Unit.create(unit);
    const {
      _id: userId
    } = await AdminController.createImportUser(unit);
    unit.users = [userId];
    await User.findOneAndUpdate({
      _id: userId
    }, {
      unit: newUnit._id
    });
    return unit;
  }

  async linkUsersToUnits(dryRun) {
    const params = {
      capability: 'unit',
      unit: {
        $exists: false
      },
    };
    try {
      // find users without a unit
      const users = await this.user.find(params);
      // loop through users, and see if a unit exists
      const updatedUsers = users.reduce(async (map, user) => {
        const unitParams = {
          users: String(user._id)
        };
        const unit = await this.unit.findOne(unitParams);
        if (!unit) {
          return map;
        }
        if (dryRun) {
          return `Update to be made: { _id: ${user._id} } { unit: ${
            unit._id
          } }`;
        }
        return this.user.findOneAndUpdate({
          _id: user._id
        }, {
          unit: unit._id
        });
      }, []);
      return updatedUsers;
    } catch (error) {
      throw createError(error.message);
    }
  }

  // eslint-disable-next-line
  async createUser(data) {
    const user = await Auth.generateUser(data);
    const {
      fname,
      email,
      plainPass,
      capability,
      chapter
    } = user;
    templateSender(email, 'createdUser', {
      fname,
      email,
      password: plainPass,
      capability,
      chapter,
    });
    return user;
  }

  async linkElectionToChapter(dryRun) {
    try {
      const elections = await this.election
        .find({
          chapter: {
            $exists: false
          }
        }, [])
        .lean();
      const updatedElections = elections.map(async ({
        _id,
        unitId
      }) => {
        const unit = await this.unit.findById(unitId).lean();
        if (!unit) {
          return `No unit for ${_id}`;
        }
        if (!dryRun) {
          await this.election.findOneAndUpdate({
            _id
          }, {
            chapter: unit.chapter
          });
        }
        return `Update election ${_id} to have chapter ${unit.chapter}.`;
      });
      const results = await Promise.all(updatedElections);
      return results;
    } catch (error) {
      throw createError(error.message);
    }
  }

  async candidateImport(file, electionId) {
    try {
      const status = 'Eligible';
      const parsed = await csv(file.data.toString());
      const {
        unitId
      } = await Election.findOne({
        _id: electionId,
      });
      const {
        chapter
      } = await Unit.findOne({
        _id: unitId,
      });
      const candidates = parsed.filter(row => row.bsaid !== '').map(row => {
        const candidate = {
          address: {},
          electionId,
          chapter,
          status,
          unitId,
          imported: true,
        };
        Object.keys(row).forEach(key => {
          if (key.indexOf('address.') !== -1) {
            const addressKey = key.split('.')[1];
            candidate.address[addressKey] = row[key];
            return;
          }
          if (key === 'youthEmail' && row.youthEmail === row.parentEmail) {
            return;
          }
          if (key === 'youthPhone' && row.youthPhone === row.parentPhone) {
            return;
          }
          if (row[key] === '') {
            return;
          }
          candidate[key] = row[key];
        });
        return candidate;
      });
      try {
        await Candidate.insertMany(candidates);
      } catch (error) {
        throw error;
      }
      return candidates;
    } catch (error) {
      throw createError(error.message, 400);
    }
  }
}

module.exports = AdminController;