var csv = require('csv'),
	fs = require('fs'),
	util = require('util'),
  request = require('request'),
  mongoose = require('mongoose'),
  bloom = require('./bloombergCompanies.js'),
  colorExtract = require('./colorExtraction.js'),
  logopedia = ('./scrape.js').logopediaModel;

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

var saveToDB = function(logoFile, sName, dName){
	var query = {shortName : sName};
	var update = {logoFileName : logoFile, displayName : dName};
	
	console.log("Going to update " + sName + " with logo file " + logoFile + " and displayName as " + dName);	
	
	bloom.bloombergCompany.findOneAndUpdate(query, update, function(){
		console.log("DB Updated for " + dName);
	})
}

exports.download = function(uri, logoFileName, sName, companyShortName){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);


    if(res.headers['content-type']==='image/jpeg') logoFileName = logoFileName + '.jpeg';
    else if(res.headers['content-type']==='image/jpg') logoFileName = logoFileName + '.jpg';
    else if(res.headers['content-type']==='image/png') logoFileName = logoFileName + '.png';
    else if(res.headers['content-type']==='image/svg+xml') logoFileName = logoFileName + '.svg';
    else if(res.headers['content-type']==='image/gif') logoFileName = logoFileName + '.gif';

    request(uri).pipe(fs.createWriteStream('../Logos/'+logoFileName));

    saveToDB(logoFileName, sName, companyShortName);
  });
};


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

exports.logopediaDownload = function(){
	


}