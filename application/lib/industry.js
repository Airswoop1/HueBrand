var mongoose = require('mongoose');

exports.Industry = mongoose.model('Industry', new mongoose.Schema({
	
	industryId : String,
	name: String,
	industrySize : Number,
	colors : [String], //should these be names or Id's?
	attributes :  [String],
	colorCombinations : [String],

}));

exports.queryIndustry = function(req,res){

	res.render('industry',{
		topColors : {},
		colorPallette: {},
		logoCloud: {},
		colorRatio: {},
		colorMap: {},
		topAttributes: {}
	})

}