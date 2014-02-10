var mongoose = require('mongoose'),
	bloom = require('./bloombergCompanies.js');

exports.queryBrand = function(req,res){

if(!req.params.query){
		console.log("error! on /brand/query ");
		res.render('error',{})
	}
	else{

		bloom.bloombergCompany.find({ 'shortName': eval("/" + req.params.query + "/i"), logoFileName : {$exists : true} }, function(bloomErr, b){
			
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
				else{
					var brandResults  = b[0];	
				
				
				var industryQuery = bloom.bloombergCompany.find({GICSIndName: eval("'"+brandResults.GICSIndName+"'")}).sort({marketCap: -1}).limit(10);
				
				industryQuery.exec(function(indErr, industry){
					if(indErr){
						console.log("There was an error! : " + err)
						res.send(500, "Something broke!")
					}
					console.log(brandResults);
					calculateTopIndustryColors(industry, function(topColorErr, topColors){

						//if the colors have yet to be defined
						if(typeof brandResults.associatedColors[0] !== 'undefined'){
							
							var colorQuery = bloom.bloombergCompany.find({'associatedColors.colorFamily': eval("'" + brandResults.associatedColors[0].colorFamily + "'") });

							colorQuery.exec(function(err, colors){
								if(err){
									console.log("There was an error! : " + err);
									res.send(500, "Something broke!");
									return;
								}

								res.render('brand',{
									"queryType" : "brand",
									"topColors" : topColorResult,
									"brandResult" : brandResults,
									"industryResult" : industry,
									"colorResult" : colors,
									"queryName" : req.params.query,
									allCompanies : bloom.AllCompanies,
									testName : 'Eugene'
								});
							})
						}
						else{
							res.send(500, "Something broke!")
						}
					

					})//top colors

				})
				
			}// \else
			}

		})//\ bloom.find()

	}// \else

}// end Of Function


var calculateTopIndustryColors = function(industryList,callback){

	callback(null);

}



