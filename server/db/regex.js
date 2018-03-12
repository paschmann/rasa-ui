const db = require('./db')

function getAllRegex(req, res, next) {
  console.log("regex.getAllRegex");
  db.any('select * from regex')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getSingleRegex(req, res, next) {
  console.log("regex.getSingleRegex");
  var regexID = parseInt(req.params.regex_id);
  db.one('select * from regex where regex_id = $1', regexID)
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function createRegex(req, res, next) {
  console.log("regex.createRegex");
  db.none('insert into regex(regex_name, regex_pattern) values(${regex_name}, ${regex_pattern})', req.body)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Inserted'
        });
    })
    .catch(function (err) {
      console.log(err);
      return next(err);
    });
}

function updateRegex(req, res, next) {
  db.none('update regex set regex_name=$1, regex_pattern=$3 where regex_id=$2',
    [req.body.regex_name, parseInt(req.params.regex_id), req.body.regex_pattern])
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Updated regex'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function removeRegex(req, res, next) {
  var regexID = parseInt(req.params.regex_id);
  db.result('delete from regex where regex_id = $1', regexID)
    .then(function (result) {
      /* jshint ignore:start */
      res.status(200)
        .json({
          status: 'success',
          message: 'Removed ${result.rowCount}'
        });
      /* jshint ignore:end */
    })
    .catch(function (err) {
      return next(err);
    });
}

module.exports = {
  getAllRegex: getAllRegex,
  getSingleRegex: getSingleRegex,
  createRegex: createRegex,
  updateRegex: updateRegex,
  removeRegex: removeRegex
};
