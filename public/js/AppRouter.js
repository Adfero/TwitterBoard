var AppRouter = Backbone.Router.extend({
	routes: {
		'settings': 'openSettings',
		'*actions': 'default'
	}
});