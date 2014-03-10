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
var phantom = require('phantom');
var portscanner = require('portscanner');
var countrynames = require('countrynames');
var util = require('util');


/** Modules **/
var brand = require('./lib/brand.js');
var color = require('./lib/color.js');
var industry = require('./lib/industry.js');
var scrape = require('./lib/scrape.js');
var bloom = require('./lib/bloombergCompanies.js');
var colorExtract = require('./lib/colorExtraction.js');
var imageDownload = require('./lib/imageDownload.js');
var attributes = require('./lib/attributes.js');
var imageConv = require('./lib/imageConversion.js');
var logoselection = require('./lib/logoSelection.js');
var routes = require('./lib/routes.js');

/** Server and DB Init **/
var app = express();
var server = http.createServer(app);
mongoose.connect('mongodb://localhost/huebrand');
var io = require('socket.io').listen(server);
logoselection.setIO(io);

var dbcon = mongoose.connection;
dbcon.on('error', console.error.bind(console, 'connection error:'));
dbcon.once('open', function callback () {
  console.log("Connected to the db on the scraping side!");
});

var serverPort = 8004;

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
//brand.seed();
//color.seed();	
//industry.seed();

/****************************
function: bloom.populate() 
Populates data from /lib/bloombergCompanies.csv into the db
Approximately 21,000 companies exist in the csv file
bloom object is defined in /lib/bloombergCompanies.js
Note *This is separate from the brand object*
*****************************/
//bloom.populate();

/****************************
function: color.populate() 
Populates data from /lib/golden_units.csv into the db
color object is defined in /lib/color.js
*****************************/
//color.populate();


/************************
TODO: Complete function for logopedia scrape
function: logopediaScrape()
Grab all logos and labels from logos.wikia.com/wiki/Logopedia
We will be using this datasource and cross referencing with the 
data on public companies from bloomberg to match current and 
historical logos.
*************************/
//scrape.logopediaScrape();


/************************
function: modifyName()
Modify all entries in the databse that do not have
the displayName key by capitalizing only the first 
letter in each word of the company's shortName. 
*************************/
//bloom.modifyName();


/************************
function: populate()
Takes an updated companies list that has manually
modified company names (displayNames) and urls for 
company logos and allows for downloading the logo
and then saving it back to the database.
*************************/
//imageDownload.populate();

/********************
function: collectLogos()
Uses the logo urls stored in the logopedia collection
(logoURL) to capture the urls for the actual logos on 
the page. It then stores the urls for the logos in the
logosData object along with the date of the logo if
available
*********************/
//scrape.collectLogos();

/********************
Defunct!
function: matchLogoWithCompany() 
Used to cross compare the logopedias companies scraped
from the logos.wikia pages with the blomberg dataset. 
Utilizes a command line interface for those where there
are multiple matches
*********************/
//scrape.matchLogoWithCompany();

/********************
function: refineLogoData()
Iterates through each entry in the logpedias collection
and grabs the category data on each logopedias page. Also
attempts to determine whether a page is a parent, subsidiary,
brand, or logo of a company 
*********************/
//scrape.refineLogoData();

/********************
function: downloadLogopediaImages()
Iterates through each logopedias document and for those that
have a bloomberg match, downloads the logos associated to that
logopedias page and records the fileNames in the bloomberg collection
*********************/
//imageDownload.downloadLogopediaImages();

/********************
function: importAttributeData()
Takes the color_country_attributes.csv file and populates the 
attribute collection with the values
*********************/
//attributes.importAttributeData();

/********************
function: convertSVGs()
converts the svg image files in application/public/logos/svg to
png and saves them in application/public/logos
*********************/
//imageConv.convertSVGs();

/***********
function: updateDownloadedStatus)()
mark all logopedias images that have been downloaded as true
***********/
//scrape.updateDownloadedSatatus();

/***********
function: svg2pngRename()
modify all fileNames that had .svg into .png
***********/
//bloom.svg2pngRename();

/***********
function: importColorsFromCSV()
import color data from scraped logos
***********/
//color.importColorsFromCSV();

/***********
function: modifyIndustryNames()
modify industry names to match the logo names
***********/
//industry.modifyIndustryNamesFromCSV();

/***********
function: importBaseColorFromCSV()
import the shade + colorFamily base colors
************/
//color.importMediumBaseColorFromCSV();
//color.importBaseColorFromCSV();

/***********
function: importBrandManuals()
import brand manuals if they exist
************/
//brand.importBrandManuals();

/***********
function: importAttributesWithoutCountries()
import attributes
************/
//attributes.importAttributesWithoutCountries();

/***********
function: populateIndustryDescriptionData()
import indsutry descriptions
************/
industry.populateIndustryDescriptionData()

/************ 
	Routers 
**************/
app.get('/', function(req,res){
	res.render('index');
});

app.get('/logoSelection',function(req,res){
	res.render('logos');
})

//query DB for all documents in bloomberg that have a logoFileName but do not have associatedColors
app.get('/logoColorExtraction', routes.logoColorExtraction)



/** 
	Route: /brandsoftheworldScrape
	Used to scrape logos from www.brandsoftheworld.com based on a search
	query using the companies in the brands database.
	Note *companies with special characters and spaces not taken into account
		correctly so the data is not completely accurate* 
**/
app.get('/brandsoftheworldScrape', routes.brandsoftheworldScrape);


/*****************************
	Route: /bloombergPhantom
	Used to pull all bloomberg company names, stock symbol, sub-industry
	and country. 
	Note *This is not the same data used in the bloom.populate() function above*
*****************************/
app.get('/bloombergPhantom', routes.bloombergPhantom);

/******************************************
	Route: /bloombergUSMarketCap
	Used to scrape Bloomberg for the market cap based on company ticker ID
	Note  *Issues arose with companies not having a marketCap because they 
	weren't publicly listed yet. Also function was randomly stopping potentially
	due to limits on the bloomberg website based on the same IP address*

*******************************************/
app.get('/bloombergUSMarketCap', routes.bloombergUSMarketCap);


/************************************
	Route: /brandprofilesScrape
	Used to scrape each page of www.brandprofiles.com and pulls out each logo for the first five pages
***********************************/
app.get('/brandprofilesScrape', routes.brandprofilesScrape);



/************************
	Initialize server
************************/
server.listen(serverPort, function(req, res) {
	console.log('listening on port ' + serverPort);
});
