var sys = require('sys')
var exec = require('child_process').exec;
var child;

exports.extract = function(logoFileName, callback){

	child = exec("python ./lib/colorExtraction/kevin_main.py " + logoFileName, function (error, stdout, stderr) {
		 if (error !== null) {
	    	console.log('exec error: ' + error);
			callback(error, null)
	  	}
	  	else{
			var parsedOutput = JSON.parse(stdout);

			var newColorObj = Array();

			for(var i=0;i<parsedOutput.images_from_polar.length;i++){
					newColorObj.push({
						colorName : parsedOutput.images_from_polar[i]['name'].trim(),
						colorFamily : parsedOutput.images_from_polar[i].family,
						RrgbValue : parsedOutput.images_from_polar[i].final_r,
						GrgbValue : parsedOutput.images_from_polar[i].final_g,
						BrgbValue : parsedOutput.images_from_polar[i].final_b,
						hValue : parsedOutput.images_from_polar[i].h,
						sValue : parsedOutput.images_from_polar[i].s,
						vValue : parsedOutput.images_from_polar[i].v,
						lValue : parsedOutput.images_from_polar[i].l,
						shade : parsedOutput.images_from_polar[i].light
					})
			}
			callback(null, newColorObj);
	}
	});

}