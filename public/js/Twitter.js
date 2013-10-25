var Twitter = function(twitterBoard) {
	this.twitterBoard = twitterBoard;
}

Twitter.prototype.start = function() {
	console.log('Twitter started');
	this.socket = io.connect('http://localhost:8080');
	var _this = this;
	this.socket.on('tweets',function(tweets) {
		if (_this.twitterBoard.themeManager.activeTheme) {
			var theme = _this.twitterBoard.themeManager.activeTheme.obj;
			theme.tweetsAvailable.call(theme,tweets);
		}
	});
}

Twitter.prototype.stop = function () {
	this.socket.disconnect();
}