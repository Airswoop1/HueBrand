var mongoose = require('mongoose'), 
	fs = require('fs'),
	csv = require('csv'),
	bloom = require('./bloombergCompanies.js'),
	us = require('underscore');

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
	slValue : Number,
	shade : String,
	isBase : Boolean,
	attributes : [String],
	complementaryColors : [String], //should these be names or Id's?
	swatchFileName : String,
	descriptionFileName : String,
	
}));

exports.colorCombinations = mongoose.model('colorCombinations', new mongoose.Schema({

	colorName : String,
	colorFamily : String,
	shade : String,
	combinations : [{
		colorName : String,
		colorFamily : String,
		shade : String,
		RrgbValue : Number,
		GrgbValue : Number,
		BrgbValue : Number,
		hValue : Number,
		sValue : Number,
		vValue : Number,
		lValue : Number,
		slValue : Number,
		colorPercentage : Number
	}],
	dateModified : { type: Date, default: Date.now }


})) 

exports.queryColor = function(req,res){

	try{
		if(!req.params.query){
			console.log("error! on /color/query ");
			res.render('error',{})
		}
		else{
			var searchTerm = new RegExp(req.params.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), "i");
			exports.Color.findOne({ 'colorName': searchTerm}, function(err, c){
				console.log(c);
				if(err){
					console.log('color query not found! ' + err);
					res.send(500, "Something broke with the color query!")
				}
				else{
					colorObj = c;
				
					//logos with similar colors
					var logoColorSearch = bloom.bloombergCompany.find({$and : [{'associatedColors.colorFamily': eval("'" + colorObj.colorFamily + "'") }, {logoFileName: {$exists:true}}]}).sort({'marketCap' : -1});//.limit(20)
					
					logoColorSearch.exec(function(err, companies){
						if(err){
							console.log("Error on color query for similar comapnies " + err);
						}
						else{
							
							exports.getTopColors(companies, colorObj, function(sortedTopColors){
								getTopIndustries(companies, function(topIndustries){
									getTopCountries(colorObj, function(topCountries){
										colorCombination(colorObj, function(combos){					
											
											/*console.log("colorResult");
											console.log(colorObj);
											console.log("companyResult + industryResult");
											console.log(companies);
											console.log("topColors");
											console.log(sortedTopColors);
											console.log("topIndustries");
											console.log(topIndustries);
											console.log("topCountries");
											console.log(topCountries);*/

											res.render('color',{
												"queryType" : "color",
												"colorResult" : colorObj,
												"companyResult" : companies,
												"queryName" : req.params.query,
												"industryResult" : companies,
												"allCompanies" : {},
												"brandResult" : {},
												"topColors" : sortedTopColors,
												"topIndustries" : topIndustries,
												"topCountries" : topCountries,
												"colorCombos" : combos
											});
										});
									});
								});
							});
						}

					});
				}
			})
		
		}// \else
	}
	catch(e){
		console.log("There was an error on the colorQuery!");
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

	var sortedArrayOfMappedIndustries = us.sortBy(arrayOfMappedIndustries, 'freq');

	if(sortedArrayOfMappedIndustries.length > 3 ){
		
		var topInds = us.last(sortedArrayOfMappedIndustries,3);

		outOf100(topInds, 'freq',function(obj){
			callback(obj);	
		})
		
	}
	else{
		outOf100(sortedArrayOfMappedIndustries, 'freq', function(obj){
			callback(obj);	
		})
		
	}

}

var getTopCountries = function(colorObject, callback){

	bloom.bloombergCompany.find({$and : [{'associatedColors.colorFamily': eval("'" + colorObj.colorFamily + "'")},
																			 {'associatedColors.shade': eval("'" + colorObj.shade + "'")}]}, function(err, obj){
		var countryMap = [];
		for(var i=0;i<obj.length;i++){
			if(countryMap.indexOf(obj[i].country)>=0){
				countryMap[obj[i].country].freq += 1;
			}
			else{
				countryMap[obj[i].country] = {"freq" : 1, 'city' : obj[i].city }
			}
		}

		var arrayOfCountries = [];

		for(var key in countryMap){
			arrayOfCountries.push({key:key, "freq":countryMap[key].freq, "city" : countryMap[key].city});
		}

		arrayOfCountries.sort(function(x,y){
			return y['freq'] - x['freq']
		})

		callback(arrayOfCountries);

	})

}

exports.getTopColors = function( colorCompanies, mainColor, callback ){

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

function colorCombination(colorObject, cb) {

	var searchTerm = colorObject.shade + " " + colorObject.colorName;

	var doesCombinationExistQuery = exports.colorCombinations.find({"colorName" : searchTerm});
	doesCombinationExistQuery.exec(function(err, combo){
		if(!err && combo.length){
			cb(combo.combinations);
		}
		else if(!err && combo.length===0){

			calculateCombination(colorObject, function(calcErr, combosObj){
				if(!calcErr && combosObj.length){

					var newCombo = {
						colorName : colorObject.colorName,
						colorFamily : colorObject.colorFamily,
						shade : colorObject.shade,
						combinations : combosObj
					}
					var c = new exports.colorCombinations(newCombo);
					c.save();

					cb(combosObj);
				}
				else{
					console.log("error on calculating the combination");
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
			var sortedColorComboMap = us.sortBy(arrayOfColorCombos, 'colorPercentage');

			//select the top 5 colors
			var topFiveSortedColorCombos = us.last(sortedColorComboMap,5);

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
			exports.Color.findOne({'colorName' : queriedColor}, function(err, c){
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