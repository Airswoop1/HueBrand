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
	searchType:'',
    'topColorsForIndustry':{},
    "topColorsPerCountry": {}
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

							//if the colors have yet to be defined
							if(typeof brandResult.associatedColors[0] !== 'undefined'){
								var sortedBrandAssociatedColors = _.sortBy(brandResult.associatedColors, 'colorPercentage').reverse();
								getTopColorsForIndustryByCountry(industryCompanies, function(topColorsByCountry){


                                        console.log("topColorsForIndustry:########################## ")
                                        console.log(topIndustryCompaniesColors);

										res.render('brand',{
											"queryType" : "brand",
											"topColors" : sortedBrandAssociatedColors,
											"brandResult" : brandResult,
											"industryResult" : industryCompanies,
											"companyResult" : industryCompanies,
											"colorResult" : brandResultTopColor,
											"queryName" : req.params.query,
											"allCompanies" : bloom.AllCompanies,
											"topColorsPerCountry" : topColorsByCountry,
                                            "topCountries":{},
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
		var currentCountry = currentCompany.country;
		var currentCity = currentCompany.city;
		var currentColors = currentCompany.associatedColors;

		if(!countryArray.hasOwnProperty(currentCountry)){
			countryArray[currentCountry] = {
				"city": currentCity,
				"colors": currentColors
			}

		}else{
            for(var j=0;j<currentColors.length; j++){
                countryArray[currentCountry].colors.push(currentColors[j]);
            }
            if(typeof countryArray[currentCountry].city === "undefined"){
                countryArray[currentCountry].city = currentCity;
            }

        }

	}

    var colorCountryArray = [];

    for(var c in countryArray){

        colorCountryArray.push({
            "key":c,
            "city":countryArray[c].city,
            "freq":{},
            "total":0
        });
    }

    populateColorCountryArray(0, countryArray,colorCountryArray, function(completedColorCountryArray){
        getTopColorsPerCountry(completedColorCountryArray, function(topCompletedColorCountryArray){
            callback(topCompletedColorCountryArray);
        })

    })

    function populateColorCountryArray(index, cMap, cArray, cb){

        if(index === cArray.length){
            cb(cArray);
            return;
        }

        var country = cArray[index].key;
        var currentArrayObj = cArray[index];

        for(var i=0;i<cMap[country].colors.length;i++){

            var currentColorFamily = cMap[country].colors[i].colorFamily;
            var currentShade = cMap[country].colors[i].shade;
            var currentColorPercentage = cMap[country].colors[i].colorPercentage;
            var currentColorName = currentShade + " " + currentColorFamily;
            var currentR = cMap[country].colors[i].RrgbValue;
            var currentG = cMap[country].colors[i].GrgbValue;
            var currentB = cMap[country].colors[i].BrgbValue;

            if(!currentArrayObj.freq.hasOwnProperty(currentColorName)){
                currentArrayObj.freq[currentColorName] = {};
                currentArrayObj.freq[currentColorName].colorFamily = currentColorFamily;
                currentArrayObj.freq[currentColorName].shade = currentShade;
                currentArrayObj.freq[currentColorName].colorPercentage = currentColorPercentage;
                currentArrayObj.freq[currentColorName].RrgbValue = currentR;
                currentArrayObj.freq[currentColorName].GrgbValue = currentG;
                currentArrayObj.freq[currentColorName].BrgbValue = currentB;

                currentArrayObj.total += currentColorPercentage;
            }
            else{
                currentArrayObj.freq[currentColorName].colorPercentage += currentColorPercentage;
                currentArrayObj.total += currentColorPercentage;
             }

        }

        cArray[index] = currentArrayObj;
        populateColorCountryArray(++index,cMap,cArray,cb);




    }


    function getTopColorsPerCountry(map, cb){

        for(var country in map ){

           var allColors = map[country].freq;
           map[country].topColor = {};

           var topColorPercentage = 0;
           var topColorObj = {};

           for(var color in allColors){
                if(allColors[color].colorPercentage >= topColorPercentage){
                    topColorPercentage = allColors[color].colorPercentage;
                    topColorObj = allColors[color];
                }
           }
           map[country].topColor = topColorObj;

        }

        cb(map);

    }




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

		var colorMapObject = cMap[index];
		var cName = "medium "+colorMapObject.colorFamily;
		color.Color.find({"colorName":cName},function(err, doc){
			if(err){
				callback(err);
			}

			//doc = doc.toObject();
            doc = doc[0];
			console.log(doc);
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


	
