/** Packages **/
var express = require('express');
var http = require('http');
var connect = require('connect');
var path = require('path');
var fs = require('fs')
var YQL = require("yql");
var mongoose = require('mongoose');
var Schema = mongoose.Schema

/** Server and DB Init **/
var app = express();
var server = http.createServer(app);
mongoose.connect('mongodb://localhost/huebrand');

var dbcon = mongoose.connection;
dbcon.on('error', console.error.bind(console, 'connection error:'));
dbcon.once('open', function callback () {
  console.log("Connected!");
});

var serverPort = 8003;

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
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


/***************
	Routes
****************/
app.get('/', function(req,res){

	res.render('index');

});

app.post('/query',function(req,res){

	var qType = req.body.query_type,
		qText = req.body.query_text;

	//TODO!!! insert query functions here - modules?	

	console.log("Query type is " + qType);
	console.log("Query text is " + qText);

	res.render('query',{
		query_type: qType,
		result_object: "RESULTS!!!"
	})

})



server.listen(serverPort, function(req, res) {
	console.log('listening on port ' + serverPort);
});
