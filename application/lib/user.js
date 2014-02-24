var mongoose = require('mongoose'),
	color = require('./color.js'),
  util = require('util');
var bloom = require('./bloombergCompanies.js');

exports.userModel = mongoose.model('User', new mongoose.Schema({
	
	"username" : String,
	"email": String,
	"password" : String,
	"created" : Date,
	
}));

var emptyPayload = {
    queryType : '',
    topCountries : {},
    colorResult : {},
    topColors : {},
    industryResult:{}
}

exports.signIn = function(req, res){

	if (exports.isLoggedIn(req,res)) {
    res.redirect('/', emptyPayload);
  }
  else{ 
    res.render('signup', emptyPayload);      
  }

}

exports.signInSubmit = function(req, res){


	  req.assert('username', "The username can't be empty!").notEmpty();
    req.assert('pwd', "The password can't be empty!").notEmpty().len(6,16);

    var errors = req.validationErrors();

    if (errors) {
        return res.render('signin',emptyPayload);
    }

      exports.userModel.findOne({'username':req.body.username, 'password':req.body.pwd}, function(err, result) {
          if (result) {
              req.session.username = result.username;
              
              res.render('landing', { 
              	"user": req.session.username,
              	"username" : req.body.username 
              });

          } else {
              res.render('signin',{ 
                  "user": req.session.username, 
                  "loginErr": 'Username or password is wrong!', 
                  "username": req.body.username 
                });
          }
      });

}


exports.profile = function(req,res) {
  if(exports.isLoggedIn(req,res)){
    res.render('profile', emptyPayload);
  }
  else{
    res.render('login', emptyPayload);
  }

}


exports.isLoggedIn = function(req, res) {
    if (typeof req.session.username !== 'undefined') {
        return true;
    }
    return false;
}