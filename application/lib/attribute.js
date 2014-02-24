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
try{
	if(!req.params.query){
			console.log("error! on /color/query ");
			res.render('error',{})
		}
		else{
			exports.attributeModel.find({ 'attribute': eval('/' + req.params.query + '/i')}, function(err, attributeObj){
				console.log(attributeObj);
				if(err){
					console.log('color query not found! ' + err);
					res.send(500, "Something broke with the color query!")
				}
				else{
					
					getTopColorsForAttributes(attributeObj, function(sortedTopColors){
						console.log(sortedTopColors);

						sortedTopColors = [ { colorName: 'Yellow 1',
																				    colorPercentage: 34,
																				    RrgbValue: 239,
																				    GrgbValue: 204,
																				    BrgbValue: 0,
																				    hValue: 51.21338912,
																				    sValue: 100,
																				    vValue: 93.7254902,
																				    lValue: 46.8627451 },
																				    
																				    { colorName: 'Yellow 2',
																				    colorPercentage: 33,
																				    RrgbValue: 220,
																				    GrgbValue: 200,
																				    BrgbValue: 0,
																				    hValue: 51.21338912,
																				    sValue: 100,
																				    vValue: 93.7254902,
																				    lValue: 46.8627451 },

																				    { colorName: 'Yellow 3',
																				    colorPercentage: 33,
																				    RrgbValue: 180,
																				    GrgbValue: 100,
																				    BrgbValue: 0,
																				    hValue: 51.21338912,
																				    sValue: 100,
																				    vValue: 93.7254902,
																				    lValue: 46.8627451 } ]

							res.render('attribute', {
								"queryType" : "attribute",
								"topColors" : sortedTopColors,
								"attributeResult" : attributeObj[0],
								"brandResult" : {},//brandResult,
								"industryResult" : {},//industry,
								"colorResult" : {},//colors,
								"queryName" : req.params.query,
								"allCompanies" : bloom.AllCompanies,
								"topCountries" : {}

							});
					});
				}
			});
		}
	}
	catch(e){
		console.log("There was an error on the attributeQuery!");
		console.log(e);
		res.render('landing',{		
														queryType : '',
														topCountries : {},
														colorResult : {},
														topColors : {},
														industryResult:{}
													})
	}
}		

var getTopColorsForAttributes = function( attrObjects, callback ){

	var attributeColorMap = []

	for(var i=0;i<attrObjects.length;i++){

		if(attributeColorMap.indexOf(attrObjects[i].color)>=0){
			attributeColorMap[attrObjects[i].color].freq += 1;
		}
		else{
			attributeColorMap[attrObjects[i].color] = {"freq" : 1}
		}
	}

	var arrayOfColors = [];

	for(var key in attributeColorMap){
		arrayOfColors.push({key:key, "freq":attributeColorMap[key].freq});
	}

	arrayOfColors.sort(function(x,y){
		return y['freq'] - x['freq']
	})

	callback(arrayOfColors);

}



