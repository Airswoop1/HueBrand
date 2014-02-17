var mongoose = require('mongoose');
bloom = require('./bloombergCompanies.js');

exports.Industry = mongoose.model('Industry', new mongoose.Schema({
	
	industryId : String,
	name: String,
	industrySize : Number,
	colors : [String], //should these be names or Id's?
	attributes :  [String],
	colorCombinations : [String],

}));

exports.queryIndustry = function(req,res){

if(!req.params.query){
		console.log("error! on /brand/query ");
		res.render('error',{})
	}
	else{
		//, logoFileName : {$exists : true}
		bloom.bloombergCompany.find({ 'GICSIndName': eval("/" + 'Aerospace \& Defense' + "/i") }, function(bloomErr, b){
			
			if(bloomErr){
				console.log('brand query not found! ' + bloomErr);
				res.send(500, "Something broke!")
			}
			else{
				console.log(b);


				res.render('industry',{
					"queryType" : "industry",
					topColors : {},
					colorPallette: {},
					logoCloud: {},
					colorRatio: {},
					colorMap: {},
					topAttributes: {}
				})
			}
		})
	}
}

