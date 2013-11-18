var mongoose = require('mongoose');

exports.Industry = mongoose.model('Industry', new mongoose.Schema({
	
	name: String,
	industrySize : Number,
	colors : Array,
	attributes :  Array,
	colorCombinations : Array,

}));