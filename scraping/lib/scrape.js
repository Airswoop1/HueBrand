var phantom = require('phantom');
var portscanner = require('portscanner');
var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var util = require('util');

var Logopedia = mongoose.Schema({

	logoName : String,
	logoURL : String,
	logosData : [{
		url : String,
		date : String
	}],
	redirect : String,
	bloombergMatch : String,
	logoType : String,
	logoCategories : [String],
	logoClass : String, // ['parent', 'subsidiary', 'brand', 'logo', 'delete']
	parentCompany: [String],
	downloaded, Boolean

})
//contraint on schema for logoName to be unique
Logopedia.index({logoName: 1}, {unique:true});
exports.logopediaModel = mongoose.model('logopedia', Logopedia);


function updateLogopedias(index, compArr){
	//helper function for updateDownloadedStatus
	var bloomComp = compArr[index];
	exports.logopediaModel.update({'bloombergMatch': bloomComp}, {downloaded: true}, {multi:true}, function(err, obj){
		if(err){
			console.log("error updating logopedias in updateDownloadedStatus");
			console.log(err);
		}
		else{
			console.log("updated logopedia entry" + obj);
			if(index < compArr.legnth-1 ) updateLogopedias(++index, compArr);
			else{
				console.log("Completed updateDownloadedSatatus! For " + index + " companies");
			}
		}
	})
}

/********
	Function for updating the downloaded field of all previously downloaded logopedias
	documents
********/
exports.updateDownloadedSatatus = function() { 
	var compsWithDownloadedLogos; 
	var query = bloom.bloombergCompany.find({logoFileName : {$exists:true}});

	query.exec(query, function(err, obj){
		if(err){
			console.log("Error query bloomberg db in updateDownloadedSatatus")
			console.log(err);
		}
		else{
			compsWithDownloadedLogos = obj;
			var index = 0;
			updateLogopedias(index, compsWithDownloadedLogos)
		}
	})

}

/*****
*****/
exports.refineLogoData = function (){

	var stream = exports.logopediaModel.find().stream();

	stream.on('data', function (doc){
		stream.pause();
		var url = doc.logoURL
		request(url, function (error, response, body){
	  	
	  	if(error){
	  		console.log("Error loading page!");
	  	}
	  	try{
		  	var $ = cheerio.load(body);
		  	
		  	//grab categories from page for logo
		  	var catArray = [];
		  	var categories = $('.WikiaArticleCategories.CategorySelect.articlePage ul.categories li.category.normal')
		  	for(var i=0; i<categories.length;i++){
		  		catArray.push(categories[i].attribs['data-name'])
		  	}
		  	doc.logoCategories = catArray;

				//grab all Tables Titles into one string
		  	var tableTitles = $('tbody,tr>th').text();
		  	//spilt Titles into array
		  	tableTitles = tableTitles.split('\n');

		  	//grab first occurance of the logos selflink, this will be the logos title
		  	var selfLink = $('.selflink').first().text();				

		  	//flag for determining whether or not it is a parent
				var isAParent = false;
				//variable for cleaned Table Titles Array (without '')
				var newTableTitlesArray = [];

				/*
					go through and clean the array, removing '' and flagging whether the 
					logo is the parent company (isAParent = true)
				*/
				if(tableTitles.length){
					for(var j=0;j<tableTitles.length;j++){
						
						tableTitles[j] = tableTitles[j].trim()

						if(tableTitles[j] !== '' && tableTitles[j] !== 'Contents'){
							newTableTitlesArray.push(tableTitles[j]);
						}

						if(tableTitles[j]===selfLink && selfLink !== ''){
							isAParent = true;
						}
					}
				}

				/*
					grab all of the logo images on the page
					Used to determine whether the page has any logos at all
				*/
				var imageSelection = $('.floatnone a');
		  	
		  	//is a parent company
		  	if(isAParent){
		  		console.log('Logopedia page for ' + doc.logoName + " is a parent company!");
		  		doc.logoClass = 'parent';

		  	}
		  	//has a parent company 
		  	else if(newTableTitlesArray.length >= 1){
		  		//has only one parent company
		  		if(newTableTitlesArray.length === 1){
		  			//is a brand of parent company 
		  			console.log('Logopedia page for ' + doc.logoName + " has a parent company " + newTableTitlesArray[0]);
		  			doc.logoClass = 'brand'
		  			doc.parentCompany = newTableTitlesArray;
		  		}
		  		//has multiple parent companies
		  		else{
		  			console.log('Logopedia page for ' + doc.logoName + " has multiple parent companies ");
		  			for(var i=0; i<newTableTitlesArray.length; i++){
		  				if(newTableTitlesArray[i]){
		  					console.log(newTableTitlesArray[i]);
		  				}
		  			}
		  			doc.logoClass = 'brand';
		  			doc.parentCompany = newTableTitlesArray;
		  		}

		  	}
		  	//Just a logo/logos of a company 
		  	else{
		  		console.log('Logopedia page for ' + doc.logoName + " is its own logo ");
		  		doc.logoClass = 'logo';
		  	}
		  	doc.save();
		  	stream.resume();
		  }
		  catch(e){
		  	console.log("error in stream! " + e);
		  	stream.resume();
		  }
	  	
	  	
		})


	}).on('error', function (err){
		console.log("Error in stream " + err);

	}).on('close', function (){

		console.log("Stream closed!");

	})	


}

