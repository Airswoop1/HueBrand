/** Packages **/
var express = require('express');
var http = require('http');
var connect = require('connect');
var path = require('path');
var fs = require('fs');
var YQL = require("yql");
var mongoose = require('mongoose');
var scrap = require('scrap');
var request = require('request');
var cheerio = require('cheerio');


	/** Modules **/
	var brand = require('./lib/brand.js');
	var color = require('./lib/color.js');
	var industry = require('./lib/industry.js');


/** Server and DB Init **/
var app = express();
var server = http.createServer(app);
mongoose.connect('mongodb://localhost/huebrand');

var dbcon = mongoose.connection;
dbcon.on('error', console.error.bind(console, 'connection error:'));
dbcon.once('open', function callback () {
  console.log("Connected to the db on the scraping side!");
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

//seed the db with mock data
brand.seed();
color.seed();
industry.seed();

/** Routers **/
app.get('/', function(req,res){
	res.render('index');
});


/** 
	Needed to choose a different module to use for scraping since YQL abides by the robots.txt file 
	Scrape is used here instead
**/
app.get('/brandsoftheworldScrape',function(req,res){
	var brandList = Array()
	//query the db and pull out only the brandNames
	var result = brand.Brand.find().select('brandName').exec(function(err,obj){

		if(err){
			console.log("There was an error! " + err);
		}
		else{
			console.log("obj : " + JSON.stringify(obj));
			//for each of the brandNames search brandsoftheworld and capture the first 20 logo images
			for(j=0 ; j < obj.length; j++){
				brandList.push(obj[j].brandName);
			}

			logoScrape(brandList, 0)
		}
	});
			
	var logoScrape = function(blist, count){
		if(count < blist.length){

			var urlArray = Array();

			scrap("http://www.brandsoftheworld.com/search/logo?search_api_views_fulltext="+blist[count], function(err, $) {

			  	var logosDivs = $('.logos').children('ul li a img');

			  	for(var i=0; i < logosDivs.length ; i++){
					urlArray.push(logosDivs[i].attribs.src);
			  	}

			  	brand.addPotentialLogos(blist[count], urlArray);

			  	logoScrape(blist,count+1);

			});
		}
	}	
});

app.get('/bloombergCompanyScrape', function(req,res){

	var alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
	var pageNum = 0;
	var index = 0;


	var scrapeBrandNames = function(alphabetArray, ind, pg){

		if(alphabetArray[ind] === 'a'){
		var pgSymbol;
		if(pg===0) pgSymbol = '';
		else pgSymbol = pg + '/';

		request("http://www.bloomberg.com/markets/countmpanies/a-z/a/", function(error, response, body){
			
			if(error){
				console.log("Something went wrong! " + error );
			}

			var arrayOfBrands = Array();

			var brandsnamelist = $('.name')

			console.log("brands name list : "+ brandsnamelist);

			$('.name').each(function(){
				console.log("getting into the each function!");
			  var bName = $(this)[0].children[0].children[0].innerText;
			  var brandStockSym = $(this).next()[0].innerText;
			  var brandCountry = $(this).next().next()[0].innerText;
			  var brandCategory = $(this).next().next().next().next()[0].innerText;
			  var entry = {brandName:bName, industryName: brandCategory, location: {country: brandCountry}, stockSymbol: brandStockSym};
			  console.log("The brand Name is"+ bName);
			  arrayOfBrands.push(entry);
			})

			console.log("array of brands is:  " + arrayOfBrands);
/*
			brand.Brand.create(arrayOfBrands, function(err){
				if(err){
					console.log("Something went wrong!!" + err);
				}
				else{
					var pageCheck = $('.disabled.next_page');
					if(pageCheck.length) scrapeBrandNames(alphabetArray, ind, pg+1);
					else scrapeBrandNames(alphabetArray, ind+1, 0);
				}
			})*/

			
			});
		}
	}
	scrapeBrandNames(alphabet, index, pageNum)

})



/***
	Scrapes each page of www.brandprofiles.com and pulls out each logo for the first five pages
**/
app.get('/brandprofilesScrape', function(req,res){
	var DOWNLOAD_DIR = './files/';
	var logos = undefined;

	function downloadImage(index, page, totalLogos){
		//only called at the end of a page to increment the page count
		if(index === totalLogos && page !== 5){
			//use the YQL module to perform an element query on a given url using CSS selectors
			var yqlquery = new YQL.exec('select * from data.html.cssselect where url="http://www.brandprofiles.com/logos?p=' + page + '" and css=".logo"', function(response){

				logos = response.query.results.results.li;

				totalLogos = logos.length;

				downloadImage(0, page+1, totalLogos);
			});
		}
		else if(index < totalLogos){
			var fileName = logos[index]['div']['a']['content'] + ".jpg";
			var fileURL = logos[index]['a']['img']['src'];

			var file = fs.createWriteStream(DOWNLOAD_DIR + fileName);
			
			//use the url extracted form the page to download the image
			var downloadURL = http.get(fileURL, function(imageData) {
				  
				console.log("Writing file with fileName " + fileName);

				imageData.pipe(file);
				  
				file.on('close', function() {
			    file.close();
			    //call the function again here once the image was downloaded and the file is closed
			    downloadImage(index+1, page, totalLogos);
			  });

			});
		}
	}

	//call function to download all files from page
	downloadImage(0,1,0);

	//currently does nothing
	res.render('index',{});

	});

server.listen(serverPort, function(req, res) {
	console.log('listening on port ' + serverPort);
});
