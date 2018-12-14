let request = require('request');
let CoreServer = require('./core_server');

class CoreServerV12 extends CoreServer {
    constructor() {
        super()
    }

    parseRequest(req, res, next, agentObj) {
        // Allow to add a project name and a conversation id in your rasa core url
        let path_core = global.rasacorerequestpath.replace('{id}', req.jwt.username).replace('{project}', req.body.project);
        let core_url = global.rasacoreendpoint + path_core;
        if (global.coresecuritytoken !== '') {
            core_url = core_url + "?token=" + global.coresecuritytoken;
        }
        try {
            request({
                headers: {
                    "Authorization": "Bearer " + global.corejwttoken
                },
                method: "POST",
                uri: core_url,
                body: {"query": req.body.q},
                json: true
            }, function (error, response, body) {
                if (error) {
                    CoreServerV12.sendHTTPResponse(500, res, '{"error" : "Exception caught !!"}');
                    return;
                }
                CoreServerV12.sendHTTPResponse(200, res, body[0]);
            });
        } catch (err) {
            console.log(err);
            CoreServerV12.sendHTTPResponse(500, res, '{"error" : "Exception caught !!"}');
        }
    }

    //only for Error cases.
    static sendHTTPResponse(http_code, res, body) {
        if (body !== null && body !== "") {
            res.send(body.text);
        }
    }
}

module.exports = CoreServerV12;