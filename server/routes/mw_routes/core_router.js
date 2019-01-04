let request = require('request');

//only for Error cases.
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
            uri: global.rasacoreendpoint + "/conversations/" + req.jwt.username + "/continue",
            body: JSON.stringify({"events": [{"event": "restart"}]})
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
    restartRasaCoreConversation: restartRasaCoreConversation
};