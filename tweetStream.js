var io = require('socket.io');
var connect = require('connect');
var cookie = require("cookie");
var config = require('./config.json');
var settings = require('./settings');
var twitter = require('./twitter');

exports.start = function(server,sessionStore) {
	var sio = io.listen(server);

	sio.set('authorization', function (data, accept) {
		if (data.headers.cookie) {
			data.cookie = cookie.parse(data.headers.cookie);
			data.sessionID = connect.utils.parseSignedCookie(data.cookie[config.express.session.key], config.express.session.secret);
		} else {
			return accept('No cookie transmitted.', false);
		}
		accept(null, true);
	});

	sio.sockets.on('connection', function(client){
		var search;

		if (client.handshake.sessionID) {
			sessionStore.get(client.handshake.sessionID, function (err, session) {
				if (session) {
					settings.fetchSettings(session.twitterId,function(settings) {
						search = twitter.startSearch(session,settings,function(results) {
							client.emit('tweets',results);
						});
					});
				}
			});
		}

		client.on('disconnect', function() {
			if (search) {
				search.stop();
			}
		});
	});
}