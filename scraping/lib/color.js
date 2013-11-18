var mongoose = require('mongoose');

exports.Color = mongoose.model('Color', new mongoose.Schema({

	colorName : String,
	colorFamily : String,
	rgbValue : String,
	labValue : String,
	shade : String,
	attributes : [String],
	complementaryColors : [String],
	swatchFileName : String,
	descriptionFileName : String

}));
