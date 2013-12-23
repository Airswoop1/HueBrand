var mongoose = require('mongoose'), 
	fs = require('fs'),
	csv = require('csv');

exports.Color = mongoose.model('Color', new mongoose.Schema({

	colorName : String,
	colorFamily : String,
	RrgbValue : Number,
	GrgbValue : Number,
	BrgbValue : Number,
	hValue : Number,
	sValue : Number,
	vValue : Number,
	lValue : Number,
	shade : String,
	attributes : [String],
	complementaryColors : [String], //should these be names or Id's?
	swatchFileName : String,
	descriptionFileName : String,
	

}));

exports.queryColor = function(req,res){

	if(!req.params.query){
		console.log("error! on /color/query ");
		res.render('error',{})
	}
	else{

		exports.Color.find({ colorName: req.params.query }, function(err, c){
			console.log("returning from find function");
			if(err){
				console.log('color query not found! ' + err);
				res.send(500, "Something broke!")
			}
			else{
				console.log("found results for query! : " + JSON.stringify(c));

				res.render('color',{
					result : c,
					queryName : req.params.query
				});
			}
		})
	
	}// \else
}

exports.queryAttribute = function(req, res){

	//TODO function for querying db based on attributes selected
	//Note there may be potential for multiple attributes to be selected.

	res.render('attribute', {
		attributeName: {},
		associatedColors: {
			colors: {},
			combinations:{}
		},
		logoCloud: {},
		topIndustries: {},

	});
}