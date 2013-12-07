var phantom = require('phantom');
var portscanner = require('portscanner');
var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');

var Logopedia= mongoose.Schema({

	logoName : String,
	logopediaWebAddress : String

})

exports.logopediaModel = mongoose.model('logopedia', Logopedia)

exports.logopediaScrape = function(){

		var arrayOfLogos = Array();

		var logopedia = function(){

			request("http://logos.wikia.com/index.php?title=Special%3AAllPages&from=%21ViewSonic&to=Zyrtec&namespace=0", function(error, response, body){
				
				if(error){
					console.log("Something went wrong! " + error );
				}

				var $ = cheerio.load(body);

				var arrayOfSites = Array();
				console.log("Lets get some logos!! ")

				$('.allpageslist tr').each(function(){
					var link = $(this)[0].children[0].children[0].attribs.href;
					
					arrayOfSites.push(link);
				})
				console.log(arrayOfSites)
				logopedia2(arrayOfSites,0);

				});
			}

		var logopedia2 = function(a, index){
			console.log("set of links are: " + a);

			/*request(a[index], function(error, response, body){
				if(error){
					console.log("Error " + error);
				}
				else{
					var $ = cheerio.load(body);
				}
			})*/
		}
		
		logopedia();
	}