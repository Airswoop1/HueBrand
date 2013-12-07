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


/** Modules **/
var brand = require('./lib/brand.js');
var color = require('./lib/color.js');
var industry = require('./lib/industry.js');
var scrape = require('./lib/scrape.js');
var bloom = require('./lib/bloombergCompanies.js');


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


/** Routers **/
app.get('/', function(req,res){
	res.render('index');
});

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
