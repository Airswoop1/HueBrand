/** Modules **/
var brand = require('./brand.js'),
		color = require('./color.js'),
		industry = require('./industry.js'),
		scrape = require('./scrape.js'),
		bloom = require('./bloombergCompanies.js'),
		colorExtract = require('./colorExtraction.js'),
		imageDownload = require('./imageDownload.js'),
		attributes = require('./attributes.js'),
		imageConv = require('./imageConversion.js');

var io;

exports.setIO = function(my_io){
	io = my_io;


/******
Setup for /logosSelection route
*******/
var logopediaArray = []
//Query db for all logopedia documents that have logosData and don't have a bloombergMatch
var logosQ = scrape.logopediaModel.find({$and: [{logosData :{$not :{$size : 0 }}}, {bloombergMatch: {$exists:false}}]});
logosQ.exec(function(err, obj){
	if(err){
		console.log("error populating logopedias array " + err);
	}
	else{
		//store results in logopediaArray
		logopediaArray = obj;
		console.log("logopedias array populated!");
	}
	
})



var index = -1;
//io.set('log level', 1);
//set up socket connections

io.sockets.on('connection', function(socket){
	
	socket.on('next-logo', function(data){
		//send next logopedia/bloomberg matches
		console.log('next-logo called!!');
		index++;

		//callback for bloom.bloombergQuery
		var getLogos = function(retObj){
			if(!retObj){
				console.log("no match found!");		
				var updateCondition = {
					'logoName' : logopediaArray[index].logoName,
					'logoURL' : logopediaArray[index].logoURL
				}
				var update = {
					'bloombergMatch' : 'N'
				}
				scrape.logopediaModel.findOneAndUpdate(updateCondition, update, function(err){
					if(err){ 
						console.log("Cannot store in logopedia db " + err);
					}
					else{
						console.log("stored no match to logopedia db!");
						bloom.bloombergQuery(logopediaArray[++index].logoName, getLogos);

					}
				});
			}
			else{
				if(retObj.length === 1){
					console.log("saving match to the db!");
					var updateCondition = {
						'logoName' : logopediaArray[index].logoName,
						'logoURL' : logopediaArray[index].logoURL
					}
					var update = {
						'bloombergMatch' : retObj[0].shortName
					}
					scrape.logopediaModel.findOneAndUpdate(updateCondition, update, function(err){
						if(err){ 
							console.log("Cannot store in logopedia db " + err);
						}
						else{
							console.log("stored no match to logopedia db!");
							bloom.bloombergQuery(logopediaArray[++index].logoName, getLogos);

						}
					});
				}
				else{
					console.log("sending logo to the page for " +  logopediaArray[index].logoName)
					socket.emit('new-logo', {
						logopediaTitle : logopediaArray[index].logoName,
						logopediaURL : logopediaArray[index].logoURL,
						bloombergCompanies : retObj
					});
				}
			}
		}

		/*query bloomberg database to search if any logoName in the logopediaArray
			matches a shortName in the bloom model
		*/
		bloom.bloombergQuery(logopediaArray[index].logoName, getLogos);

	});
	

	socket.on('database-search', function(data){
		//search database for potential matches when logopedia search against bloomberg doesn't come up with good option
		var getOtherLogos = function(retObj){
			if(!retObj){
				socket.emit('no-query-response',{})
			}
			else{
				socket.emit('new-query-response',{
					'newQ' : retObj
				})
			}
		}

		bloom.bloombergQuery(data.query, getOtherLogos)

	});

	socket.on('match', function(data){
		//take match from logoSelection and store match in logopedias collection
		console.log("we have a match " + util.inspect(data));
		var updateCondition = {
			'logoName' : data.logopediaTitle,
			'logoURL' : data.logopediaURL
		}
		var update = {
			'bloombergMatch' : data.bloombergMatch.shortName,
			'logoType' : data.logoType
		}
		//update logopediaModel for match
		scrape.logopediaModel.findOneAndUpdate(updateCondition, update, function(err){
			if(err){ 
				console.log("Cannot store in logopedia db " + err);
			}
			else{
				console.log("stored match to logopedia db!");
				//next-logo called from client to iterate to next logo
			}
		});

	});

	socket.on('no-match', function(data){
		//no match on logopedia logoName with bloomberg shortName
		console.log("we don't have a match for " + data.logopediaTitle);
		var updateCondition = {
			'logoName' : data.logopediaTitle,
			'logoURL' : data.logopediaURL
		}
		var update = {
			'bloombergMatch' : 'N'
		}
		//update logopediaModel with bloombergMatch  = 'N'
		scrape.logopediaModel.findOneAndUpdate(updateCondition, update, function(err){
			if(err){ 
				console.log("Cannot store in logopedia db " + err);
			}
			else{
				console.log("stored no match to logopedia db!");
				//next-logo called from client to iterate to next logo
			}
		});
	})

	socket.on('disconnect', function(data){
		//close 
	})
	socket.emit('connect', {});
})
}