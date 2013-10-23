var settings = {};

exports.updateSettings = function(twitterId,data) {
	settings[twitterId] = {
		id: twitterId,
		theme: 'adfero_b',
		account: data
	}
	return settings[twitterId];
};

exports.fetchSettings = function(twitterId,callback) {
	callback(settings[twitterId]);
}

exports.routeAccount = function(req,res) {
	if (req.session.twitterId != null) { 
		res.setHeader('Content-Type', 'application/json');
		res.send({
			id: req.session.twitterId
		});
	} else {
		res.send(404);
	}
}

exports.routeLoadAccount = function(req,res) {
	if (req.params.twitterId != null) {
		exports.fetchSettings(req.params.twitterId,function(settings) {
			res.setHeader('Content-Type', 'application/json');
			res.send(settings);
		});
	}
}

exports.routeSaveAccount = function(req,res) {
	res.send(200);
}