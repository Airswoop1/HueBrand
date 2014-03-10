var mongoose = require('mongoose'),
	bloom = require('./bloombergCompanies.js'),
	color = require('./color.js'),
	_  = require('underscore');

var emptyPayload = {
	queryType : '',
	topCountries : {},
	colorResult : {},
	topColors : {},
	industryResult:{},
	searchType:''
}

exports.queryBrand = function(req,res){
try{
	if(!req.params.query){
			console.log("error! on /brand/query ");
			res.render('error',{})
		}
		else{
			var searchTerm = new RegExp(req.params.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), "i");

			bloom.bloombergCompany.find({ 'shortName': searchTerm, logoFileName : {$exists : true} }, function(bloomErr, b){
				
				if(bloomErr){
					console.log('brand query not found! ' + bloomErr);
					res.send(500, "Something broke!")
				}
				else{

					if(b.length>1){
						res.render('index', {
							potentialBrands : b
						})
					}
					else if(b.length === 1){
					
						var brandResult  = b[0];	
					
						var brandResultTopColor = _.max(brandResult.associatedColors,function(per){return per.colorPercentage})

						var industryQuery = bloom.bloombergCompany.find({"GICSIndName": eval("'"+brandResult.GICSIndName+"'"), "associatedColors.1":{$exists:true}}).sort({marketCap: -1});
					
						industryQuery.exec(function(indErr, industryCompanies){
							if(indErr){
								console.log("There was an error! : " + err)
								res.render('landing', emptyPayload);
							}

							getTopColorsForIndustry(industryCompanies, function(topIndustryCompaniesColors){
								console.log("topIndustryCompaniesColors:########################## ")
								console.log(topIndustryCompaniesColors);
							//if the colors have yet to be defined
							if(typeof brandResult.associatedColors[0] !== 'undefined'){
								var sortedBrandAssociatedColors = _.sortBy(brandResult.associatedColors, 'colorPercentage').reverse();
								getTopColorsForIndustryByCountry(industryCompanies, function(topColorsByCountry){

										res.render('brand',{
											"queryType" : "brand",
											"topColors" : sortedBrandAssociatedColors,
											"brandResult" : brandResult,
											"industryResult" : industryCompanies,
											"companyResult" : industryCompanies,
											"colorResult" : brandResultTopColor,
											"queryName" : req.params.query,
											"allCompanies" : bloom.AllCompanies,
											"topCountries" : topColorsByCountry,
											"topColorsForIndustry":topIndustryCompaniesColors,
											"searchType" : "brand"
										});
									})
									
							}
							else{
								console.log("Brand colors are undefined");
								res.render('landing', emptyPayload)
							}
						})//top colors
					})
					
				}// \else
				else{
					res.render('landing', emptyPayload )
				}
				}

			})//\ bloom.find()

		}// \else
	}
	catch(e){
		console.log("There was an error on the brandQuery!");
		console.log(e);
		res.render('landing',emptyPayload)
	}

}// end Of Function


function getTopColorsForIndustryByCountry(companies, callback){

	var countryArray = {};

	for(var i=0;i<companies.length;i++){
		var currentCompany = companies[i];
		var currentCountry = currentCountryompany.country;
		var currentCity = currentCompany.city;
		var currentColors = currentCompany.associatedColors;

		if(!countryArray.hasOwnProperty(currentCountry)){
			countryArray[currentCountry] = {
				"city": currentCity,
				"colors":[]
			}
		
		}
		for(var j=0;j<currentColors; j++){
			console.log(currentColors[j]);
			countryArray[currentCountry].colors.push(currentColors[j]);
		}
		

	}


	callback(countryArray)
}






