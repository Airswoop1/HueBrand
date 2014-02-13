var mongoose = require('mongoose');
var fs = require('fs');
var csv = require('csv');
var bloom = require('./bloombergCompanies.js');


exports.Color = mongoose.model('Color', new mongoose.Schema({

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
	

}));


var colors = [
	{ colorName:'rose', colorFamily:'red', RrgbValue:127,GrgbValue:223,BrgbValue:2, shade:'light',attributes: ['happy','love', 'romantic', 'caring'], complementaryColors:['light blue', 'purple'], swatchFileName:'rose.png', descriptionFileName:'rose_desc.txt'},
	{ colorName:'chartreuse', colorFamily:'yellow', RrgbValue:127,GrgbValue:123,BrgbValue:0, shade:'medium', attributes:['exciting', 'new', 'everlasting'], complementaryColors:['orange', 'blue'], swatchFileName:'chartreuse.png', descriptionFileName:'chartreuse_desc.txt' }
]

exports.seed = function() {
	exports.Color.remove({},function(err) {
	   console.log('color collection dropped');
	   for (var i = 0; i < colors.length; i++) {
			var color = new exports.Color(colors[i]);
			color.save();
		}
		console.log("Database seeded with colors");
	});
	
}

exports.populate = function(){
	var colorArray = Array();
	csv()
	.from.path(__dirname+'/golden_units.csv', {delimiter: ','})
	.transform(function(row){
		row.unshift(row.pop());
		return row
	})
	.on('record', function(row, index){
		var newRow = row.join(",").split(",");
		
		var colorObj = {
			shade : newRow[0],
			colorName : newRow[1].trim(),
			RrgbValue : newRow[2],
			GrgbValue : newRow[3],
			BrgbValue : newRow[4],
			hValue : newRow[5],
			sValue : newRow[6],
			vValue : newRow[7],
			lValue : newRow[8],
			colorFamily :  newRow[9]
			}
		var c = new exports.Color(colorObj);
		c.save();

	})
	.on('close', function(count){
		console.log("number of lines processed "+count)
	})
	.on('error', function(error){
		console.log("there was an error" + error.message)
	});
	console.log("db seeded with colors!"); 
}

exports.importColorsFromCSV = function(){

	var colorArray = Array();
	csv()
	.from.path(__dirname+'/logo_colors_1.csv', {delimiter: ','})
	.transform(function(row){
		row.unshift(row.pop());
		return row
	})
	.on('record', function(row, index){
		var newRow = row.join(",").split(",");
		var fileName = newRow[1];

		var colorObject = {		
			
			"colorName" : newRow[2],
			"colorFamily" : newRow[3],
			"RrgbValue" : newRow[5],
			"GrgbValue" : newRow[6],
			"BrgbValue" : newRow[7],
			"hValue" : newRow[11],
			"sValue" : newRow[12],
			"vValue" : newRow[13],
			"lValue" : newRow[14],
			"shade" : newRow[4],
			"colorPercentage" : newRow[0]

		}

		bloom.bloombergCompany.update(
			{'logoFileName':fileName},
			{$push:{"associatedColors":colorObject}},
			{}, function(err, obj){
				if(err)
				{
					console.log("error writing color to the db");
					return;
				}
				else
				{
					console.log(obj);	
					console.log("updated colors for " + fileName);
				}
			})


	})
	.on('close', function(count){
		console.log("number of lines processed "+count)
	})
	.on('error', function(error){
		console.log("there was an error" + error.message)
	});
	console.log("db updated companies with colors"); 


}
