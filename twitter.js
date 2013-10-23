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

// app.get('/tweets', function(req,res) {
// 	if (config.twitter.staticTestFile) {
// 		var json = fs.readFileSync(config.twitter.staticTestFile).toString();
// 		res.setHeader('Content-Type', 'application/json');
// 		res.send(json);
// 	} else {
// 		var url = 'https://api.twitter.com/1.1/search/tweets.json?'+querystring.stringify({
// 			q:'from:@mashable',
// 			count:100,
// 			result_type:'recent'
// 		});
// 		consumer().get(url, req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
// 			if (error) {
// 				res.send(500);
// 				console.log(error);
// 			} else {
// 				res.setHeader('Content-Type', 'application/json');
// 				res.send(data);
// 			}
// 		});
// 	}
// });