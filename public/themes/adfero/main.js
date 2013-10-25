var Adfero = function() {
	this.stack = [];
	this.stackMax = 500;
	this.interval = null;
}

Adfero.prototype.tweetsAvailable = function(tweets) {
	for(var i=0;i<tweets.length;i++) {
		if (this.stack.length < this.stackMax) {
			this.stack.push(tweets[i]);
		}
	}
}

Adfero.prototype.start = function() {
	console.log('Theme B started');
	var $canvas = $('#canvas');
	var _this = this;
	this.interval = setInterval(function() {
		var tweet = _this.stack.shift();
		if (tweet) {
			$canvas.html(tweet.text);
		}
	},1000);
}

Adfero.prototype.stop = function() {
	console.log('Theme B stopped');
	this.stack = [];
}

window.tb.themeManager.activateTheme(new Adfero());