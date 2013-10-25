var TwitterBoard = function() {
	this.router = new AppRouter();
	this.settings = new Settings();
	this.viewUtilities = new ViewUtilities(this);
	this.themeManager = new ThemeManager(this);
	this.twitter = new Twitter(this);

	var _this = this;

	this.router.on('route:default', function(){
		_this.viewUtilities.removeActiveWindow();
	});

	this.router.on('route:openSettings', function(id) {
		_this.viewUtilities.removeActiveWindow();
		var settingsView = new SettingsView({model: _this.settings});
		settingsView.twitterBoard = _this;
		_this.viewUtilities.setActiveWindow(settingsView);
	});

	$.getJSON('/settings/account')
		.done(function(data) {
			//window.location = '#';
			_this.settings.id = data.id;
			_this.settings.fetch({
				success: function (settings) {
					if (_this.viewUtilities.activeWindow != null) {
						_this.viewUtilities.activeWindow.render();
					}
					_this.themeManager.enableTheme(_this.settings.get('theme'));
					_this.twitter.start();
				}
			});
		})
		.fail(function() {
			window.location = '#settings';
		});

	Backbone.history.start();
}

window.tb = new TwitterBoard();