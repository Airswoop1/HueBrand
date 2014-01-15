var mongoose = require('mongoose');
var csv = require('csv')

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
	logoPotentialList : [{ year : String, fileName : String }],
	logoHistory : [{ year : String, fileName : String }],
	brandManualFileName : String,
	displayName : String

})
//lost 372 companies due to duplicates***
bloombergComp.index({shortName: 1},{unique:true})

exports.bloombergCompany = mongoose.model('bloombergCompany', bloombergComp );


exports.populate = function(){

	csv()
	.from.path(__dirname+'/companies.csv', {delimiter: ','})
	.transform(function(row){
		row.unshift(row.pop());
		return row
	})
	.on('record', function(row, index){
		if(index===0){

		}
		else{
		var companyObj = {
			stockSymbol: row[1],
			shortName: row[2],
			GICSSector: row[3],
			GICSInd: row[4],
			GICSSubInd: row[5],
			website: row[6],
			teleNum: row[7],
			parseCompanyName: row[8],
			//yearFnd: row[9],
			city: row[10],
			parentCompany: row[11],
			IPODate: row[12],
			marketCap: row[13],
			marketCapRank: row[14],
			GICSSectorName: row[15],
			GICSIndName: row[16],
			GICSSubIndName: row[17],
			country: row[18],
			state: row[19],
			desc: row[0]
			}

			var c = new exports.bloombergCompany(companyObj);
			c.save();
		}
	})
	.on('close', function(count){
		console.log("number of lines processed "+count)
	})
	.on('error', function(error){
		console.log("there was an error" + error.message)
	});
	console.log("db seeded with bloomberg companies!"); 

}

function toTitleCase(str)
{
    return str.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

exports.modifyName = function(){
	
	var stream = exports.bloombergCompany.find({displayName : {$exists: false}}).sort({marketCap: -1}).stream()
	stream.on('data', function (doc) {
	  stream.pause()
	 console.log(doc.shortName);
	  var str = toTitleCase(doc.shortName);
	  doc.displayName = str;

	  doc.save(function(err){
	  	if(err) console.log("Error! " + err)
	  	console.log("updated : " + str);
	  	stream.resume();
	  })

	  
	}).on('error', function (err) {
	  // handle the error
	}).on('close', function () {
	  // the stream is closed
	});

}

function escapeRegExpChars(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

exports.bloombergQuery = function(logopediaName, callback){
	try{
		var lName = escapeRegExpChars(logopediaName).replace('/','\\/');

		var bloomQuery = exports.bloombergCompany.find({'shortName': eval("/" + lName + "/i")})

		bloomQuery.exec(function(err, obj){

				if(obj.length >= 1){
					callback(obj);
				}
				else{
					callback(null);
				}

			})
		}
		catch(e){
			callback(null);
		}
}

exports.bloombergUpdate = function(sName, logosArr){
	exports.bloombergCompany.findOneAndUpdate()
}
