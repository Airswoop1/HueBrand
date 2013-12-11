var csv = require('csv'),
	fs = require('fs'),
    request = require('request'),
    mongoose = require('mongoose'),
    bloom = require('./bloombergCompanies.js'),
    colorExtract = require('./colorExtraction.js');


var saveToDB = function(logoFile, companyName, sName){
	var query = {shortName : companyName};
	var update = {logoFileName : logoFile, displayName : sName};
	console.log("Going to update " + companyName + " with logo file " + logoFile + " and displayName as " + sName);	
	bloom.bloombergCompany.findOneAndUpdate(query, update, function(){
		console.log("DB Updated for " + sName);
	})
}

var download = function(uri, logoFileName, companyNameProper, companyShortName){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);


    if(res.headers['content-type']==='image/jpeg') logoFileName = logoFileName + '.jpeg';
    else if(res.headers['content-type']==='image/jpg') logoFileName = logoFileName + '.jpg';
    else if(res.headers['content-type']==='image/png') logoFileName = logoFileName + '.png';
    else if(res.headers['content-type']==='image/svg+xml') logoFileName = logoFileName + '.svg';
    else if(res.headers['content-type']==='image/gif') logoFileName = logoFileName + '.gif';

    request(uri).pipe(fs.createWriteStream('../Logos/'+logoFileName));

    saveToDB(logoFileName, companyNameProper, companyShortName);
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
		//download(uri, fileName, searchName, dispName);
		
	})
	.on('close', function(count){
		console.log("number of lines processed "+count)
	})
	.on('error', function(error){
		console.log("there was an error" + error.message)
	});
	console.log("Images downloaded!"); 
}