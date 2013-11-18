var mongoose = require('mongoose');

exports.Color = mongoose.model('Color', new mongoose.Schema({

	colorName : String,
	colorFamily : String,
	rgbValue : String,
	labValue : String,
	shade : String,
	attributes : [String],
	complementaryColors : [String],
	swatchFileName : String,
	descriptionFileName : String

}));

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
	logoHistory : [{ year : String, fileName : String }],
	brandManualFileName : String,
	website: String

}));

var brands  = [
	{_id: '001', brandName: 'Coke', industryName: 'Beverages', fortuneRank: 24, location: 'Saratoga, FL', marketCap: 24.5, relativeSize: 'Large', yearFounded: 1928, stockSymbol: 'CC', parentCompany: 'self', associatedColors:[{name: 'Red', ratio: 0.88, }, {name:'White', ratio: 0.12}], logoFileName: 'cokeLogo.png', logoHistory: [{}], brandManualFileName: 'cokeBrandManual.pdf', website: 'www.coke.com'},
	{_id: '002', brandName: 'UPS', industryName: 'Shipping', fortuneRank: 30, location: 'New York, NY', marketCap: 100.5, relativeSize: 'Large', yearFounded: 1955, stockSymbol: 'UPS', parentCompany: 'self', associatedColors:[{name: 'Brown', ratio: 0.90, }, {name:'Golden', ratio: 0.08}, {name: 'White', ratio: 0.02}], logoFileName: 'upsLogo.png', logoHistory: [{}], brandManualFileName: 'upsBrandManual.pdf', website: 'www.ups.com'}
]


exports.Industry = mongoose.model('Industry', new mongoose.Schema({
	
	name: String,
	industrySize : Number,
	colors : Array,
	attributes :  Array,
	colorCombinations : Array,

}));