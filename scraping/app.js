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

/** Server and DB Init **/
var app = express();
var server = http.createServer(app);
mongoose.connect('mongodb://localhost/huebrand');
var io = require('socket.io').listen(server);


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
imageDownload.downloadLogopediaImages();

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

/******
Setup for /logosSelection route
*******/
var logopediaArray = []
//Query db for all logopedia documents that have logosData and don't have a bloombergMatch
var logosQ = scrape.logopediaModel.find({$and: [{logosData :{$not :{$size : 0 }}}, {bloombergMatch: {$exists:false}}]});
logosQ.exec(function(err, obj){
	if(err){
		console.log("error populating logopedias array " + err);
	}
	else{
		//store results in logopediaArray
		logopediaArray = obj;
		console.log("logopedias array populated!");
	}
	
})



var index = -1;
io.set('log level', 1);
//set up socket connections
io.sockets.on('connection', function(socket){
	
	socket.on('next-logo', function(data){
		//send next logopedia/bloomberg matches
		console.log('next-logo called!!');
		index++;

		//callback for bloom.bloombergQuery
		var getLogos = function(retObj){
			if(!retObj){
				console.log("no match found!");		
				var updateCondition = {
					'logoName' : logopediaArray[index].logoName,
					'logoURL' : logopediaArray[index].logoURL
				}
				var update = {
					'bloombergMatch' : 'N'
				}
				scrape.logopediaModel.findOneAndUpdate(updateCondition, update, function(err){
					if(err){ 
						console.log("Cannot store in logopedia db " + err);
					}
					else{
						console.log("stored no match to logopedia db!");
						bloom.bloombergQuery(logopediaArray[++index].logoName, getLogos);

					}
				});
			}
			else{
				if(retObj.length === 1){
					console.log("saving match to the db!");
					var updateCondition = {
						'logoName' : logopediaArray[index].logoName,
						'logoURL' : logopediaArray[index].logoURL
					}
					var update = {
						'bloombergMatch' : retObj[0].shortName
					}
					scrape.logopediaModel.findOneAndUpdate(updateCondition, update, function(err){
						if(err){ 
							console.log("Cannot store in logopedia db " + err);
						}
						else{
							console.log("stored no match to logopedia db!");
							bloom.bloombergQuery(logopediaArray[++index].logoName, getLogos);

						}
					});
				}
				else{
					console.log("sending logo to the page for " +  logopediaArray[index].logoName)
					socket.emit('new-logo', {
						logopediaTitle : logopediaArray[index].logoName,
						logopediaURL : logopediaArray[index].logoURL,
						bloombergCompanies : retObj
					});
				}
			}
		}

		/*query bloomberg database to search if any logoName in the logopediaArray
			matches a shortName in the bloom model
		*/
		bloom.bloombergQuery(logopediaArray[index].logoName, getLogos);

	});
	

	socket.on('database-search', function(data){
		//search database for potential matches when logopedia search against bloomberg doesn't come up with good option
		var getOtherLogos = function(retObj){
			if(!retObj){
				socket.emit('no-query-response',{})
			}
			else{
				socket.emit('new-query-response',{
					'newQ' : retObj
				})
			}
		}

		bloom.bloombergQuery(data.query, getOtherLogos)

	});

	socket.on('match', function(data){
		//take match from logoSelection and store match in logopedias collection
		console.log("we have a match " + util.inspect(data));
		var updateCondition = {
			'logoName' : data.logopediaTitle,
			'logoURL' : data.logopediaURL
		}
		var update = {
			'bloombergMatch' : data.bloombergMatch.shortName,
			'logoType' : data.logoType
		}
		//update logopediaModel for match
		scrape.logopediaModel.findOneAndUpdate(updateCondition, update, function(err){
			if(err){ 
				console.log("Cannot store in logopedia db " + err);
			}
			else{
				console.log("stored match to logopedia db!");
				//next-logo called from client to iterate to next logo
			}
		});

	});

	socket.on('no-match', function(data){
		//no match on logopedia logoName with bloomberg shortName
		console.log("we don't have a match for " + data.logopediaTitle);
		var updateCondition = {
			'logoName' : data.logopediaTitle,
			'logoURL' : data.logopediaURL
		}
		var update = {
			'bloombergMatch' : 'N'
		}
		//update logopediaModel with bloombergMatch  = 'N'
		scrape.logopediaModel.findOneAndUpdate(updateCondition, update, function(err){
			if(err){ 
				console.log("Cannot store in logopedia db " + err);
			}
			else{
				console.log("stored no match to logopedia db!");
				//next-logo called from client to iterate to next logo
			}
		});
	})

	socket.on('disconnect', function(data){
		//close 
	})
	socket.emit('connect', {});
})

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
app.get('/logoColorExtraction',function(req,res){
	bloom.bloombergCompany.find({$and : [{logoFileName : {$exists : true}}, {associatedColors:{$exists:false}}]}, 
		function(err, obj){
		console.log(err);
		console.log(obj);
		var ind = 0;
		colorExtract.extract(ind, obj);
	})
})



