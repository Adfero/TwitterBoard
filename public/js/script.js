(function() {
	var SettingsView = Backbone.View.extend({
		initialize: function(){
			
		}
	});


	var AppRouter = Backbone.Router.extend({
		routes: {
			'settings': 'openSettings'
		}
	});

	var app_router = new AppRouter;

	app_router.on('route:openSettings', function (id) {

	});

	Backbone.history.start();
})();