var querystring = require('querystring');
var oauth = require('oauth');
var config = require('./config.json');
var settings = require('./settings.js');
var https = require('https');

function consumer() {
	return new oauth.OAuth(
    	"https://twitter.com/oauth/request_token",
    	"https://twitter.com/oauth/access_token", 
    	config.twitter.consumerKey,
    	config.twitter.consumerSecret,
    	"1.0",
    	config.rootUrl+"/auth/return",
    	"HMAC-SHA1"
    );   
}

exports.consumer = consumer();

exports.routeAuth = function(req, res){
	consumer().getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results) {
		if (error) {
			res.send(500);
			console.log(error);
		} else {
			req.session.oauthRequestToken = oauthToken;
			req.session.oauthRequestTokenSecret = oauthTokenSecret;
			res.redirect("https://twitter.com/oauth/authorize?oauth_token="+oauthToken);
		}
	});
}

exports.routeAuthReturn = function(req, res) {
	if (req.query.oauth_verifier) {
		consumer().getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
			if (error) {
				res.send(500);
				console.log(error);
			} else {
				req.session.oauthAccessToken = oauthAccessToken;
				req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
				var url = 'https://api.twitter.com/1.1/account/verify_credentials.json';
				consumer().get(url, req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
					if (error == null) {
						var obj = JSON.parse(data);
						settings.updateSettings(obj.id_str,{
							screenname: obj.screen_name,
							id: obj.id_str
						});
						req.session.twitterId = obj.id;
					}
					res.redirect("/");
				});
			}
		});
	}
}

var searches = {};

var Search = function(session,settings,callback) {
	this.session = session;
	this.callback = callback;
	this.settings = settings;
	this.active = true;
	this.maxId = 0;
}

Search.prototype.stop = function() {
	this.active = false;
	delete searches[this.settings.id];
}

Search.prototype.getURL = function() {
	var params = {
		q: this.settings.search,
		count: 100,
		result_type: 'recent'
	};
	if (this.maxId > 0) {
		params.since_id = this.maxId;
	}
	return 'https://api.twitter.com/1.1/search/tweets.json?'+querystring.stringify(params);
}

Search.prototype.responseHandler = function(error, data, response) {
	if (!error) {
		var obj = JSON.parse(data);
		if (obj && obj.statuses) {
			var _this = this;
			obj.statuses.forEach(function(item) {
				if (item.id > _this.maxId) {
					_this.maxId = item.id;
				}
			});
			this.callback(obj.statuses);
		}
	} else {
		console.log(error);
	}
}

exports.startSearch = function(session,settings,callback) {
	if (settings.id && settings.search && session.oauthAccessToken && session.oauthAccessTokenSecret) {
		var s = new Search(session,settings,callback);
		searches[settings.id] = s;
		return s;
	} else {
		return null;
	}
}

setInterval(function() {
	for(var id in searches) {
		var search = searches[id];
		if (search.active) {
			consumer().get(search.getURL(), search.session.oauthAccessToken, search.session.oauthAccessTokenSecret, function(error, data, response) {
				search.responseHandler.call(search, error, data, response)
			});
		}
	}
},2000);