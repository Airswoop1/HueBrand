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

		if(index>0 && (newRow.length>1) && !(newRow[2]==='')){

			var newName = newRow[1];	
			
			for(var i=2;i<newRow.length;i++){
				if(!(newRow[i]==='')){
					industryRenames.push({
						"old_industry_name" : newRow[i],
						"new_industry_name" : newName
					})
				}
			}
			if(index == 72){
				updateBloomIndustry(0, industryRenames)
			}
		}

	})
	.on('close', function(count){
		console.log("number of lines processed "+count)
	})
	.on('error', function(error){
		console.log("there was an error" + error.message)
	});





function updateBloomIndustry(index, indRenames){

	if(!(typeof indRenames[index].old_industry_name === 'undefined') && !(typeof indRenames[index].new_industry_name === 'undefined')){

		bloom.bloombergCompany.update(
					{'GICSIndName': indRenames[index].old_industry_name},
					{'GICSIndName': indRenames[index].new_industry_name},
					{multi:true}, function(err, obj){
						if(err)
						{

							console.log("error writing industry to the db for " + indRenames[index].old_industry_name);
							console.log(err);
							updateBloomIndustry(++index,indRenames)
						}
						else
						{
							
							console.log("updated ind name for " + indRenames[index].old_industry_name);
							updateBloomIndustry(++index,indRenames);
						}
					})
	}
	else{
		updateBloomIndustry(++index,indRenames);

	}	


}

}
