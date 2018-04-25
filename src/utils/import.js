const axios = require('axios');
const { parseLocation } = require('parse-address');

const getElectionValue = (unitFields, prefix, value) =>
  unitFields[`_oa_election_${prefix}_${value}`];

const getOldElection = electionId =>
  axios(`{process.env.IMPORT_URL}/${electionId}`);

const getChapter = unitFields => {
  const chapterId = getElectionValue(unitFields, 'unit', 'chapter');
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
};

const getAddress = unitFields => {
  const address = {
    address1: '',
    city: '',
    state: '',
    zip: '',
    notes: getElectionValue(unitFields, 'unit', 'location_details'),
    original: getElectionValue(unitFields, 'unit', 'address_text'),
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
};

const getActiveMembers = unitFields => {
  const attendance = getElectionValue(unitFields, 'unit', 'attendance');
  if (Math.abs(attendance) === 'NaN') {
    return 0;
  }
  return Math.abs(attendance);
};

module.exports = {
  getActiveMembers,
  getAddress,
  getChapter,
  getOldElection,
  getElectionValue,
};
