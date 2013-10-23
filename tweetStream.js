var socketio = require('socket.io');
var connect = require('connect');
var config = require('./config.json');

streams = {};

exports.start = function() {
	var io = socketio.listen(config.socket.port);
	io.set('authorization', function (handshakeData, accept) {
		if (handshakeData.headers.cookie) {
			handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);
			handshakeData.sessionID = connect.utils.parseSignedCookie(handshakeData.cookie[config.express.sessionkey], config.express.sessionsecret);
			if (handshakeData.cookie[config.express.sessionkey] == handshakeData.sessionID) {
				return accept('Cookie is invalid.', false);
			}
		} else {
			return accept('No cookie transmitted.', false);
		} 
		accept(null, true);
	});

	io.sockets.on('connection', function (socket) {
		socket.on('sessionid',function(data) {
			
		});
		socket.on('disconnect', function() {

		});
	});
}