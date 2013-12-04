var mongoose = require('mongoose');

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
	associatedColors : [{ name: String, ratio: Number }],
	logoFileName : String,
	logoPotentialList : [String],
	logoHistory : [{ year : String, fileName : String }],
	brandManualFileName : String,
	website: String

})

brandSchema.index({brandName: 1, location:{country:1}},{unique:true})

exports.Brand = mongoose.model('Brand', brandSchema );
