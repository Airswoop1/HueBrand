var csv = require('csv'),
		fs = require('fs'),
		util = require('util')
		mongoose = require('mongoose');

var attributes = new mongoose.Schema({
		industry : String,
		shade : String,
		color : String,
		country : String,
		attribute : String,
		description : String
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

exports.importAttributesWithoutCountries = function(){

	csv()
		.from.path(__dirname+'/attributes_without_countries.csv', {delimiter: ','})
		.transform(function(row){
			row.unshift(row.pop());
			return row
		})
		.on('record', function(row, index){

			var attrObj = {
				shade : row[0],
				color : row[2],
				attribute : row[1]
			}
			console.log(attrObj);
			var a = new exports.attributeModel(attrObj);
			a.save();

		})
		.on('close', function(count){
			console.log("number of lines processed "+count)
		})
		.on('error', function(error){
			console.log("there was an error" + error.message)
		});

}

exports.importAttributeDescriptionData = function(){
		var attributeDescObjectArray = [];
		csv()
		.from.path(__dirname+'/attribute_descriptions.csv', {delimiter: ','})
		.transform(function(row){
			row.unshift(row.pop());
			return row
		})
		.on('record', function(row, index){

			var descObj = {
				"attributeName": row[1],
				"desc" : row[0]
			}
			attributeDescObjectArray.push(descObj);

			if(index === 213){
				updateAttributeDescriptions(0,attributeDescObjectArray)
			}

		})
		.on('close', function(count){
			console.log("number of lines processed "+count)
		})
		.on('error', function(error){
			console.log("there was an error" + error.message)
		});
}


function updateAttributeDescriptions(i, attrDescList){
	if(i === attrDescList.length){
		console.log("DONE POPULATING ATTRIBUTES! ");
		return;
	}
	var attrName = attrDescList[i].attributeName;
	var attrDesc = attrDescList[i].desc;
	exports.attributeModel.update({"`":attrName},{"description":attrDesc}, function(err, doc){
		updateAttributeDescriptions(++i,attrDescList);
	})
}