var mongoose = require('mongoose');

/************************
	Define Schema
************************/
exports.Brand = mongoose.model('Brand', new mongoose.Schema({

	brandName : String,
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
	associatedColors : [{ name: String, ratio: Number }],
	logoFileName : String,
	logoPotentialList : [String],
	logoHistory : [{ year : String, fileName : String }],
	brandManualFileName : String,
	website: String

}));


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
	exports.Brand.update({ brandName : name}, {$set: {logoPotentialList: logoURLs}}, function(err, numUpdated, raw){
		if(err){
			console.log("Error updating " + err);
		}
		console.log("The number of updated records is : " + numUpdated);
		console.log('The raw response from Mongo was ', raw);

	})
}

