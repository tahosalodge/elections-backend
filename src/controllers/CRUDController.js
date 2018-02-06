const createError = require('helpers/error');

class CRUDController {
  constructor(Model) {
    this.Model = Model;
  }

  async get(query = {}, projection = []) {
    try {
      return this.Model.find(query, projection);
    } catch ({ message }) {
      throw createError(message);
    }
  }

  async getById(id) {
    try {
      return this.Model.findById(id);
    } catch ({ message }) {
      throw createError(message);
    }
  }

  async create(item) {
    try {
      const created = new this.Model(item);
      await created.save();
      return created;
    } catch ({ message }) {
      throw createError(message);
    }
  }

  async update(_id, patch) {
    try {
      return this.Model.findOneAndUpdate({ _id }, patch);
    } catch ({ message }) {
      throw createError(message);
    }
  }

  async remove(_id) {
    try {
      return this.Model.remove({ _id });
    } catch ({ message }) {
      throw createError(message);
    }
  }
}

module.exports = CRUDController;
