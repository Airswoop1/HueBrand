var mongoose = require('mongoose');
		bloom = require('./bloombergCompanies.js'),
		color = require('./color.js');

exports.Industry = mongoose.model('Industry', new mongoose.Schema({
	
	industryId : String,
	name: String,
	industrySize : Number,
	colors : [String], //should these be names or Id's?
	attributes :  [String],
	colorCombinations : [String],

}));

exports.queryIndustry = function(req,res){
try{
	if(!req.params.query){
			console.log("error! on /brand/query ");
			res.render('error',{})
		}
		else{


			var searchTerm = new RegExp(req.params.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), "i");

			bloom.bloombergCompany.find({ 'GICSIndName': searchTerm, logoFileName : {$exists : true} }, function(bloomErr, industryResult){
				
				if(bloomErr){
					console.log('brand query not found! ' + bloomErr);
					res.send(500, "Something broke!")
				}
				else{
					console.log(industryResult);

					getTopColorFromInd(industryResult, function(sortedTopColors){
						var limitedColors = sortedTopColors;
						if(sortedTopColors.length>4){
							limitedColors = [];
							for(var i=0;i<3;i++){
								limitedColors.push(sortedTopColors[i]);
							}
						}
						console.log("limited Colors ")
						console.log(limitedColors);
						res.render('industry',{
							"queryType" : "industry",
							"topColors" : limitedColors,
							"brandResult" : {},//brandResult,
							"industryResult" : industryResult,
							"colorResult" : {},//colors,
							"queryName" : req.params.query,
							'allCompanies' : bloom.AllCompanies,
							"topCountries" : {}
						})
					})
				}
			})
		}
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

var getTopColorFromInd = function( colorCompanies, callback ){

	var colorNameMap = [];

	//build object of {colorName : totalPercentage} for all colors that match the colorFamily
	for(var i=0; i<colorCompanies.length;i++){

		for(var aColor in colorCompanies[i].associatedColors){

			if(!(colorCompanies[i].associatedColors[aColor].colorPercentage === 'undefined')){
				if(colorNameMap.indexOf(colorCompanies[i].associatedColors[aColor].colorName)>=0)
				{
					colorNameMap[colorCompanies[i].associatedColors[aColor].colorName].colorPercentage += colorCompanies[i].associatedColors[aColor].colorPercentage;
				}
				else if(!(typeof colorCompanies[i].associatedColors[aColor].RrgbValue === 'undefined'))
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
		topFiveColors = arrayOfColorNames.slice(0,6);
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

		callback([])
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