function getTopColorsForIndustry(companies, callback){

	var colorsByGeography = {};

	var colorFamilyObjectMap = {};
    colorFamilyObjectMap["red"] = {"RrgbValue":undefined,"BrgbValue":undefined,"GrgbValue":undefined,"colorFamily":"red","colorPercentage":0};
    colorFamilyObjectMap["orange"] = {"RrgbValue":undefined,"BrgbValue":undefined,"GrgbValue":undefined,"colorFamily":"orange","colorPercentage":0};
    colorFamilyObjectMap["brown"] = {"RrgbValue":undefined,"BrgbValue":undefined,"GrgbValue":undefined,"colorFamily":"brown","colorPercentage":0};
    colorFamilyObjectMap["beige"] = {"RrgbValue":undefined,"BrgbValue":undefined,"GrgbValue":undefined,"colorFamily":"beige","colorPercentage":0};
    colorFamilyObjectMap["yellow"] = {"RrgbValue":undefined,"BrgbValue":undefined,"GrgbValue":undefined,"colorFamily":"yellow","colorPercentage":0};
    colorFamilyObjectMap["green"] = {"RrgbValue":undefined,"BrgbValue":undefined,"GrgbValue":undefined,"colorFamily":"green","colorPercentage":0};
    colorFamilyObjectMap["cyan"] = {"RrgbValue":undefined,"BrgbValue":undefined,"GrgbValue":undefined,"colorFamily":"cyan","colorPercentage":0};
    colorFamilyObjectMap["blue"] = {"RrgbValue":undefined,"BrgbValue":undefined,"GrgbValue":undefined,"colorFamily":"blue","colorPercentage":0};
    colorFamilyObjectMap["purple"] = {"RrgbValue":undefined,"BrgbValue":undefined,"GrgbValue":undefined,"colorFamily":"purple","colorPercentage":0};
    colorFamilyObjectMap["magenta"] = {"RrgbValue":undefined,"BrgbValue":undefined,"GrgbValue":undefined,"colorFamily":"magenta","colorPercentage":0};
    colorFamilyObjectMap["black"] = {"RrgbValue":undefined,"BrgbValue":undefined,"GrgbValue":undefined,"colorFamily":"black","colorPercentage":0};
    colorFamilyObjectMap["gray"] = {"RrgbValue":undefined,"BrgbValue":undefined,"GrgbValue":undefined,"colorFamily":"gray","colorPercentage":0};
    colorFamilyObjectMap["white"] = {"RrgbValue":undefined,"BrgbValue":undefined,"GrgbValue":undefined,"colorFamily":"white","colorPercentage":0};
    colorFamilyObjectMap["yellow/green"] = {"RrgbValue":undefined,"BrgbValue":undefined,"GrgbValue":undefined,"colorFamily":'yellow/green',"colorPercentage":0};


	for(var i=0; i<companies.length;i++){

		var currentCompany = companies[i];
		var currentColors = currentCompany.associatedColors;

		for(j=0; j< currentColors.length;j++){
			var currentColorFamily = currentColors[j].colorFamily;
			colorFamilyObjectMap[currentColorFamily].colorPercentage += currentColors[j].colorPercentage;
		}		
	}

	var sortedColorFamilyObjectMap = _.sortBy(colorFamilyObjectMap,'colorPercentage').reverse();

	addRgbData(0,sortedColorFamilyObjectMap,function(err, unNormalizedColorFamilyObjMap){

		outOf100(unNormalizedColorFamilyObjMap, 'colorPercentage', function(obj){
			callback(obj);
		}) 

	})
/*	for(var c in sortedColorFamilyObjectMap){
		sortedColorFamilyObjectMap[c] = addRgbData(sortedColorFamilyObjectMap[c]);
	}*/
	


	function addRgbData(index, cMap, callback){
		if(index === cMap.length){
			callback(null, cMap);
			return;
		}

		console.log("cmap[index]")
		console.log(cMap[index]);
		var colorMapObject = cMap[index];
		var cName = "medium "+colorMapObject.colorFamily;
		color.Color.findOne({"colorName":cName},function(err, doc){
			if(err){
				callback(err);
			}
			doc = doc.toObject();
			colorMapObject.RrgbValue = doc.RrgbValue;
			colorMapObject.GrgbValue = doc.GrgbValue;
			colorMapObject.BrgbValue = doc.BrgbValue;

			cMap[index] = colorMapObject;
			addRgbData(++index,cMap,callback);
		})

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


	