var sys = require('sys')
var exec = require('child_process').exec;
var bloom = require('./bloombergCompanies.js');
var child;

exports.extract = function(index, logosList){
	if(logosList[index].logoFileName.indexOf(".svg")<0 && logosList[index].displayName !== 'Inditex' && logosList[index].displayName !== 'Sanofi' ){
		console.log("Extracting color for: " + logosList[index].logoFileName );
		child = exec("python ./lib/colorExtraction/kevin_main.py " + logosList[index].logoFileName, function (error, stdout, stderr) {
			 if (error !== null) {
		    	console.log('exec error: ' + error);
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
				bloom.bloombergCompany.findOneAndUpdate({ _id: logosList[index]._id }, { associatedColors: newColorObj }, function(err, obj){
					console.log("UPDATED COLORS FOR FIRST LOGO!!");
					if(index < logosList.length ) exports.extract(index+1, logosList);
				})
		}
		});
	}
	else{
		if(index < logosList.length ) exports.extract(index+1, logosList);
	}
}