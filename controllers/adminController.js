const Unit = require('../models/unit');
const axios = require('axios');
const { parseLocation } = require('parse-address');

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

  static async importUnit(oldId) {
    try {
      // Get data from old election site
      const { data: { cmb2: { unit_fields: unitFields } } } = await this.getOldElection(oldId);
      const address = parseLocation(this.getElectionValue(unitFields, 'unit', 'address_text'));
      const { city, state, zip } = address;
      // Parse to modify/remove anything
      const unit = {
        number: this.getElectionValue(unitFields, 'unit', 'number'),
        chapter: this.getChapter(unitFields),
        activeMembers: this.getElectionValue(unitFields, 'unit', 'attendance'),
        address,
        meetingLocation: {
          address1: `${address.number} ${address.prefix} ${address.street}`,
          address2: '',
          city,
          state,
          zip,
          notes: this.getElectionValue(unitFields, 'unit', 'location_details'),
          oldAddress: this.getElectionValue(unitFields, 'unit', 'address_text'),
        },
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
      const newUnit = await Unit.create(unit);
      return newUnit;
    } catch (e) {
      return e;
    }
  }
}

module.exports = AdminController;
