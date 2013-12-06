/** Packages **/
var express = require('express');
var http = require('http');
var connect = require('connect');
var path = require('path');
var fs = require('fs')
var YQL = require("yql");
var mongoose = require('mongoose');
var Schema = mongoose.Schema

/** Modules **/
	var brand = require('./lib/brandapp.js');
	var color = require('./lib/color.js');
	var industry = require('./lib/industry.js');


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

//render html files instead of ejs files.
app.engine('html', require('ejs').renderFile);

/** App & Express Configuration **/ 
app.configure(function(){
  app.set('port', serverPort);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.set('view options', {layout: false});
  app.use(connect.cookieParser('kevin2016551789'));
  app.use(connect.session({
    secret: 'sessionKey2016551789',
    cookie: {maxAge : 7200000} // Expiers in 2 hours
  }));
  app.use(express.bodyParser());
  app.use(express.favicon()); 
  app.use(express.methodOverride());

	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));

	app.use(function(err, req, res, next){
  		console.error(err.stack);
  		res.send(500, 'Something broke!');
	});
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


/***************
	Routes
****************/
app.get('/', function(req,res){

	color.Color.find({}, function(err, c){
			
			if(err){
				console.log('color loading found! ' + err);
				res.render('index',{messsage: "Error on load"})
			}
			else{
				res.render('index',{
					colors: c
				});
		}
	})

});

app.get('/logoShuffle', function(req, res){

	brand.find({brandName: /Apple/i , location : {country: 'USA'}},function(err, obj){
		if(err) console.log("There was an error"+err);
		else{
			console.log(obj);
		}
	})


});

app.get('/color/:query',function(req,res){

	if(!req.params.query){
		console.log("error! on /color/query ");
		res.render('error',{})
	}
	else{

		color.Color.find({ colorName: req.params.query }, function(err, c){
			console.log("returning from find function");
			if(err){
				console.log('color query not found! ' + err);
				res.render('index',{messsage: "Color query for " + req.params.query + " not found!"})
			}
			else{
				console.log("found results for query! : " + JSON.stringify(c));

				res.render('color',{
					result : c,
					queryName : req.params.query
				});
			}
		})
	
	}// \else
})// \/color/:query

app.get('/brand/:query',function(req,res){

	//TODO function for querying db based on brand selected

	res.render('brand', {
		colorsUsed: {},
		logoBio: {},
		industry: {},
		industryLogos: {},
		industryColors: {},
		similarLogos: {},
		companyLocaton: {},
		industryLocation: {},
		brandAttributes: {
			name:{},
			rgbValue:{}
		}


	});

});

app.get('/attributes/:query*',function(req,res){

	//TODO function for querying db based on attributes selected
	//Note there may be potential for multiple attributes to be selected.

	res.render('attribute', {
		attributeName: {},
		associatedColors: {
			colors: {},
			combinations:{}
		},
		logoCloud: {},
		topIndustries: {},

	});

});

app.get('/industry/:query',function(req,res){

	res.render('industry',{
		topColors : {},
		colorPallette: {},
		logoCloud: {},
		colorRatio: {},
		colorMap: {},
		topAttributes: {}
	})

});


server.listen(serverPort, function(req, res) {
	console.log('listening on port ' + serverPort);
});