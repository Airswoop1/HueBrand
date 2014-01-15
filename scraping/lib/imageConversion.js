var svg_to_png = require('svg-to-png');


exports.convertSVGs = function() {

	svg_to_png.convert(__dirname+"/../../application/public/logos/svg", __dirname+"/../../application/public/logos") // async, returns promise
	.then( function(){
		console.log("completed svg to png conversion");
	});

}