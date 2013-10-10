var express = require('express');
var http = require('http');
var path = require('path');
var https = require('https');
var oauth = require('oauth');
var querystring = require('querystring');
var fs = require('fs');
var config = require('./config.json');

function consumer() {
	return new oauth.OAuth(
    	"https://twitter.com/oauth/request_token",
    	"https://twitter.com/oauth/access_token", 
    	config.twitter.consumerKey,
    	config.twitter.consumerSecret,
    	"1.0",
    	config.rootUrl+"/auth/twitter/callback",
    	"HMAC-SHA1"
    );   
}

var app = express();

app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser(config.express.sessionkey));
app.use(express.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.errorHandler());

app.get('/auth/twitter', function(req, res){
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
});

app.get('/auth/twitter/callback', function(req, res) {
	if (req.query.oauth_verifier) {
		consumer().getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
			if (error) {
				res.send(500);
				console.log(error);
			} else {
				req.session.oauthAccessToken = oauthAccessToken;
				req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
				res.redirect("/");
			}
		});
	}
});

app.get('/tweets', function(req,res) {
	if (config.twitter.staticTestFile) {
		var json = fs.readFileSync(config.twitter.staticTestFile).toString();
		res.setHeader('Content-Type', 'application/json');
		res.send(json);
	} else {
		var url = 'https://api.twitter.com/1.1/search/tweets.json?'+querystring.stringify({
			q:'from:@mashable',
			count:100,
			result_type:'recent'
		});
		consumer().get(url, req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
			if (error) {
				res.send(500);
				console.log(error);
			} else {
				res.setHeader('Content-Type', 'application/json');
				res.send(data);
			}
		});
	}
});

http.createServer(app).listen(config.express.port, function(){
	console.log('Express server listening');
});