exports.matchLogoWithCompany = function(){

	var stream = exports.logopediaModel.find({logosData :{$not :{$size : 0 }}}).stream();

	stream.on('data', function (doc) { 
		stream.pause();
	
		var lName = doc.logoName.replace('/','\/');

		var bloomQuery = bloom.bloombergCompany.find({'shortName': eval("/" + lName+ "/i")})
	
		bloomQuery.exec(function(err, obj){

			if(obj.length > 1){
				prompt.start();
				var properties = ['#0 None of these'];
				prompt.message = "Pick company that best matches " + doc.logoName + " " + doc.logoURL;

				for(var i=0; i<obj.length;i++){
					var mystring = '#'+(i+1)+' '+obj[i].shortName + ' - ' + obj[i].website;
					properties.push(mystring);
				}
				
				properties.join(' ');
				console.log(properties);
				prompt.get({
					name : 'choice',
					"description" : properties,
					validator : /\d+/
				},function(err, result){
					
					if(result.choice === '0'){	
						console.log("No match for " + doc.logoName)
						doc.bloombergMatch = 'N'
						doc.save();
					}
					else{
						console.log("Match for " + doc.logoName);
						console.log(obj[parseInt(result.choice)-1].shortName);
						doc.bloombergMatch = obj[parseInt(result.choice)-1].shortName;
						doc.save();
					}
					stream.resume();
				});

			}
			else if(obj.length === 1){
				console.log("Match for " + doc.logoName)
				doc.bloombergMatch = obj.shortName;
				doc.save();
				stream.resume();
			}
			else{
				console.log("No match for " + doc.logoName)
				doc.bloombergMatch = 'N'
				doc.save();
				stream.resume();
			}

		})	


	}).on('error', function (err) {
	  // handle the error
	}).on('close', function () {
	  // the stream is closed
	});

}

exports.collectLogos = function(){
	
	var stream = exports.logopediaModel.find().stream();
	stream.on('data', function (doc) {
	  stream.pause()

	  request(doc.logoURL, function (error, response, body){
	  	if(error ){
	  		console.log("Error! " + error )
	  		//continue onto next request
	  	}
	  	else{
	  		var logosArray = [];
	  		var $ = cheerio.load(body);

	  		if($('h3 .mw-headline').length){
	  			var dateTitleArray = $('h3 .mw-headline');
	  			var imageURLArray = $('.floatnone a');

				if((dateTitleArray.length && imageURLArray.length) || !($('a[href="/wiki/Special:Upload"]').length)){
		  			for(var i=0;i<dateTitleArray.length;i++){
		  				try{
			  				var d = dateTitleArray[i].children[0].data;
			  				var a = $('.floatnone a')[i].attribs.href;
			  				logosArray.push({"url": a, "date": d});
		  				}catch(e){
		  					console.log("Error Caught " + e);
		  				}

		  			}

		  			doc.logosData = logosArray;
		  			doc.save(function(err){
					  	if(err) console.log("Error! " + err)
					  	console.log("updated : " + doc.logoName);
					  	stream.resume();
					  })
	    			stream.resume()

				}
				else{	
					console.log("Flagged  " + doc.logoName);
  					stream.resume()
  				}
	  		}
	  		else if($('h2 .mw-headline').length){
	  			
	  			var dateTitleArray = $('h2 .mw-headline');
	  			var imageURLArray = $('.floatnone a');

	  			if(dateTitleArray.length && imageURLArray.length && $('a[href="/wiki/Special:Upload"]').length<=3){
		  			for(var i=0;i< dateTitleArray.length; i++){
		  				try{
			  				var d = dateTitleArray[i].children[0].data;
			  				var a = imageURLArray[i].attribs.href;
			  				logosArray.push({"url": a, "date": d});
			  			}catch(e){
			  				console.log("Error caught : " + e);
			  			}
						
		  			}
		  			
		  			doc.logosData = logosArray;
		  			
		  			doc.save(function(err){
					  	if(err) console.log("Error! " + err)
					  	console.log("updated : " + doc.logoName);
					  	stream.resume();
					})

	  			}
	  			else{
	  				console.log("Flagged  " + doc.logoName);
	  				stream.resume();
	  			}
	  			
	  		}
	  		else{
	  			var imageURL = $('.mw-content-ltr div a')
	  			if(imageURL.length){
	  				try{
		  				var a = imageURL[0].attribs.href;
		  			}
		  			catch(e){
		  				console.log("Caught Error " + e);
		  			}
		  		}
		 	 	
		 	 	doc.logosData = [{"url": a}];
	 	 		
	 	 		doc.save(function(err){
				  	if(err) console.log("Error! " + err)
					  	console.log("updated : " + doc.logoName);
					  	stream.resume();
			  	})
	  		}

	  	}
	  })

/*
	  doc.save(function(err){
	  	if(err) console.log("Error! " + err)
	  	//console.log("updated : " + str);
	  	stream.resume();
	  })*/

	  
	}).on('error', function (err) {
	  // handle the error
	}).on('close', function () {
	  // the stream is closed
	});
}



