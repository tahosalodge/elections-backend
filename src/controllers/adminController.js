const Unit = require('../models/unit');
const User = require('../models/user');
const generatePassword = require('xkpasswd');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { parseLocation } = require('parse-address');
const Notify = require('../helpers/notify');

class AdminController {
  static getElectionValue(unitFields, prefix, value) {
    const key = `_oa_election_${prefix}_${value}`;
    return unitFields[key];
  }

  static async getOldElection(id) {
    const apiUrl = 'https://elections.tahosalodge.org/wp-json/wp/v2/oae_election';
    return axios(`${apiUrl}/${id}`);
  }

  static getChapter(unitFields) {
    const chapterId = this.getElectionValue(unitFields, 'unit', 'chapter');
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
      notes: this.getElectionValue(unitFields, 'unit', 'location_details'),
      original: this.getElectionValue(unitFields, 'unit', 'address_text'),
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
    const attendance = this.getElectionValue(unitFields, 'unit', 'attendance');
    if (Math.abs(attendance) === 'NaN') {
      return 0;
    }
    return Math.abs(attendance);
  }

  static async createImportUser(unit) {
    const password = generatePassword({ separators: '-' });
    const hashedPassword = bcrypt.hashSync(password, 8);
    const { chapter, unitLeader, number } = unit;
    const { fname, lname, email } = unitLeader;
    const createuserData = {
      fname,
      lname,
      email,
      chapter,
      capability: 'unit',
      password: hashedPassword,
    };
    const user = await User.create(createuserData);
    new Notify(email).sendEmail(
      `Tahosa Lodge Elections - Unit Import Notification for Troop ${number}`,
      `Hey ${fname},<br />
        Thank you for having a unit election in 2017. We have successfully imported your information from Troop ${number} from last year, and you may now log in and request an election for 2018.<br />
        Login at https://elections.tahosa.co with the following credentials:<br /><br />

        User: ${email}<br />
        Password: ${password}<br /><br />

        Please verify that your unit information was accurately imported from last year.<br />
        If you are no longer involved with this unit, please reply so we can connect with the right person.<br />
        If you have any questions or issues, please contact us at elections@tahosalodge.org.`,
    );

    return user;
  }

  static async importUnit(oldId) {
    // Get data from old election site
    const { data: { cmb2: { unit_fields: unitFields } } } = await this.getOldElection(oldId);
    const address = parseLocation(this.getElectionValue(unitFields, 'unit', 'address_text'));
    // Parse to modify/remove anything
    const unit = {
      number: this.getElectionValue(unitFields, 'unit', 'number'),
      chapter: this.getChapter(unitFields),
      activeMembers: this.getActiveMembers(unitFields),
      address,
      meetingLocation: this.getAddress(unitFields),
      announce: this.getElectionValue(unitFields, 'unit', 'callout_timing'),
      unitLeader: {
        fname: this.getElectionValue(unitFields, 'leader', 'fname'),
        lname: this.getElectionValue(unitFields, 'leader', 'lname'),
        phone: this.getElectionValue(unitFields, 'leader', 'phone'),
        email: this.getElectionValue(unitFields, 'leader', 'email'),
        involvement: this.getElectionValue(unitFields, 'leader', 'involvement'),
      },
      adultRepresentative: {
        fname: this.getElectionValue(unitFields, 'unit_adviser', 'fname'),
        lname: this.getElectionValue(unitFields, 'unit_adviser', 'lname'),
        phone: this.getElectionValue(unitFields, 'unit_adviser', 'phone'),
        email: this.getElectionValue(unitFields, 'unit_adviser', 'email'),
      },
      youthRepresentative: {
        fname: this.getElectionValue(unitFields, 'unit_representative', 'fname'),
        lname: this.getElectionValue(unitFields, 'unit_representative', 'lname'),
        phone: this.getElectionValue(unitFields, 'unit_representative', 'phone'),
        email: this.getElectionValue(unitFields, 'unit_representative', 'email'),
      },
    };
    const existingUser = await User.findOne({ email: unit.unitLeader.email });
    const existingUnit = await Unit.findOne({ number: unit.number });
    if (existingUser !== null || existingUnit !== null) {
      throw new Error('User or unit already exists');
    }
    const newUnit = await Unit.create(unit);
    const { _id: userId } = await this.createImportUser(unit);
    unit.users = [userId];
    await User.findOneAndUpdate({ _id: userId }, { unit: newUnit._id });
    return unit;
  }
}

module.exports = AdminController;
