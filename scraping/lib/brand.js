var mongoose = require('mongoose');
var csv = require('csv');
var request = require('request');
var fs = require('fs');
var bloom = require('./bloombergCompanies.js');

/************************
	Define Schema
************************/

var brandSchema = new mongoose.Schema({

	brandName : {type: String},
	industryName : String,
	fortuneRank : Number,
	location : {	
		address: String,
		city: String,
		state: String,
		zip: Number,
		country: String
	},
	marketCap : Number,
	relativeSize : String, //Startup?, Small, Medium, or Large
	yearFounded : Number,
	stockSymbol : String,
	parentCompany : String,
	associatedColors : [{ name: String, ratio: Number, colorFamily: String }],
	logoFileName : String,
	logoPotentialList : [String],
	logoHistory : [{ year : String, fileName : String }],
	brandManualFileName : String,
	website: String

})

brandSchema.index({brandName: 1, location:{country:1}},{unique:true})

exports.Brand = mongoose.model('Brand', brandSchema );



//sample data for testing
var brands  = [
	{ brandName: 'Coke', industryName: 'Beverages', fortuneRank: 24, location: {address:'',city:'Saratoga',state:'FL',zip:null, country: 'United States'}, marketCap: 24.5, relativeSize: 'Large', yearFounded: 1928, stockSymbol: 'CC', parentCompany: 'self', associatedColors:[{name: 'red', ratio: 0.88, }, {name:'white', ratio: 0.12}], logoFileName: 'cokeLogo.png', logoPotentialList: [{}], logoHistory: [{}], brandManualFileName: 'cokeBrandManual.pdf', website: 'www.coke.com'},
	{ brandName: 'UPS', industryName: 'Shipping', fortuneRank: 30, location: {address:'',city:'Saratoga',state:'FL',zip:null, country: 'United States'}, marketCap: 100.5, relativeSize: 'Large', yearFounded: 1955, stockSymbol: 'UPS', parentCompany: 'self', associatedColors:[{name: 'brown', ratio: 0.90, }, {name:'chartreuse', ratio: 0.08}, {name: 'white', ratio: 0.02}], logoFileName: 'upsLogo.png', logoPotentialList: [{}], logoHistory: [{}], brandManualFileName: 'upsBrandManual.pdf', website: 'www.ups.com'}
]

//function for seeding database with fake data
exports.seed = function() {
	exports.Brand.remove({},function(err) {
	   console.log('brand collection dropped');
	for (var i = 0; i < brands.length; i++) {
		var brand = new exports.Brand(brands[i]);
		brand.save();
	}
	console.log("Database seeded with brands");
	});

}

exports.addPotentialLogos = function(name, logoURLs){
	exports.Brand.update({ brandName : name}, {$pushAll: {logoPotentialList: logoURLs}}, function(err, numUpdated, raw){
		if(err){
			console.log("Error updating " + err);
		}
		console.log("The number of updated records for " + name + " is : " + numUpdated);
		console.log('The raw response from Mongo was ', raw);

	})
}

exports.addBrands = function(brandsList){
	
	exports.Brand.create(brandsList, function(err){
		if(err) console.log("Something went wrong!!" + err);
		else console.log("Success in storing brands to db! : " + arguments[1]);
	})
}

exports.storeMarketCap = function(companyID, mktCap){
	exports.Brand.update({ _id : companyID }, {marketCap : mktCap}, function(err, numUpdated, raw){
		if(err){
			console.log("Error updating " + err);
		}
		else{
			console.log("updated market cap " + raw);
		}

	});
}


exports.importBrandManuals = function() {
	var brandManualObject = [];
	var i=0;
	var errArray=[];

	csv()
	.from.path(__dirname+'/brandmanuals.csv', {delimiter: ','})
	.transform(function(row){
		row.unshift(row.pop());
		return row
	})
	.on('record', function(row, index){
		var newRow = row.join(",").split(",");
		var brandObject = {}

		brandObject['shortName'] = newRow[1];
		brandObject['url'] = newRow[0];
		brandManualObject.push(brandObject);


		i++;
		if(i===250){
			convertUrlsToManuals(0,brandManualObject,errArray);
		}
	})
	.on('close', function(count){
		console.log("number of lines processed "+count)
	})
	.on('error', function(error){
		console.log("there was an error" + error.message)
	});

	function convertUrlsToManuals(index,brandManualObject, errArray){
		if(index===251){
			console.log("completed brand manual download!");
			console.log(errArray);
			return;
		}

		var url = brandManualObject[index].url;
		var brand = brandManualObject[index].shortName;
		console.log(url + " for brand " + brand);
		request(url, function(error, response, body){
			if(typeof response !== "undefined" && response.statusCode === 200){
				
				var head = response.headers['content-type'];

				var splitURL = url.split('.');
				var fileExtension = splitURL[splitURL.length-1];
				
				if(head==='application/pdf'){
					fileExtension = '.pdf'

					var fileName = brand.replace(/[^a-zA-Z 0-9]+/g,'').toLowerCase().split(' ').join('_') + "."+ fileExtension;

					var ws = request(url).pipe(fs.createWriteStream('../application/public/brandManuals/'+fileName));

					ws.on('close', function(){

						bloom.bloombergCompany.update({'shortName':brand},{'brandManualFileName':fileName},function(err, doc){
							convertUrlsToManuals(++index,brandManualObject,errArray);	
						});			
					});
				}
				else{
					bloom.bloombergCompany.update({'shortName':brand},{'brandManualWebURL':url},function(err, doc){
							convertUrlsToManuals(++index,brandManualObject,errArray);	
					});		
				}
				
			}
			else{
				console.log(brand);
				errArray.push(brand);
				convertUrlsToManuals(++index,brandManualObject,errArray)
			}
		})


	}
}

