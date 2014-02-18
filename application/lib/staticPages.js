var emptyPayload = {
		queryType : '',
		topCountries : {},
		colorResult : {},
		topColors : {},
		industryResult:{}
	}

exports.about = function(req,res){
	res.render('about',emptyPayload);
}

exports.contact = function(req,res){
	res.render('contact', emptyPayload);
}

exports.landing = function(req,res){
	res.render('landing', emptyPayload)
}

exports.privacy = function(req, res){
	res.render('privacy', emptyPayload);
}

exports.terms = function(req, res){
	res.render('terms', emptyPayload)
}