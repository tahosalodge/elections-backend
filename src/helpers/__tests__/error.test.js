/* eslint-env jest */

const createError = require('helpers/error');

describe('createError', () => {
  it('should return an error object with a message and code', () => {
    const error = new Error('Test error please ignore.');
    error.code = 500;
    expect(createError('Test error please ignore.')).toEqual(error);
  });
  it('should use a custom code if provided', () => {
    const error = new Error('Test error please ignore.');
    error.code = 400;
    expect(createError('Test error please ignore.')).toEqual(error);
  });
});
