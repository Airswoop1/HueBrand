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
	desc: String

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