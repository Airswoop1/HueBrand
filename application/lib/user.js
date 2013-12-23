var mongoose = require('mongoose'),
	color = require('./color.js'),
  util = require('util');

exports.userModel = mongoose.model('User', new mongoose.Schema({
	
	"username" : String,
	"email": String,
	"password" : String,
	"created" : Date,
	
}));

var users = [
        {
            email: "angel@xxxx.xx",
            username: "angel",
            password: "angel123",
            created: Date.now()
        },
        {
            email: "Airswoop1@gmail.com",
            username: "airswoop1",
            password: "112988",
            created: Date.now()
        }
        ]
for(var i=0; i<users.length;i++){
  exports.userModel.create(users[i], function(error, result){
    if(error){
      console.log("error in loading users to db " + util.inspect(error))
    }
    else{
      console.log("Loaded users into db : " + result);
    }
  })
}
exports.index = function(req,res){
	
	color.Color.find({}, function(err, c){
			if(err){
				console.log('color loading found! ' + err);
				res.send(500, "Something broke!")
			}
			else{
				res.render('index', {
					colors: c,
          user : req.session.username
				});
		}
	})
}

exports.login = function(req, res){

	if (typeof req.session.username == 'undefined') {
        res.render('login', { 
        	user: req.session.username, 
        	loginErr: null, 
        	username: '' 
        });
    }
    else res.redirect('/');

}

exports.loginSubmit = function(req, res){


	  req.assert('username', "The username can't be empty!").notEmpty();
    req.assert('pwd', "The password can't be empty!").notEmpty().len(6,16);

    var errors = req.validationErrors();

    if (errors) {
        return res.render('login',{ 
            	"user": req.session.username, 
            	"loginErr": errors[0].msg, 
            	"username": req.body.username 
            });
    }

      exports.userModel.findOne({'username':req.body.username, 'password':req.body.pwd}, function(err, result) {
          if (result) {
              req.session.username = result.username;
              
              res.render('home', { 
              	"user": req.session.username,
              	"username" : req.body.username 
              });

          } else {
              res.render('login',{ 
                  "user": req.session.username, 
                  "loginErr": 'Username or password is wrong!', 
                  "username": req.body.username 
                });
          }
      });

}

exports.home = function(req, res){
    if (exports.isLoggedIn(req, res)) {
        return res.render('home',{ 
            "user": req.session.username, 
            "username": req.session.username 
          });
    } else {
        return res.render('login', { 
        	"user": req.session.username, 
        	"loginErr": null, 
        	"username": '' 
        });
    }
};


exports.isLoggedIn = function(req, res) {
    if (typeof req.session.username !== 'undefined') {
        return true;
    }
    return false;
}