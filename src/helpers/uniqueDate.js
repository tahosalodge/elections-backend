const { parse } = require('date-fns');
const createError = require('helpers/error');

function uniqueElectionDate(dates) {
  if (typeof dates === 'undefined') {
    throw createError('No dates provided.', 400);
  }
  if (dates.length < 3) {
    throw createError('You must provide 3 unique dates.', 400);
  }
  function isDateInArray(needle, haystack) {
    for (let i = 0; i < haystack.length; i += 1) {
      if (parse(needle).getTime() === parse(haystack[i]).getTime()) {
        return true;
      }
    }
    return false;
  }

  const uniqueDates = [];
  for (let i = 0; i < dates.length; i += 1) {
    if (!isDateInArray(dates[i], uniqueDates)) {
      uniqueDates.push(dates[i]);
    }
  }

  if (dates.length !== uniqueDates.length) {
    throw createError('You may not select the same date more than once.', 400);
  }
  return true;
}

module.exports = uniqueElectionDate;
