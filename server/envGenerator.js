const file = require('fs')
const logger = require('./util/logger');

module.exports = {
    logFileError: function (e) {
        logger.winston.error(e);
    },
    createEnvFile: function (UrlDbAddress) {
        var content = 'POSTGRESURL='+UrlDbAddress;
        file.writeFileSync('.env', content, this.logFileError);
    }
}