var mongoose = require('mongoose');

exports.Color = mongoose.model('Color', new mongoose.Schema({

	colorName : String,
	colorFamily : String,
	RrgbValue : Number,
	GrgbValue : Number,
	BrgbValue : Number,
	v1 : Number,
	v2 : Number,
	v3 : Number,
	v4 : Number,
	shade : String,
	attributes : [String],
	complementaryColors : [String], //should these be names or Id's?
	swatchFileName : String,
	descriptionFileName : String

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
