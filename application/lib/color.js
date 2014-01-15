var mongoose = require('mongoose'), 
	fs = require('fs'),
	csv = require('csv'),
	bloom = require('./bloombergCompanies.js');

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
		exports.Color.find({ 'colorName': eval('/' + req.params.query + '/i')}, function(err, c){
			
			if(err){
				console.log('color query not found! ' + err);
				res.send(500, "Something broke with the color query!")
			}
			else{
				if(c.length > 1 ){
					res.render('index',{
						colorResults : c
					});
				}	
				else if(c.length === 1){
					colorObj = c[0];
					console.log("The color obj is : "+colorObj)
						//need to modify to take account of color percentage dominance
					var logoColorSearch = bloom.bloombergCompany.find({'associatedColors.colorFamily': eval("'" + colorObj.colorFamily + "'") }).sort({'marketCap' : -1}).limit(20);
					logoColorSearch.exec(function(err, companies){
						if(err){
							console.log("Error on color query for similar comapnies " + err);
						}
						else{
							res.render('color',{
								"queryType" : 'color',
								"colorResult" : colorObj,
								"companyResult" : companies,
								"queryName" : req.params.query,
								"industryResult" : {},
								"allCompanies" : {},
								"brandResult" : {},
								"queryType" : 'color'
							});
						}
					})
				}
				else{
					res.render('color',{
						result : null,
						queryName : req.params.query
					})
				}
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