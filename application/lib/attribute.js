var mongoose = require('mongoose'), 
	fs = require('fs'),
	csv = require('csv'),
	bloom = require('./bloombergCompanies.js'),
	_ = require('underscore');

var emptyPayload = {
	queryType : '',
	topCountries : {},
	colorResult : {},
	topColors : {},
	industryResult:{}
}

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
			console.log("error! on attribute query ");
			res.render('landing', emptyPayload)
		}
		else{

			exports.attributeModel.find({ 'attribute': eval('/' + req.params.query + '/i')}, function(err, attributeObj){
				console.log(attributeObj);
				if(err){
					console.log(err);
					console.log("error on attribute query");
					res.render('landing', emptyPayload);
				}
				else if(attributeObj){
					
					getTopColorsForAttributes(attributeObj, function(sortedTopColors){
						getColorDataForTopColors(sortedTopColors,function(sortedTopColorsWithData){

								res.render('attribute', {
									"queryType" : "brand",
									"topColors" : sortedTopColorsWithData,
									"attributeResult" : attributeObj[0],
									"brandResult" : {},//brandResult,
									"industryResult" : {},//industry,
									"colorResult" : {},//colors,
									"queryName" : req.params.query,
									"allCompanies" : bloom.AllCompanies,
									"topCountries" : {}

								});
							})
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

function getColorDataForTopColors(cArray, callback){	
	var modifiedArray = Array();

	var queryDBForColorInfo = function(colorArray, index, newArray, cb){
		if(index == colorArray.length){

			cb(newArray);
		}else{
			color.Color.find({colorName : colorArray[index].key, "isBase": true}, function(err, c){
				if(err || !c.length){
					queryDBForColorInfo(colorArray, ++index, newArray, cb);	
				}
				else{
					var colorObject = c[0];				
					colorObject["colorPercentage"] = colorArray[index].freq;
					newArray.push(colorObject);

					queryDBForColorInfo(colorArray, ++index, newArray, cb);
				}
			})
		}
	}

	queryDBForColorInfo(cArray, 0, modifiedArray, callback);
}		

var getTopColorsForAttributes = function( attrObjects, callback ){

	var attributeColorMap = []

	for(var i=0;i<attrObjects.length;i++){
		
		var colorName;

		if(attrObjects[i].shade == 'NA'){
			colorName = 'medium ' + attrObjects[i].color;
		}
		else{
			colorName = attrObjects[i].shade + " " + attrObjects[i].color;
		}
		
		if(attributeColorMap.hasOwnProperty(colorName)){
			attributeColorMap[colorName].freq += 1;
		}
		else{
			attributeColorMap[colorName] = {"freq" : 1, "key": colorName};
		}
	}

	var arrayOfColors = [];

	for(var key in attributeColorMap){
		arrayOfColors.push({key:key, "freq":attributeColorMap[key].freq});
	}

	var sortedArrayOfColors = _.sortBy(arrayOfColors, 'freq');
	sortedArrayOfColors.reverse();
	outOf100(sortedArrayOfColors,'freq', function(sortedAndNormalizedArrayOfColors){

		callback(sortedAndNormalizedArrayOfColors);	
	});
	

}

var outOf100 = function(arr, valueToNormalize, cb){
	var total = 0;
	for(var i=0; i<arr.length;i++){
		total += arr[i][valueToNormalize];
	}

	for(var j=0;j<arr.length;j++){
		arr[j][valueToNormalize] = parseFloat(((arr[j][valueToNormalize]/total)*100).toFixed(2),10);
	}

	cb(arr);

}


