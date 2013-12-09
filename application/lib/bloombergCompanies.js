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
		colorName: String,
		ratio: Number, 
		colorFamily: String,
		RrgbValue: Number,
		GrgbValue: Number,
		BrgbValue: Number,
		hValue: Number,
		sValue: Number,
		lValue: Number,
		vValue: Number,
		shade: String
		}],
	logoFileName : String,
	logoPotentialList : [String],
	logoHistory : [{ year : String, fileName : String }],
	brandManualFileName : String,

})

bloombergComp.index({shortName: 1},{unique:true})

exports.bloombergCompany = mongoose.model('bloombergCompany', bloombergComp );