/** 
	Route: /brandsoftheworldScrape
	Used to scrape logos from www.brandsoftheworld.com based on a search
	query using the companies in the brands database.
	Note *companies with special characters and spaces not taken into account
		correctly so the data is not completely accurate* 
**/
app.get('/brandsoftheworldScrape',function(req,res){
	var brandList = Array()
	//query the db and pull out only the brandNames
	var result = brand.Brand.find().select('brandName').exec(function(err,obj){

		if(err){
			console.log("There was an error! " + err);
		}
		else{
			//for each of the brandNames search brandsoftheworld and capture the first 20 logo images
			for(j=0 ; j < obj.length; j++){
				brandList.push(obj[j].brandName);
			}
			var urlArray = Array(); 
			logoScrape(brandList, 0, 0)
		}
	});
			
	var logoScrape = function(blist, pg, ind){
			var pageSymbol;

			urlArray = [];

			if(pg===0){ 
				pageSymbol = '';
			}
			else{
				pageSymbol = '&page=' + pg;	
			} 

			request("http://www.brandsoftheworld.com/search/logo?search_api_views_fulltext=" + blist[ind] + pageSymbol, function(error, response, body){

				if(error)	{
					console.log("something went wrong! " + error);
				}
				var $ = cheerio.load(body);

			  	//var logosDivs = $('.logos').children('ul').children('li').children('a').children('img');
			  	var logosDivs = $('.logos ul li a img').each(function(index, element){
			  		urlArray.push($(this).attr('src'));
			  	});


			  	if(urlArray.length){
				  	brand.addPotentialLogos(blist[ind], urlArray);

				  	var nextButton = $('.pager-next');
				  	
				  	if(nextButton){ 
				  		logoScrape(blist, pg+1, ind);
				  	}
				  	else if(ind+1 < blist.length) {				  		 
				  		logoScrape(blist,0,ind+1);
				  	}
			  	}
			  	else{
			  		console.log("No logos found for " + blist[ind]);
			  		logoScrape(blist,0,ind+1);
			  	}

			});
		
	}

});


/*****************************
	Route: /bloombergPhantom
	Used to pull all bloomberg company names, stock symbol, sub-industry
	and country. 
	Note *This is not the same data used in the bloom.populate() function above*
*****************************/
app.get('/bloombergPhantom', function(req,res){
	
	var alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
	var index = 0;
	var page = 0;

	var bloombergBrands = function(ind, pg){

		var pgSymbol = pg + '/';

		portscanner.findAPortNotInUse(12300, 13000, 'localhost', function(error, portNum) {
  
		phantom.create(function(ph) {
		
		return ph.createPage(function(page) {

	      return page.open("http://www.bloomberg.com/markets/companies/a-z/"+alphabet[ind]+"/"+pgSymbol, function(status) {
	      
			console.log("opened site? ", status);         
	 
	            page.injectJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function() {
	                //jQuery Loaded.
					//set timeout for 2seconds
	                setTimeout(function() {
	                    return page.evaluate(function() {


	 
							var arrayOfBrands = Array();
							console.log("evaluating page after jquery injection");
							$('.name').each(function(){

							  var bName = $(this)[0].children[0].children[0].innerText;
							  var brandStockSym = $(this).next()[0].innerText;
							  var brandCountry = $(this).next().next()[0].innerText;
							  var brandCategory = $(this).next().next().next().next()[0].innerText;
							  var entry = {brandName:bName, industryName: brandCategory, location: {country: brandCountry}, stockSymbol: brandStockSym};

							  arrayOfBrands.push(entry);
							})

							var pageCheck = $('.disabled.next_page');
							if(pageCheck.length) return {barray: arrayOfBrands, end:0}
							else return {barray: arrayOfBrands, end:1}

	                    }, function(result) {

							brand.addBrands(result.barray);
	                        ph.exit();

							if(result.end) bloombergBrands(ind,pg+1);
							else if(alphabet[ind]!== 'z') bloombergBrands(ind+1,1)

	                    });
	                }, 2000);
	 
	            });
	    });
	    });
	},{port:portNum});
	})
	}
	bloombergBrands(0,1);

})

