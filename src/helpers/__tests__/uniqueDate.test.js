/* eslint-env jest */
const uniqueDate = require('helpers/uniqueDate');

describe('uniqueDate validation', () => {
  it('should throw an error if input is undefined', () => {
    expect(() => uniqueDate()).toThrow('No dates provided.');
  });
  it('should throw an error if any of the dates are the same', () => {
    const dates = [new Date('03/20/2018'), new Date('03/20/2018'), new Date('03/21/2018')];
    expect(() => uniqueDate(dates)).toThrow('You may not select the same date more than once.');
  });
  it('should succeed if passed 3 unique dates', () => {
    const dates = [new Date('03/20/2018'), new Date('03/22/2018'), new Date('03/21/2018')];
    expect(uniqueDate(dates)).toEqual(true);
  });
  it('should throw an error if passed less than 3 dates', () => {
    const dates = [new Date('03/20/2018'), new Date('03/22/2018')];
    expect(() => uniqueDate(dates)).toThrow('You must provide 3 unique dates.');
  });
});
