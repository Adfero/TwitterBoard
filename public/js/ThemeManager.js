var ThemeManager = function(twitterBoard) {
	this.twitterBoard = twitterBoard;
	this.themes = {};
	this.loadThemes();
}

ThemeManager.prototype.loadThemes = function() {
	var _this = this;
	$.getJSON('/themes/manifest.json')
		.done(function(data) {
			console.log(data);
			if (data instanceof Array) {
				_.each(data,function(theme) {
					_this.themes[theme.id] = theme;
				});
				if (_this.twitterBoard.viewUtilities.activeWindow != null) {
					_this.twitterBoard.viewUtilities.activeWindow.render();
				}
			}
		});
}

ThemeManager.prototype.enableTheme = function(theme) {
	if (this.activeTheme) {
		this.activeTheme.fns.stop();
	}
	if (this.themes[theme]) {
		this.activeTheme = this.themes[theme];

		$('theme-css,theme-js').remove();

		var js = document.createElement("script");
		js.type = 'text/javascript';
		js.src = '/themes/'+this.activeTheme.id+'/main.js';
		js.id = 'theme-js';
		document.body.appendChild(js);

		var css = document.createElement("link");
		css.rel = 'stylesheet';
		css.href = '/themes/'+this.activeTheme.id+'/main.css';
		css.text = 'text/css';
		css.id = 'theme-js';
		document.head.appendChild(css);
	}
}

ThemeManager.prototype.activateTheme = function(theme) {
	this.activeTheme.obj = theme;
	this.activeTheme.obj.start();
}