let request = require('request');

function sendHTTPResponse(http_code, res, body) {
    res.writeHead(http_code, {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    });
    if (body != null && body !== "") {
        res.write(body);
    }
    res.end();
}

function restartRasaCoreConversation(req, res) {
    console.log("Rasa Core Restart Request -> " + global.rasacoreendpoint);
    try {
        request({
            method: "POST",
            uri: global.rasacoreendpoint + "/conversations/" + req.jwt.username + "/tracker/events",
            body: JSON.stringify({
                "event": "restart"
            })
        }, function (error, response, body) {
            if (error) {
                console.log(error);
                sendHTTPResponse(500, res, '{"error" : "Exception caught !!"}');
                return;
            }
            console.log("Restart Response" + JSON.stringify(body));
            sendHTTPResponse(200, res, body);
        });
    } catch (err) {
        console.log(err);
        sendHTTPResponse(500, res, '{"error" : "Exception caught !!"}');
    }
}
// Usage is only from rasa-ui.
//Expects Rasa core to be started with REST channel and enable_api argument.
function parseRequest(req, res, next, agentObj) {
    let core_url = global.rasacoreendpoint + global.rasacorerequestpath;
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
            body: {
                "sender":req.jwt.username,"message": req.body.q
            },
            json: true
        }, function (error, response, body) {
            if (error) {
                console.log(error);
                sendHTTPResponse(500, res, '{"error" : "A problem has occurred"}');
                return;
            }
            if (response.status !== 200 && typeof response.status !== 'undefined') {
                sendHTTPResponse(response.statusCode, res, body);
            } else {
                // If the status is 200, only display the text for the moment
                // TODO Display images
                var core_responses=[];
                response = "";
                body.forEach(function (element) {
                    response += element.text + " \r\n";
                    console.log("Response : ", response);
                    if (element.hasOwnProperty('buttons')) {
                        console.log("Has property : ", element);
                        element.buttons.forEach(function (button) {
                            console.log("Button : ", button);
                            response += "- " + button.title + "\r\n"
                        })
                    }
                    core_responses.push({"response_text":response});
                });
                sendHTTPResponse(200, res, JSON.stringify(core_responses));
            }
        });
    } catch (err) {
        console.log(err);
        sendHTTPResponse(500, res, '{"error" : "A problem has occurred"}');
    }
}

function getRasaCoreVersion() {
    console.log("Rasa Core Version Request -> " + global.rasacoreendpoint + "/version");
    return new Promise(function (resolve, reject) {
        request(global.rasacoreendpoint + '/version', function (error, res, body) {
            if (!error && res.statusCode === 200) {
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
}

module.exports = {
    getRasaCoreVersion: getRasaCoreVersion,
    parseRequest: parseRequest,
    restartRasaCoreConversation: restartRasaCoreConversation
};