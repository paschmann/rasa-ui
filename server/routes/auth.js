var jwt = require('jsonwebtoken');

var  algorithm = 'aes-256-ctr';

function authenticateUser(req, res, next) {
  //authenticate user
  console.log("Authenticate User");
  if(req.body.username =='admin' && req.body.password=='admin'){
    //create token and send it back
    var tokenData = {username:'admin',name: 'Portal Administrator'};
    // if user is found and password is right
    // create a token
    var token = jwt.sign(tokenData, process.env.npm_package_config_jwtsecret);
    // return the information including token as JSON
    res.json({username: 'admin',token: token});
  }else{
    console.log("Information didnt match or not provided.")
    return res.status(401).send({
        success: false,
        message: 'Username and password didnt match.'
    });
  }
}

module.exports = {
  authenticateUser: authenticateUser
};
