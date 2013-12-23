var mongoose = require('mongoose');

var bloombergComp = new mongoose.Schema({

	stockSymbol: String,
	shortName: String,
	GICSSector: Number,
	GICSInd: Number,
	GICSSubInd: Number,
	website: String,
	teleNum: String,
	parseCompanyName: String,
	yearFnd: String,
	city: String,
	parentCompany: String,
	IPODate: String,
	marketCap: Number,
	marketCapRank: Number,
	GICSSectorName: String,
	GICSIndName: String,
	GICSSubIndName: String,
	country: String,
	state: String,
	desc: String,
	associatedColors : [{
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
	}],
	//primary color?
	logoFileName : String,
	logoPotentialList : [String],
	logoHistory : [{ year : String, fileName : String }],
	brandManualFileName : String,
	displayName : String

})
//lost 372 companies due to duplicates***
bloombergComp.index({shortName: 1},{unique:true})

exports.bloombergCompany = mongoose.model('bloombergCompany', bloombergComp );