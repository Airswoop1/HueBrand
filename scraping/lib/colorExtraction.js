var sys = require('sys')
var exec = require('child_process').exec;
var bloom = require('./bloombergCompanies.js');
var child;

var calcColorComposition = function(cObj, callback){
	var total = 0;
	var colorArray = [];
	var colorPercentageArray = [];
	var colors = cObj.color_composition;
	var listOfRemovals = [];
	var finalColorPercentageArray = [];

	try{

		//build color percentage object and sum total for percentage calc
		for(var c in colors){
			for(var l in colors[c]){
				colorPercentageArray.push({
					cpColorFamily : c,
					cpShade : l,
					cpPercentage : colors[c][l]
				})
				total += colors[c][l];
			}
		}
		console.log(colorPercentageArray)

		//modify cpPercentage for percentage of total and keep track of those that are < 1
		for(var j=0;j<colorPercentageArray.length;j++){
			var cpercent = parseFloat(((colorPercentageArray[j].cpPercentage/total)*100),10);
			
			if(cpercent <= 1){
				console.log("not adding " + j);	
			}
			else{
				colorPercentageArray[j].cpPercentage =  parseFloat(cpercent.toFixed(2),10);
				finalColorPercentageArray.push(colorPercentageArray[j]);
			}
		}

		//build color object retreived from golden_units.csv
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
				shade : cObj.images_from_euc[i].light
			})
		}

		callback(null, {'associatedColors': colorArray, 'colorPercentages' : finalColorPercentageArray});

	}catch(e){
		callback(e, null);
	}
}


exports.extract = function(index, logosList){
	if(	typeof logosList[index] !== 'undefined' &&
			typeof logosList[index].logoFileName !== 'undefined' &&
			logosList[index].logoFileName.indexOf(".svg")<0 && 
			logosList[index].logoFileName.indexOf(".jpeg")<0 && 
			logosList[index].logoFileName.indexOf(".jpg")<0 &&
			logosList[index].logoFileName !== ''){
		console.log("Extracting color for: " + logosList[index].logoFileName );
		child = exec("python ./lib/colorExtraction/kevin_main.py " + logosList[index].logoFileName, function (error, stdout, stderr) {
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
	}
	else{
		if(index < logosList.length ) exports.extract(index+1, logosList);
	}
}