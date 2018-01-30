const Unit = require('models/unit');
const User = require('models/user');
const axios = require('axios');
const { parseLocation } = require('parse-address');
const Notify = require('helpers/notify');
const createError = require('helpers/error');
const Auth = require('controllers/authController');

class AdminController {
  constructor() {
    this.unit = Unit;
    this.user = User;
  }
  static getElectionValue(unitFields, prefix, value) {
    const key = `_oa_election_${prefix}_${value}`;
    return unitFields[key];
  }

  static async getOldElection(id) {
    const apiUrl = 'https://elections.tahosalodge.org/wp-json/wp/v2/oae_election';
    return axios(`${apiUrl}/${id}`);
  }

  static getChapter(unitFields) {
    const chapterId = AdminController.getElectionValue(unitFields, 'unit', 'chapter');
    const chapters = {
      27: 'white-eagle',
      30: 'medicine-bear',
      29: 'medicine-pipe',
      25: 'running-antelope',
      31: 'kodiak',
      26: 'spirit-eagle',
      28: 'white-buffalo',
    };

    return chapters[chapterId];
  }

  static getAddress(unitFields) {
    const address = {
      address1: '',
      city: '',
      state: '',
      zip: '',
      notes: AdminController.getElectionValue(unitFields, 'unit', 'location_details'),
      original: AdminController.getElectionValue(unitFields, 'unit', 'address_text'),
    };
    const parsedAddress = parseLocation(address.original);
    if (parsedAddress === null) {
      return {};
    }
    if (parsedAddress.number) {
      address.address1 = parsedAddress.number;
    }
    if (parsedAddress.prefix) {
      address.address1 = `${address.address1} ${parsedAddress.prefix}`;
    }
    if (parsedAddress.street) {
      address.address1 = `${address.address1} ${parsedAddress.street}`;
    }
    if (parsedAddress.type) {
      address.address1 = `${address.address1} ${parsedAddress.type}`;
    }
    if (parsedAddress.city) {
      address.city = parsedAddress.city;
    }
    if (parsedAddress.state) {
      address.state = parsedAddress.state;
    }
    if (parsedAddress.zip) {
      address.zip = parsedAddress.zip;
    }
    return address;
  }

  static getActiveMembers(unitFields) {
    const attendance = AdminController.getElectionValue(unitFields, 'unit', 'attendance');
    if (Math.abs(attendance) === 'NaN') {
      return 0;
    }
    return Math.abs(attendance);
  }

  static async createImportUser(unit) {
    const { chapter, unitLeader, number } = unit;
    const { fname, lname, email } = unitLeader;
    const createuserData = {
      fname,
      lname,
      email,
      chapter,
      capability: 'unit',
    };
    const user = await Auth.generateUser(createuserData);
    new Notify(email).sendEmail(
      `Tahosa Lodge Elections - Unit Import Notification for Troop ${number}`,
      `Hey ${fname},<br />
        Thank you for having a unit election in 2017. We have successfully imported your information from Troop ${number} from last year, and you may now log in and request an election for 2018.<br />
        Login at https://elections.tahosa.co with the following credentials:<br /><br />

        User: ${email}<br />
        Password: ${user.plainPass}<br /><br />

        Please verify that your unit information was accurately imported from last year.<br />
        If you are no longer involved with this unit, please reply so we can connect with the right person.<br />
        If you have any questions or issues, please contact us at elections@tahosalodge.org.`,
    );

    return user;
  }

  // eslint-disable-next-line
  async importUnit(oldId) {
    // Get data from old election site
    const oldElection = await AdminController.getOldElection(oldId);
    const { data: { cmb2: { unit_fields: unitFields } } } = oldElection;
    const address = parseLocation(AdminController.getElectionValue(unitFields, 'unit', 'address_text'));
    // Parse to modify/remove anything
    const unit = {
      number: AdminController.getElectionValue(unitFields, 'unit', 'number'),
      chapter: AdminController.getChapter(unitFields),
      activeMembers: AdminController.getActiveMembers(unitFields),
      address,
      meetingLocation: AdminController.getAddress(unitFields),
      meetingTime: AdminController.getElectionValue(unitFields, 'unit', 'meeting_time'),
      announce: AdminController.getElectionValue(unitFields, 'unit', 'callout_timing'),
      unitLeader: {
        fname: AdminController.getElectionValue(unitFields, 'leader', 'fname'),
        lname: AdminController.getElectionValue(unitFields, 'leader', 'lname'),
        phone: AdminController.getElectionValue(unitFields, 'leader', 'phone'),
        email: AdminController.getElectionValue(unitFields, 'leader', 'email'),
        involvement: AdminController.getElectionValue(unitFields, 'leader', 'involvement'),
      },
      adultRepresentative: {
        fname: AdminController.getElectionValue(unitFields, 'unit_adviser', 'fname'),
        lname: AdminController.getElectionValue(unitFields, 'unit_adviser', 'lname'),
        phone: AdminController.getElectionValue(unitFields, 'unit_adviser', 'phone'),
        email: AdminController.getElectionValue(unitFields, 'unit_adviser', 'email'),
      },
      youthRepresentative: {
        fname: AdminController.getElectionValue(unitFields, 'unit_representative', 'fname'),
        lname: AdminController.getElectionValue(unitFields, 'unit_representative', 'lname'),
        phone: AdminController.getElectionValue(unitFields, 'unit_representative', 'phone'),
        email: AdminController.getElectionValue(unitFields, 'unit_representative', 'email'),
      },
    };
    const existingUser = await User.findOne({ email: unit.unitLeader.email });
    const existingUnit = await Unit.findOne({ number: unit.number });
    if (existingUser !== null || existingUnit !== null) {
      throw new Error('User or unit already exists');
    }
    const newUnit = await Unit.create(unit);
    const { _id: userId } = await AdminController.createImportUser(unit);
    unit.users = [userId];
    await User.findOneAndUpdate({ _id: userId }, { unit: newUnit._id });
    return unit;
  }

  async linkUsersToUnits(dryRun) {
    const params = {
      capability: 'unit',
      unit: { $exists: false },
    };
    try {
      // find users without a unit
      const users = await this.user.find(params);
      // loop through users, and see if a unit exists
      const updatedUsers = users.reduce(async (map, user) => {
        const unitParams = { users: String(user._id) };
        const unit = await this.unit.findOne(unitParams);
        if (!unit) {
          return map;
        }
        if (dryRun) {
          return `Update to be made: { _id: ${user._id} } { unit: ${unit._id} }`;
        }
        return this.user.findOneAndUpdate({ _id: user._id }, { unit: unit._id });
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
      fname, email, plainPass, capability, chapter,
    } = user;
    new Notify(email).sendEmail(
      'Tahosa Lodge Elections - Account Created',
      `Hey ${fname},<br />
        An account has been created for you, login at https://elections.tahosa.co/login with the following credentials:<br /><br />

        User: ${email}<br />
        Password: ${plainPass}<br />
        Access Level: ${capability}<br />
        Chapter: ${chapter}<br /><br />

        If you have any questions or issues, please contact us at elections@tahosalodge.org.`,
    );
    return user;
  }
}

module.exports = AdminController;
