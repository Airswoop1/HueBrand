var mongoose = require('mongoose'), 
	fs = require('fs'),
	csv = require('csv'),
	bloom = require('./bloombergCompanies.js');

var attributes = new mongoose.Schema({
		industry : String,
		shade : String,
		color : String,
		country : String,
		attribute : String
});

exports.attributeModel = mongoose.model('attributes', attributes);

exports.queryAttribute = function(req, res){

if(!req.params.query){
		console.log("error! on /color/query ");
		res.render('error',{})
	}
	else{
		exports.attributeModel.find({ 'attribute': eval('/' + req.params.query + '/i')}, function(err, attributeObj){
			
			if(err){
				console.log('color query not found! ' + err);
				res.send(500, "Something broke with the color query!")
			}
			else{

					res.render('attribute', {
						"queryType" : "attribute",
						"topColors" : {},//brandResult.associatedColors,
						"attributeResult" : attributeObj[0],
						"brandResult" : {},//brandResult,
						"industryResult" : {},//industry,
						"colorResult" : {},//colors,
						"queryName" : req.params.query,
						"allCompanies" : bloom.AllCompanies,

					});
			}
		});
	}
}		
