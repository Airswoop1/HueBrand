var mongoose = require('mongoose'), 
	fs = require('fs'),
	csv = require('csv'),
	bloom = require('./bloombergCompanies.js'),
	color = require('./color.js'),
    brand = require('./brandapp.js'),
	_ = require('underscore');

var emptyPayload = {
	queryType : '',
	topCountries : {},
	colorResult : {},
	topColors : {},
	industryResult:{},
	searchType:'',
    'topColorsForIndustry':{},
    "topColorsPerCountry": {}
}

var attributes = new mongoose.Schema({
		industry : String,
		shade : String,
		color : String,
		country : String,
		attribute : String,
		description : String
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
						
							var topColor;
							if(sortedTopColorsWithData.length>=1){
								topColor = sortedTopColorsWithData[0]
							}
							else{
								topColor = sortedTopColorsWithData;
							}

							var companyQuery = bloom.bloombergCompany.find({associatedColors : {$elemMatch : {'colorFamily' : topColor.colorFamily, 'shade' : topColor.shade}}});//.limit(20)
							
							companyQuery.exec(function(compErr,companies){
                                brand.getTopColorsForIndustryByCountry(companies,function(topColorsByCountry){

                                    if(topColorsByCountry.length < 1){
                                        topColorsByCountry = undefined;
                                    }


                                    colorCombination(topColor,function(combos){

                                        if(combos == {}){
                                            combos = undefined;
                                        }

                                        getTopIndustries(companies, function(topIndustries){
                                            console.log("Top Colors By Country");
                                            console.log(topColorsByCountry);

                                            res.render('attribute', {
                                                "queryType" : "brand",
                                                "topColors" : sortedTopColorsWithData,
                                                "attributeResult" : attributeObj[0],
                                                "brandResult" : {},//brandResult,
                                                "industryResult" : companies,//industry,
                                                "colorResult" : {},//colors,
                                                "queryName" : req.params.query,
                                                "allCompanies" : bloom.AllCompanies,
                                                "topCountries" : {},
                                                "topColorsForIndustry":{},
                                                "topIndustries":topIndustries,
                                                "colorCombos" : combos,
                                                "topColorsPerCountry":topColorsByCountry,
                                                "searchType" : "attribute"

                                            });
                                        });
                                    });
                                });
							});
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

var getTopIndustries = function(companies, callback){

	var industryMap = [];
	
	for(var i=0;i<companies.length;i++){
		
		if(industryMap.hasOwnProperty(companies[i].GICSIndName)){
			industryMap[companies[i].GICSIndName].freq += 1;
		}
		else{
			var industryName = companies[i].GICSIndName;
			industryMap[industryName] = {"key":companies[i].GICSIndName, "freq":1};
		}
	}

	var arrayOfMappedIndustries = Array();

	for(var keys in industryMap){
		arrayOfMappedIndustries.push(industryMap[keys]);
	}

	var sortedArrayOfMappedIndustries = _.sortBy(arrayOfMappedIndustries, 'freq');

	if(sortedArrayOfMappedIndustries.length > 3 ){
		
		var topInds = _.last(sortedArrayOfMappedIndustries,3);

		outOf100(topInds, 'freq',function(obj){
			obj.reverse();
			callback(obj);	
		})
		
	}
	else{
		outOf100(sortedArrayOfMappedIndustries, 'freq', function(obj){
			obj.reverse();
			callback(obj);	
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
		topFiveColors = _.first(arrayOfColorNames,3);
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


function colorCombination(colorObject, cb) {

	var searchTerm = colorObject.shade + " " + colorObject.colorName;

	var doesCombinationExistQuery = color.colorCombinations.find({"colorName" : searchTerm});
	doesCombinationExistQuery.exec(function(err, combo){
		if(!err && combo.length){
			cb(combo.combinations);
		}
		else if(!err && combo.length===0){

			calculateCombination(colorObject, function(calcErr, combosObj){
				console.log(colorObject.colorName);

                if(!calcErr && combosObj.length){

					var newCombo = {
						colorName : colorObject.colorName,
						colorFamily : colorObject.colorFamily,
						shade : colorObject.shade,
						combinations : combosObj
					}
					var c = new color.colorCombinations(newCombo);
					c.save();

					cb(combosObj);
				}
				else{
					console.log("error on calculating the combination");
					console.log(calcErr);
					cb({});
				}
			})
		}
		else{
			console.log("There was an error on the color combinations query!");
			cb({});
		}

	})
}

function calculateCombination(cObj, callback){

	var colorShadeAndFamily = cObj.shade + " " + cObj.colorFamily;
	
	var companiesWithColorFamilyAndShadeQuery = bloom.bloombergCompany.find({associatedColors : {$elemMatch : {'colorFamily' : cObj.colorFamily, 'shade' : cObj.shade}}});//.limit(20)
	companiesWithColorFamilyAndShadeQuery.exec(function(err, matchesObj){

		if(!err && matchesObj.length){
			var colorComboMap = [];

			//iterate through each company
			for(var i=0; i<matchesObj.length;i++){
				var currentCompany = matchesObj[i];
				//then through each color of the company
				for(var j=0; j<currentCompany.associatedColors.length;j++){

					var currentColor = currentCompany.associatedColors[j];
					var colorDescriptor = currentColor.shade + " " + currentColor.colorFamily;

					//keep a map of all of the colors encountered and record the colorPercentage of each
					if(colorComboMap.hasOwnProperty(colorDescriptor)){
						colorComboMap[colorDescriptor].colorPercentage += currentColor.colorPercentage;
					}
					else if(colorDescriptor !== colorShadeAndFamily){
						colorComboMap[colorDescriptor] = {
							"key" : colorDescriptor,
							"colorPercentage" : currentColor.colorPercentage 
						}
					}

				}//for j
				
			}//for i 
			var arrayOfColorCombos = Array();

			for(var keys in colorComboMap){
				arrayOfColorCombos.push(colorComboMap[keys]);
			}

			//sort the list by colorPercentage
			var sortedColorComboMap = _.sortBy(arrayOfColorCombos, 'colorPercentage');

			//select the top 5 colors
			var topFiveSortedColorCombos = _.last(sortedColorComboMap,5);

			//normalize them
			outOf100(topFiveSortedColorCombos,'colorPercentage', function(sortedAndNormalizedTopFiveColorCombos){
				//get colorValues for each combo
				var newArray = Array();
				getBaseColorValues(sortedAndNormalizedTopFiveColorCombos, 0, newArray, callback)
			})

		}
		else{
			callback(err, matchesObj)
		}

	})

}

function getBaseColorValues(arr, index, arrayToReturn, cb){
	try{
		if(index === arr.length){
			cb(null, arrayToReturn);
		}
		else{
			var queriedColor = arr[index].key;
			var queriedColorPercentage = arr[index].colorPercentage;
			color.Color.findOne({'colorName' : queriedColor}, function(err, c){
				if(!err && c){
					arrayToReturn.push({
						"colorName" : queriedColor,
						"colorFamily" : c.colorFamily,
						"shade" : c.shade,
						"RrgbValue" : c.RrgbValue,
						"GrgbValue" : c.GrgbValue,
						"BrgbValue" : c.BrgbValue,
						"hValue" : c.hValue,
						"sValue" : c.sValue,
						"vValue" : c.vValue,
						"lValue" : c.lValue,
						"colorPercentage" : queriedColorPercentage
					})
					getBaseColorValues(arr, ++index, arrayToReturn, cb)
				}
				else{
					console.log("error matching the base color", err);
					getBaseColorValues(arr, ++index, arrayToReturn, cb)
				}
			})

		}
	}catch(e){
		console.log("error in base color matching",e);
		cb(e,null);
	}
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


