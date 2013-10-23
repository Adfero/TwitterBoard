var express = require('express');
var http = require('http');
var path = require('path');
var settings = require('./settings.js');
var twitter = require('./twitter.js');
var config = require('./config.json');
var tweetStream = require('./tweetStream');

var app = express();

app.configure(function () {
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({secret: config.express.sessionsecret, config.express.sessionkey}));
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(express.errorHandler());
});

app.get('/auth', twitter.routeAuth);

app.get('/auth/return', twitter.routeAuthReturn);

app.get('/settings/account', settings.routeAccount);

app.get('/settings/:twitterId', settings.routeLoadAccount);

app.put('/settings/:twitterId', settings.routeSaveAccount);

tweetStream.start();

http.createServer(app).listen(config.express.port, function(){
	console.log('Express server listening');
});