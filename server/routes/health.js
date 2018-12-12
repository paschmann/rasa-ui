function liveness(req, res, next) {
    res.json({message: "Rasa UI is running"});
}

module.exports = {
    liveness: liveness
}