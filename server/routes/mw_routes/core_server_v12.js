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
                    console.log(error);
                    CoreServerV12.sendHTTPResponse(500, res, '{"error" : "A problem has occurred"}');
                    return;
                }
                if(response.status !== 200 && typeof response.status !== 'undefined') {
                    CoreServerV12.sendHTTPResponse(response.statusCode, res, body);
                } else {
                    // If the status is 200, only display the text for the moment
                    // TODO Display images
                    response = "";

                    body.forEach(function(element) {
                        response += element.text + " \r\n";
                        console.log("Réponse : ", response);
                        if (element.hasOwnProperty('buttons')) {
                            console.log("Has property : ", element);
                            element.buttons.forEach(function(button) {
                                console.log("Button : ", button);
                                response += "- " + button.title + "\r\n"
                            })
                        }
                    });

                    CoreServerV12.sendHTTPResponse(200, res, response);
                }
            });
        } catch (err) {
            console.log(err);
            CoreServerV12.sendHTTPResponse(500, res, '{"error" : "A problem has occurred"}');
        }
    }

    //only for Error cases.
    static sendHTTPResponse(http_code, res, body) {
        if (body !== null && body !== "") {
            res.send(body);
        }
    }
}

module.exports = CoreServerV12;