var Settings = Backbone.Model.extend({
	urlRoot: '/settings',
	id: 'default',
	defaults: {
		search: '',
		theme: ''
	}
});	