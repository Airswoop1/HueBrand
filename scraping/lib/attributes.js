var csv = require('csv'),
		fs = require('fs'),
		util = require('util')
		mongoose = require('mongoose');

var attributes = new mongoose.Schema({
		industry : String,
		shade : String,
		color : String,
		country : String,
		attribute : String
});

exports.attributeModel = mongoose.model('attributes', attributes);

/*
File : color_country_attributes.csv
Assumes file headers are industry, shade, color, country, attribute
*/
exports.importAttributeData = function (){
	csv()
		.from.path(__dirname+'/color_country_attributes.csv', {delimiter: ','})
		.transform(function(row){
			row.unshift(row.pop());
			return row
		})
		.on('record', function(row, index){
			if(index == 0){
				//skip 1st row
			}
			else{
				var attrObj = {
					industry : row[1],
					shade : row[2],
					color : row[3],
					country : row[4],
					attribute : row[5]
				}
				var a = new exports.attributeModel(attrObj);
				a.save();

			}

		})
		.on('close', function(count){
			console.log("number of lines processed "+count)
		})
		.on('error', function(error){
			console.log("there was an error" + error.message)
		});


}