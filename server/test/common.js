// Import the dependencies for testing
const app = require('../server');
const db = require('../db/db');
const logger = require('../util/logger');
logger.winston.level = "info";

const chai = require('chai');
const chaiHttp = require('chai-http');

// Configure chai
chai.use(chaiHttp);
chai.should();

module.exports = {
    chai,
    app,
    db
}