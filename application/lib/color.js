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

					//logos with similar colors
					var logoColorSearch = bloom.bloombergCompany.find({$and : [{'associatedColors.colorFamily': eval("'" + colorObj.colorFamily + "'") }, {logoFileName: {$exists:true}}]}).sort({'marketCap' : -1});//.limit(20)
					
					logoColorSearch.exec(function(err, companies){
						if(err){
							console.log("Error on color query for similar comapnies " + err);
						}
						else{
							
							getTopColors(companies, colorObj, function(sortedTopColors){
								getTopIndustries(companies, function(topIndustries){
									getTopCountries(colorObj, function(topCountries){

										//fake data
										/*sortedTopColors = [ { colorName: 'Yellow 1',
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
										
										topIndustries['Biotech'] = {key:'BioTech',"freq":100};

										topCountries = [
											{
												key: "US",
												"city" : 'New York',
												"freq": 20
											},
											{
												key : "IN",
												"city" : 'Mumbai',
												"freq":  10
											}
										];*/
										
										console.log("Top industries length : " + topIndustries.length)
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
										});
									});
								});
							});
						}

					});
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



var getTopIndustries = function(companies, callback){

	var industryMap = [];

	for(var i=0;i<companies.length;i++){
		if(industryMap.indexOf(companies[i].GICSSectorName)>=0)
		{
			industryMap[companies[i].GICSSectorName].freq ++;
		}
		else
		{

			industryMap[companies[i].GICSSectorName] = {"key":companies[i].GICSSectorName, "freq":1}
		}
	}

	industryMap.sort(function(x,y){
		return y - x;
	})

	if(industryMap.length > 3 ){
		var top3Industries = industryMap.slice(0,4);
		outOf100(top3Industries, 'freq',function(obj){
			callback(obj);	
		})
		
	}
	else{
		outOf100(industryMap,'freq', function(obj){
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
			arrayOfCountries.push({key:key, "freq":countryMap[key].freq});
		}

		arrayOfCountries.sort(function(x,y){
			return y['freq'] - x['freq']
		})

		callback(arrayOfCountries);

	})

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