/******************************************
	Route: /bloombergUSMarketCap
	Used to scrape Bloomberg for the market cap based on company ticker ID
	Note  *Issues arose with companies not having a marketCap because they 
	weren't publicly listed yet. Also function was randomly stopping potentially
	due to limits on the bloomberg website based on the same IP address*

*******************************************/
app.get('/bloombergUSMarketCap', function(req,res){

	var companyObjArray = Array();

	brand.Brand.find( { location: {country: 'USA'} }, function(err, obj){
		if(err) console.log('There was an error! ' + err);
		else{
			for(var i=0; i < obj.length; i++ ){
				if(!obj[i].marketCap){
					if(obj[i].marketCap !== 0)
						companyObjArray.push(obj[i]);
				}
			}
			console.log(companyObjArray)
		bloombergUSMarketCap(companyObjArray, 0);

		}
	})


	var bloombergUSMarketCap = function(companies, ind){

		portscanner.findAPortNotInUse(12300, 24400, 'localhost', function(error, portNum) {
  
		phantom.create(function(ph) {
		
		return ph.createPage(function(page) {

	      return page.open("http://www.bloomberg.com/quote/"+companies[ind].stockSymbol, function(status) {
	        console.log("the page opened is : http://www.bloomberg.com/quote/"+companies[ind].stockSymbol);
			console.log("opened site? ", status);         
	 		page.onConsoleMessage = function (msg) { console.log(msg); };
	 //           page.injectJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function() {
	   //             console.log("jquery loaded!");
						//jQuery Loaded.
					//set timeout for 5seconds
	                setTimeout(function() {

	                    return page.evaluate(function(companies, ind) {

							var marketCap = $('.key_stat_data tbody tr:first').next().next().next().next().next().next().children('.company_stat').text()
							
							var tableDivs  = $('.key_stat_data tbody');

							return {marketCap : marketCap}

							
							if(marketCap.length){
								return { marketCap : marketCap };
							}
							else{
								return {marketCap : "-1"};
							}



	                    }, function(result) {
							
							if(result.marketCap !== "-1"){
								var stripMktCap = result.marketCap.replace(/,/g, "");
								var numMktCap = parseFloat(stripMktCap);
								if(!isNaN(numMktCap)){
									console.log("Storing data for company: " + companies[ind].brandName + " with marketCap= " + numMktCap );
									brand.storeMarketCap(companies[ind]._id, numMktCap);	
								}
								else{
									console.log("Market cap not available for " + companies[ind].brandName)
									brand.storeMarketCap(companies[ind]._id, -1)
								}
								
							}
							else{
								console.log("No market cap found for : " + companies[ind]);
							}

							ph.exit()                        

							if( ind+1 < companies.length) bloombergUSMarketCap(companies,ind+1);

	                    });
	                }, 5000);
	 
	         //   });
	    });
	    });
	},{port:portNum});
	})
	}

})


/************************************
	Route: /brandprofilesScrape
	Used to scrape each page of www.brandprofiles.com and pulls out each logo for the first five pages
***********************************/
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
});



/************************
	Initialize server
************************/
server.listen(serverPort, function(req, res) {
	console.log('listening on port ' + serverPort);
});
