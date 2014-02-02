var sys = require('sys')
var exec = require('child_process').exec;
var bloom = require('./bloombergCompanies.js');
var child;

var calcColorComposition = function(cObj, callback){
	var total = 0;
	var colorArray = [];
	var colorPercentageArray = [];
	var colors = cObj.images_from_euc;
	var listOfRemovals = [];
	var finalColorPercentageArray = [];

	try{


		for(var i=0;i< cObj.images_from_euc.length;i++){
			colorArray.push({
				colorName : cObj.images_from_euc[i]['name'].trim(),
				colorFamily : cObj.images_from_euc[i].family,
				RrgbValue : cObj.images_from_euc[i].sampled_r,
				GrgbValue : cObj.images_from_euc[i].sampled_g,
				BrgbValue : cObj.images_from_euc[i].sampled_b,
				hValue : cObj.images_from_euc[i].h,
				sValue : cObj.images_from_euc[i].s,
				vValue : cObj.images_from_euc[i].v,
				lValue : cObj.images_from_euc[i].l,
				shade : cObj.images_from_euc[i].light,
				colorPercentage : cObj.images_from_euc[i].count
			})
			total += cObj.images_from_euc[i].count;
		}

		for(var j=0;j< cObj.images_from_euc.length;j++){
			colorArray[j].colorPercentage = parseFloat(((colorArray[j].colorPercentage/total)*100).toFixed(2),10)
		}

		callback(null, {'associatedColors': colorArray});

	}catch(e){
		callback(e, null);
	}
}


exports.extract = function(index, logosList){
	if(	typeof logosList[index] !== 'undefined' &&
			typeof logosList[index].logoFileName !== 'undefined' &&
			logosList[index].logoFileName !== ''){
		console.log("Extracting color for: " + logosList[index].logoFileName );
	try{
		child = exec("python ./lib/colorExtraction/kevin_main.py " + eval('"'+logosList[index].logoFileName+'"'), function (error, stdout, stderr) {
			 if (error !== null) {
		    	console.log('exec error: ' + error);
		  	}
		  	else{
				var parsedOutput = JSON.parse(stdout);

				calcColorComposition(parsedOutput, function(err, updatedColorObjs){
					if(!err){
						
						bloom.bloombergCompany.findOneAndUpdate({ _id: logosList[index]._id }, updatedColorObjs, function(err, obj){
								if(!err){
									if(index < logosList.length ) exports.extract(index+1, logosList);
								}
								else{
									console.log("error saving color object to db");
									if(index < logosList.length ) exports.extract(index+1, logosList);	
								}
						})

					}
					else{
						console.log("There was an error extracting colors! " + err);
						if(index < logosList.length ) exports.extract(index+1, logosList);
					}
				});

		}
		});
	}catch(e){
		console.log("error extracting colors!");
		console.log(e);
		if(index < logosList.length ) exports.extract(index+1, logosList);
	}
	}
	else{
		if(index < logosList.length ) exports.extract(index+1, logosList);
	}
}