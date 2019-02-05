const promise = require('bluebird');

const options = {
  // Initialization Options
  promiseLib: promise};

const pgp = require('pg-promise')(options);
const db = pgp(global.postgresserver);

module.exports = db;
