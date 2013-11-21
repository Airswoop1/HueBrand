var mongoose = require('mongoose');

exports.Color = mongoose.model('Color', new mongoose.Schema({

	colorId : String,
	colorName : String,
	colorFamily : String,
	rgbValue : String,
	labValue : String,
	shade : String,
	attributes : [String],
	complementaryColors : [String], //should these be names or Id's?
	swatchFileName : String,
	descriptionFileName : String

}));


var colors = [
	{colorId:1, colorName:'rose', colorFamily:'red', rgb:'206,70,118', labValue: null, shade:'light',attributes: ['happy','love', 'romantic', 'caring'], complementaryColors:['light blue', 'purple'], swatchFileName:'rose.png', descriptionFileName:'rose_desc.txt'},
	{colorId:2, colorName:'chartreuse', colorFamily:'yellow', rgbValue:'127,255,0', labValue:null, shade:'medium', attributes:['exciting', 'new', 'everlasting'], complementaryColors:['orange', 'blue'], swatchFileName:'chartreuse.png', descriptionFileName:'chartreuse_desc.txt' }
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
