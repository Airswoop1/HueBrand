var mongoose = require('mongoose');

/************************
	Define Schema
************************/
exports.Brand = mongoose.model('Brand', new mongoose.Schema({

	brandName : String,
	industryName : String,
	fortuneRank : Number,
	location : String,
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
	{ brandName: 'Coke', industryName: 'Beverages', fortuneRank: 24, location: 'Saratoga, FL', marketCap: 24.5, relativeSize: 'Large', yearFounded: 1928, stockSymbol: 'CC', parentCompany: 'self', associatedColors:[{name: 'Red', ratio: 0.88, }, {name:'White', ratio: 0.12}], logoFileName: 'cokeLogo.png', logoPotentialList: [{}], logoHistory: [{}], brandManualFileName: 'cokeBrandManual.pdf', website: 'www.coke.com'},
	{ brandName: 'UPS', industryName: 'Shipping', fortuneRank: 30, location: 'New York, NY', marketCap: 100.5, relativeSize: 'Large', yearFounded: 1955, stockSymbol: 'UPS', parentCompany: 'self', associatedColors:[{name: 'Brown', ratio: 0.90, }, {name:'Golden', ratio: 0.08}, {name: 'White', ratio: 0.02}], logoFileName: 'upsLogo.png', logoPotentialList: [{}], logoHistory: [{}], brandManualFileName: 'upsBrandManual.pdf', website: 'www.ups.com'}
]

//function for seeding database with fake data
exports.seed = function() {
	exports.Brand.remove({},function(err) {
	   console.log('collection dropped');
	});
	for (var i = 0; i < brands.length; i++) {
		var brand = new exports.Brand(brands[i]);
		brand.save();
	}
	console.log("Database seeded with brands");
}

