var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = process.env.npm_package_config_postgresConnectionString;
var db = pgp(connectionString);

module.exports = db;
