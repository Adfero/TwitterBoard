var express = require('express');
var http = require('http');
var path = require('path');
var connect = require('connect');
var fs = require('fs');

var settings = require('./settings.js');
var twitter = require('./twitter.js');
var config = require('./config.json');
var tweetStream = require('./tweetStream');

var app = express();
var MemoryStore = require('connect/lib/middleware/session/memory');
var mystore = new MemoryStore;

app.configure(function () {
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({
		key: config.express.session.key,
		secret: config.express.session.secret, 
		store: mystore
	}));
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(express.errorHandler());
});

// app.get('/themes',function(req,res) {
// 	var pServer = './public/themes/';
// 	var pClient = '/themes/';
// 	fs.readdir(pServer, function(err, files) {
// 		if (err) {
// 			console.log(err);
// 			res.send(500);
// 		} else {
// 			var themes = files.filter(function (file) {
// 				return !fs.statSync(path.join(pServer, file)).isFile();
// 			});
// 			console.log(themes);
// 		}
// 	});
// });

app.get('/auth', twitter.routeAuth);

app.get('/auth/return', twitter.routeAuthReturn);

app.get('/settings/account', settings.routeAccount);

app.get('/settings/:twitterId', settings.routeLoadAccount);

app.put('/settings/:twitterId', settings.routeSaveAccount);

var server = http.createServer(app).listen(config.express.port, function(){
	console.log('Express server listening');
});

tweetStream.start(server,mystore);