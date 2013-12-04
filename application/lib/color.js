var mongoose = require('mongoose');
var fs = require('fs');
var csv = require('csv');


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