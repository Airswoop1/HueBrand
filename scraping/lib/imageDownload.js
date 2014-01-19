var csv = require('csv'),
	fs = require('fs'),
	util = require('util'),
  request = require('request'),
  mongoose = require('mongoose'),
  bloom = require('./bloombergCompanies.js'),
  colorExtract = require('./colorExtraction.js'),
	logopedia = require('./scrape.js');


var storeMultipleToDB = function(logoHistory, companyShortName, callback) {
	console.log(logoHistory);
	bloom.bloombergCompany.update({'shortName': companyShortName}, {'logoHistory' : logoHistory}, function(err){
		if(err){
			console.log("error storing logo history " + err);
			callback(err, false)
		}
		else{
			console.log("stored logo history for " + companyShortName);
			callback(null, true);
		}

	})

}

var downloadMultiple = function (doc, i, logoHistArr, callback){
	
	var fileName = doc.logoName.replace(/[^a-zA-Z 0-9]+/g,'').toLowerCase().split(' ').join('_');
	var otherLogoFileName = fileName + "_" + doc.logosData[i].date;
	otherLogoFileName = otherLogoFileName.replace(/[^a-zA-Z 0-9\-\_]+/g,'X').split(' ').join('_');

	var uri = doc.logosData[i].url;
	try{
		request.head(uri, function(err, res, body){

	  if(res.headers['content-type']==='image/jpeg') otherLogoFileName = otherLogoFileName + '.jpeg';
	  else if(res.headers['content-type']==='image/jpg') otherLogoFileName = otherLogoFileName + '.jpg';
	  else if(res.headers['content-type']==='image/png') otherLogoFileName = otherLogoFileName + '.png';
	  else if(res.headers['content-type']==='image/svg+xml') otherLogoFileName = otherLogoFileName + '.svg';
	  else if(res.headers['content-type']==='image/gif') otherLogoFileName = otherLogoFileName + '.gif';

	  fs.exists('../application/public/Logos/'+otherLogoFileName, function(exists){
	  	
	  	if(exists){
	  		
	  		var ind = otherLogoFileName.indexOf('.')
	  		
	  		var newFileName = otherLogoFileName.substring(0, ind != -1 ? ind : otherLogoFileName.length);
	  		
	  		var extension = otherLogoFileName.substring(ind, otherLogoFileName.length)
	  		newFileName += '1' + extension;
	  		request(uri).pipe(fs.createWriteStream('../application/public/Logos/'+newFileName));

	  	}
	  	else{	
	  		request(uri).pipe(fs.createWriteStream('../application/public/Logos/'+otherLogoFileName));
	  	}
	  	
	  	logoHistArr.push({
				'year' : doc.logosData[i].date,
				'fileName' : otherLogoFileName
			})
			
			callback(doc, i, logoHistArr);		
	  })
    
  	});
	}catch(e){
		console.log("Error downloading Image! " + e);
		callback(doc, i, logoHistArr);
	}

}

exports.downloadLogopediaImages = function(){

	var parentCompaniesAssociatedToCompanies = [];

	var logopediaStream = logopedia.logopediaModel.find({}).stream();

	logopediaStream
	.on('data', function(doc){
		logopediaStream.pause();


		if(doc.logosData.length && (typeof doc.bloombergMatch !== 'undefined')){
			var logoStatus='N';

			if(typeof doc.logoClass !== 'undefined'){
				logoStatus = doc.logoClass
			}
			else if(typeof doc.logoType !== 'undefined'){
				logoStatus = doc.logoType;
			}
			//logoStatus = primary | secondary | ['parent', 'subsidiary', 'brand', 'logo', 'delete'] 

			if((logoStatus === 'parent' || logoStatus === 'primary' || logoStatus === 'logo') && doc.bloombergMatch !== 'N'){

					//determine which to download as main logo
					if(doc.logosData.length === 1){
						var fileName = doc.logoName.replace(/[^a-zA-Z 0-9]+/g,'').toLowerCase().split(' ').join('_')
						exports.downloadOne(doc.logosData[0].url, fileName, doc.bloombergMatch);
						doc.downloaded = true;
						doc.save();
						logopediaStream.resume();
					}
					else{
						var mainURL = doc.logosData[(doc.logosData.length-1)].url;
						var fileName = doc.logoName.replace(/[^a-zA-Z 0-9]+/g,'').toLowerCase().split(' ').join('_');
						exports.downloadOne(mainURL, fileName, doc.bloombergMatch);
						var logoHistArr = [];

						console.log("Multiple logo files being downloaded for : ");
						console.log(fileName)
						
						var cbFunction = function(d, j, lHA){
							if(j === d.logosData.length-2){
								d.downloaded = true;
								d.save();
								storeMultipleToDB(lHA, d.bloombergMatch, function(err, result){
									if(err){
										console.log("error storing to db");
										console.log(err);
									}
									else{
										console.log("stored logoHistory for " + d.logoName);

										logopediaStream.resume();

									}
								});
							}
							else{
								downloadMultiple(d,++j,lHA, cbFunction);
							}
							
						}

						downloadMultiple(doc, 0, logoHistArr, cbFunction)

					}

				}
				else if(logoStatus === 'brand' || logoStatus === 'subsidiary'){

					parentCompaniesAssociatedToCompanies.push(doc.parentCompany)			

				}


			}
				logopediaStream.resume()

			})
			.on('error', function(error){

			})
			.on('close', function(){
				console.log(parentCompaniesAssociatedToCompanies);
			})

}

