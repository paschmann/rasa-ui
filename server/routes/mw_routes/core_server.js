let request = require('request');

class CoreServer {
    constructor() {
        if (new.target === CoreServer) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }
    }

    restartRasaCoreConversation(req, res) {
        throw new TypeError("Need to be override");
    }

    //only for Error cases.
    static sendHTTPResponse(http_code, res, body) {
        res.writeHead(http_code, {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        });
        if (body!=null && body !== "") {
            res.write(body);
        }
        res.end();
    }

    parseRequest(req, res, next, agentObj) {
        throw new TypeError("Need to be override");
    }
}

module.exports = CoreServer;