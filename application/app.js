/** Packages **/
var express = require('express'),
    http = require('http'),
    connect = require('connect'),
    path = require('path'),
    fs = require('fs'),
    YQL = require('yql'),
    mongoose = require('mongoose'),
    expressValidator = require('express-validator'),
    io = require('socket.io'),
    Schema = mongoose.Schema;

/** Modules **/
/*****************************
	Note:  Unfortunately you cannot access the modules hosted in the
	../../scraping/lib/ folder so we need to replicate them here 
****************************/
	var brand = require('./lib/brandapp.js'),
    	color = require('./lib/color.js'),
    	industry = require('./lib/industry.js'),
    	bloom = require('./lib/bloombergCompanies.js'),
      attribute = require('./lib/attribute.js'),
      user = require('./lib/user.js'),
      staticPages = require('./lib/staticPages.js');


/** Server and DB Init **/
var app = express();
var server = http.createServer(app);
mongoose.connect('mongodb://localhost/huebrand');

var dbcon = mongoose.connection;
dbcon.on('error', console.error.bind(console, 'connection error:'));
dbcon.once('open', function callback () {
  console.log("Connected to the db on the application side!");
});

var serverPort = 8002;

/********
Socket.IO init
********/
//io.listen(serverPort);

//render html files instead of ejs files.
app.engine('html', require('ejs').renderFile);


/** App & Express Configuration **/ 
app.configure(function(){
  app.set('port', serverPort);
  app.set('views', __dirname + '/views');

  //app.set('view engine', 'ejs');
  app.set('view engine', 'html');
  app.set('view options', {layout: false});
  
  app.use(express.favicon());
  //app.use(express.logger('dev'));
  
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('kevin2016551789'));
  app.use(express.session());
  app.use(expressValidator());
  app.use(app.router);

	app.use(express.static(__dirname + '/public'));
  app.use(express.errorHandler());
	
  app.use(function(err, req, res, next){
  		console.error(err.stack);
  		res.send(500, 'Something broke!');
	});
});



/***************
	Routes
****************/
app.get('/', staticPages.landing);

app.get('/login', user.signIn);
app.post('/login', user.signInSubmit);
app.get('/profile', user.profile);

//can use update.html popup or something equivalent
app.get('/learnmore', user.signIn);
app.post('/learnmore', user.signInSubmit);

app.get('/about', staticPages.about)
app.get('/contact', staticPages.contact);
app.get('/privacy', staticPages.privacy);
app.get('/terms', staticPages.terms);


app.get('/color/:query', color.queryColor);
app.get('/brand/:query', brand.queryBrand) 
app.get('/attribute/:query', attribute.queryAttribute);
app.get('/industry/:query', industry.queryIndustry);




server.listen(serverPort, function(req, res) {
	console.log('listening on port ' + serverPort);
});
