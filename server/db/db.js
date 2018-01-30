var promise = require('bluebird');
const config = require("../config");

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = config.postgresConnectionString;
var db = pgp(connectionString);

module.exports = db;
