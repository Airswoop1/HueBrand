var mongoose = require('mongoose');

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


