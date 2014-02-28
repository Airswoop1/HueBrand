var mongoose = require('mongoose'),
	bloom = require('./bloombergCompanies.js'),
	color = require('./color.js'),
	_  = require('underscore');

var emptyPayload = {
	queryType : '',
	topCountries : {},
	colorResult : {},
	topColors : {},
	industryResult:{}
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
						console.log(brandResultTopColor);

						var industryQuery = bloom.bloombergCompany.find({GICSIndName: eval("'"+brandResult.GICSIndName+"'")}).sort({marketCap: -1});
					
						industryQuery.exec(function(indErr, industryCompanies){
							if(indErr){
								console.log("There was an error! : " + err)
								res.render('landing', emptyPayload);
							}

							color.getTopColors(industryCompanies, brandResultTopColor, function(topColorErr, topIndustryCompaniesColors){

							//if the colors have yet to be defined
							if(typeof brandResult.associatedColors[0] !== 'undefined'){
											
											res.render('brand',{
												"queryType" : "brand",
												"topColors" : brandResult.associatedColors,
												"brandResult" : brandResult,
												"industryResult" : industryCompanies,
												"companyResult" : industryCompanies,
												"colorResult" : brandResultTopColor,
												"queryName" : req.params.query,
												"allCompanies" : bloom.AllCompanies,
												"topCountries" : {}
											});
									
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
