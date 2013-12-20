var csv = require('csv'),
	fs = require('fs'),
    request = require('request'),
    mongoose = require('mongoose'),
    bloom = require('./bloombergCompanies.js'),
    colorExtract = require('./colorExtraction.js'),
    logopedia = ('./scrape.js').logopediaModel;


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