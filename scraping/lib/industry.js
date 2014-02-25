var mongoose = require('mongoose');
var fs = require('fs');
var csv = require('csv');
var bloom = require('./bloombergCompanies.js');

exports.Industry = mongoose.model('Industry', new mongoose.Schema({
	
	industryId : String,
	name: String,
	industrySize : Number,
	colors : [String], //should these be names or Id's?
	attributes :  [String],
	colorCombinations : [String],

}));

var industries = [
	{industryId:1, name: 'Shipping', industrySize: 1230, colors:['yellow', 'brown'], attributes:['reliable', 'timely'], colorCombinations:[['brown', 'golden'],['red','yellow'],['purple', 'orange']]},
	{industryId:2, name: 'Beverage', industrySize: 600, colors:['red', 'blue'], attributes:['trustworthy', 'satisfying'], colorCombinations:[['red'],['red','blue']]}
]


exports.seed = function() {
	exports.Industry.remove({},function(err) {
	   console.log('industry collection dropped');
	for (var i = 0; i < industries.length; i++) {
		var ind = new exports.Industry(industries[i]);
		ind.save();
	}
	console.log("Database seeded with industries");
	});

}


exports.modifyIndustryNamesFromCSV = function(){


	var industryRenames = [];

	csv()
	.from.path(__dirname+'/industry_rename.csv', {delimiter: ','})
	.transform(function(row){
		row.unshift(row.pop());
		return row
	})
	.on('record', function(row, index){
		var newRow = row.join(",").split(",");

			var newName = newRow[1];	
			
			for(var i=2;i<newRow.length;i++){
				if(!(newRow[i]==='')){

					var oldIndName = newRow[i].replace('#',",")
 					
					industryRenames.push({
						"old_industry_name" : oldIndName,
						"new_industry_name" : newName
					})
				}
			}
			if(index == 49){
				
				updateBloomIndustry(0, industryRenames)
			}

	})
	.on('close', function(count){
		console.log("number of lines processed "+count)
	})
	.on('error', function(error){
		console.log("there was an error" + error.message)
	});





function updateBloomIndustry(index, indRenames){

	var old_name = indRenames[index].old_industry_name;
	var new_name = indRenames[index].new_industry_name
	bloom.bloombergCompany.update(
					{'GICSIndName': old_name},
					{'GICSIndName': new_name},
					{multi:true}, function(err, obj){
						if(err)
						{
							console.log(err);
							updateBloomIndustry(++index,indRenames)
						}
						else
						{
							console.log("updated ind name for " + old_name + " to " + new_name);
							updateBloomIndustry(++index,indRenames);
						}
					})


}

}