exports.downloadOne = function(uri, logoFileName, bloombergName){
  try{
	  request.head(uri, function(err, res, body){

	    if(res.headers['content-type']==='image/jpeg') logoFileName = logoFileName + '.jpeg';
	    else if(res.headers['content-type']==='image/jpg') logoFileName = logoFileName + '.jpg';
	    else if(res.headers['content-type']==='image/png') logoFileName = logoFileName + '.png';
	    else if(res.headers['content-type']==='image/svg+xml') logoFileName = logoFileName + '.svg';
	    else if(res.headers['content-type']==='image/gif') logoFileName = logoFileName + '.gif';

	    fs.exists('../application/public/Logos/'+logoFileName, function(exists){
	    	if(exists){
	    		
	    		var ind = logoFileName.indexOf('.')
	    		
	    		var newFileName = logoFileName.substring(0, ind != -1 ? ind : logoFileName.length);
	    		
	    		var extension = logoFileName.substring(ind, logoFileName.length)
	    		newFileName += '1' + extension;
	    		console.log(newFileName);
	    		request(uri).pipe(fs.createWriteStream('../application/public/Logos/'+newFileName));
			    saveOneToDB(newFileName, bloombergName);
	    	}
	    	else{	
	    		request(uri).pipe(fs.createWriteStream('../application/public/Logos/'+logoFileName));
			    saveOneToDB(logoFileName, bloombergName);
	    	}
	    })

	    
	  });
	}catch(e){
		console.log("error downloading single logo " + e);

	}


};


var saveOneToDB = function(logoFile, bloomName){
	var query = {shortName : bloomName};
	var update = {logoFileName : logoFile};
	
	console.log("Going to update " + bloomName + " with logo file " + logoFile);	
	
	bloom.bloombergCompany.findOneAndUpdate(query, update, function(err){
		if(err) console.log("error saving to db : " + err);
		console.log("DB Updated for " + bloomName);
	})
}

exports.populate = function(){
	csv()
	.from.path(__dirname+'/companyLogoList.csv', {delimiter: ','})
	.transform(function(row){
		row.unshift(row.pop());
		return row
	})
	.on('record', function(row, index){
		
		var searchName = row[2];	
		var fileName = row[3].toLowerCase().split(' ').join('_');
		var dispName = row[3]
		var uri = row[5];
		exports.download(uri, fileName, searchName, dispName);

	})
	.on('close', function(count){
		console.log("number of lines processed "+count)
	})
	.on('error', function(error){
		console.log("there was an error" + error.message)
	});
	console.log("Images downloaded!"); 
}

exports.downloadFavicon = function(){
	var favstream = bloom.bloombergCompany.find().stream();

	favstream.on('data', function(doc){
		favstream.pause();
		try{
			var url = "http://" + doc.website + "/favicon.ico"
			request.head(url, function(err, res, body){
				if(err){
					console.log("Problem getting favicon header " + err)
					console.log("No favicon downloaded for " + doc.shortName);
					favstream.resume();

				}
				else{
					if(res.statusCode === 200 && res.headers['content-type'] === 'image/x-icon'){
						console.log("downloading favicon for " + doc.shortName);

						var faviconName = doc.displayName.replace(/[^A-Z0-9]+/ig, "_").toLowerCase();
						faviconName = faviconName + '.ico'
						request(url).pipe(fs.createWriteStream('../Logos/favicon/'+faviconName));
						doc.faviconFileName = faviconName;
						doc.save();
						favstream.resume();

					}
					else{
						console.log("no favicon to download for :  " + doc.shortName);
						favstream.resume();

					}

				}

			})
		}catch(e){
			console.log("error on favicon download " + e);
			console.log("No favicon downloaded for " + doc.shortName);
			favstream.resume();
		}
	}).on('error', function(error){
		//handle error
		console.log("error on downloading favicon stream " + error);

	}).on('close', function(){
		console.log("Stream for favicon downloading closed");

	});

}