exports.logopediaScrape = function(){

	var arrayOfLogos = Array();

	var logopedia = function(){

		request("http://logos.wikia.com/wiki/Special:AllPages", function(error, response, body){

			if(error){
				console.log("Something went wrong! " + error );
			}

			var $ = cheerio.load(body);

			var arrayOfSites = Array();
			console.log("Lets get some logos!! ")

			$('.allpageslist tr').each(function(){
				var link = $(this)[0].children[0].children[0].attribs.href;
				var decoded = decodeURIComponent("http://logos.wikia.com"+link).replace("&amp;", "&");
				arrayOfSites.push(decoded);
			})
			console.log("we have sites: "+ arrayOfSites)
			logopedia2(arrayOfSites,0)


		});
	}

	var logopedia2 = function(a, index){

		if(index < a.length && a[index] !== 'http://logos.wikia.com/wiki/Special:AllPages?from=Zoo_Tycoon_(2001)&to=Zyrtec'){
			request(a[index], function(error, response, body){
				if(error){
					console.log("Error " + error);
				}
				else{
					var $ = cheerio.load(body);
					var one, 
					two;

					if(typeof $('.mw-allpages-alphaindexline')[0] !== 'undefined'){ 
						one = decodeURIComponent("http://logos.wikia.com" + $('.mw-allpages-alphaindexline')[0].children[0].attribs.href).replace("&amp;", "&");
						fullArrayOfSites.push(one);
					}
					if(typeof $('.mw-allpages-alphaindexline')[1] !== 'undefined'){
						two = decodeURIComponent("http://logos.wikia.com" + $('.mw-allpages-alphaindexline')[1].children[0].attribs.href).replace("&amp;", "&");
						fullArrayOfSites.push(two);
					}

					index++;
					logopedia2(a, index);
				}
			})
		}
		else{
			console.log("Logos from second scrape! : " + fullArrayOfSites)
			logopedia3(fullArrayOfSites,0);
		}
	}

	var logopedia3 = function(a, index){

		if(index < a.length){
			request(a[index], function(error, response, body){
				var arr = Array();
				if(error){
					console.log("Error " + error);
				}
				else{
						//insert check for a page that doesnt have list of logos
						var $ = cheerio.load(body);
						if(typeof $('.mw-allpages-table-chunk')[0] !== 'undefined'){
							var tableObj = $('.mw-allpages-table-chunk')[0].children;
							var lengthOfTable = tableObj.length;
							if(lengthOfTable>0){

								for(var i=0;i< lengthOfTable; i++){
									if(tableObj[i].name === 'tr'){
										for(var j=0; j<tableObj[i].children.length;j++){
											if(tableObj[i].children[j].name === 'td'){
												if(typeof tableObj[i].children[j].children[0].attribs.href === 'undefined'){

													var url = ("http://logos.wikia.com" + tableObj[i].children[j].children[0].children[0].attribs.href).replace("&amp;", "&");
													var arrObj = {
														logoURL : url,
														logoName : tableObj[i].children[j].children[0].children[0].attribs.title,
														redirect : 'Y'
													}
													arr.push(arrObj);
												}
												else{
													var url = ("http://logos.wikia.com" + tableObj[i].children[j].children[0].attribs.href).replace("&amp;", "&");
													var arrObj = {
														logoURL : url,
														logoName : tableObj[i].children[j].children[0].attribs.title,
														redirect : 'N'
													}
													arr.push(arrObj)
												}
											}
										}	
									}

						}//\end of for loop
					}


					console.log("Successfully scraped : " + a[index] + " which had " + arr.length + " companies");
					index++;
					exports.logopediaModel.create(arr, function(err){
						if(err) console.log("Something went wrong!!" + err);
						else{ 
							console.log("Success in storing brands to db! : " + arguments[1]);
						}
						logopedia3(a, index);

					})
				}
				else{
					index++;
					logopedia3(a, index);		
				}
			}
			
		})
}
}

var fullArrayOfSites = Array();
logopedia();
}

