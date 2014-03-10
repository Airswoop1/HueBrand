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
	industryResult:{},
	searchType:''
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
							getTopColors(companies, mainColor, function(topColorsForIndustry){
								
								res.render('attribute', {
									"queryType" : "brand",
									"topColors" : sortedTopColorsWithData,
									"attributeResult" : attributeObj[0],
									"brandResult" : {},//brandResult,
									"industryResult" : {},//industry,
									"colorResult" : {},//colors,
									"queryName" : req.params.query,
									"allCompanies" : bloom.AllCompanies,
									"topCountries" : {},
									"topColorsForIndustry":{},
									"searchType" : "attribute"

								});
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

var getTopColors = function( colorCompanies, mainColor, callback ){

	var colorNameMap = [];


	//build object of {colorName : totalPercentage} for all colors that match the colorFamily
	for(var i=0; i<colorCompanies.length;i++){

		for(var aColor in colorCompanies[i].associatedColors){

			if(!(colorCompanies[i].associatedColors[aColor].colorPercentage === 'undefined')){
				if(colorNameMap.indexOf(colorCompanies[i].associatedColors[aColor].colorName)>=0)
				{
					colorNameMap[colorCompanies[i].associatedColors[aColor].colorName].colorPercentage += colorCompanies[i].associatedColors[aColor].colorPercentage;
				}
				else if(colorCompanies[i].associatedColors[aColor].colorFamily === mainColor.colorFamily)
				{
					colorNameMap[colorCompanies[i].associatedColors[aColor].colorName] = {
						"colorPercentage":colorCompanies[i].associatedColors[aColor].colorPercentage,
						"RrgbValue" : colorCompanies[i].associatedColors[aColor].RrgbValue,
						"GrgbValue" : colorCompanies[i].associatedColors[aColor].GrgbValue, 
						"BrgbValue" : colorCompanies[i].associatedColors[aColor].BrgbValue,
						"hValue" : colorCompanies[i].associatedColors[aColor].hValue,
						"sValue" : colorCompanies[i].associatedColors[aColor].sValue,
						"vValue" : colorCompanies[i].associatedColors[aColor].vValue,
						"lValue" : colorCompanies[i].associatedColors[aColor].lValue
					}
				}

			}
		}
	}

	var arrayOfColorNames = []
	//put these into an array for sorting
	for(var key in colorNameMap){
		arrayOfColorNames.push({"colorName":key, 
														"colorPercentage":colorNameMap[key].colorPercentage, 
														"RrgbValue" : colorNameMap[key].RrgbValue,
														"GrgbValue" : colorNameMap[key].GrgbValue, 
														"BrgbValue" : colorNameMap[key].BrgbValue,
														"hValue" : colorNameMap[key].hValue,
														"sValue" : colorNameMap[key].sValue,
														"vValue" : colorNameMap[key].vValue,
														"lValue" : colorNameMap[key].lValue 
													});
	}	
	//sort
	arrayOfColorNames.sort(function(x,y){
		return y["colorPercentage"] - x["colorPercentage"];
	})

	var topFiveColors = [];

	if(arrayOfColorNames.length>5)
	{
		topFiveColors = us.first(arrayOfColorNames,3);
		outOf100(topFiveColors, "colorPercentage", function(topFiveNormalized){
					callback(topFiveNormalized);			
		})

	}
	else if(arrayOfColorNames.length > 1)
	{
		outOf100(arrayOfColorNames, "colorPercentage", function(topNormalized){
			callback(topNormalized);
		})
	}
	else if(arrayOfColorNames.length === 1)
	{
		arrayOfColorNames[0].colorPercentage = 100;
		callback(arrayOfColorNames);
	}
	else
	{

		callback([{
			"colorName" : mainColor.colorName,
			"colorPercentage": 100, 
			"RrgbValue" : mainColor.RrgbValue,
			"GrgbValue" : mainColor.GrgbValue, 
			"BrgbValue" : mainColor.BrgbValue,
			"hValue" : mainColor.hValue,
			"sValue" : mainColor.sValue,
			"vValue" : mainColor.vValue,
			"lValue" : mainColor.lValue
		}])
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


