var SettingsView = Backbone.View.extend({
	initialize: function() {
	},
	render: function() {
		var fieldsets = [
			this.renderTwitterSettings(),
			this.renderThemeSettings()
		];
		var form = this.twitterBoard.viewUtilities.initForm(fieldsets,'Save',[]);
		var win = this.twitterBoard.viewUtilities.initWindow('Settings',form,['settings']);
		this.$el.html(win);
	},
	renderTwitterSettings: function() {
		var fields = [];

		if (this.model.get('account') != null) {
			fields.push(this.twitterBoard.viewUtilities.initFormRow('Account','account','<span class="field">Logged-in as ' + this.model.get('account').screenname+ ' </span>',[]));
		} else {
			fields.push(this.twitterBoard.viewUtilities.initFormRow('Account','account','<a class="field" href="/auth">Log in to Twitter</a>',[]));
		}

		fields.push(this.twitterBoard.viewUtilities.initFormRow('Search','search',this.twitterBoard.viewUtilities.initInput('search','text',this.model.get('search'),'from:@handle',this.model.get('account') == null,[]),[]));

		return this.twitterBoard.viewUtilities.initFormFieldset('Twitter',fields,['twitter']);
	},
	renderThemeSettings: function() {
		var fields = [];

		var themesForSelect = [];
		_.each(this.twitterBoard.themeManager.themes,function(theme) {
			themesForSelect.push({
				value: theme.id,
				label: theme.name
			});
		});

		var select = this.twitterBoard.viewUtilities.initSelect('theme',themesForSelect,this.model.get('theme'),this.model.get('account') == null,[]);
		fields.push(this.twitterBoard.viewUtilities.initFormRow('Theme','theme',select,[]));

		return this.twitterBoard.viewUtilities.initFormFieldset('Theme',fields,['theme']);
	},
	events: {
		'submit form': 'save',
		'click .close': 'close'
	},
	save: function(event) {
		try {event.preventDefault()} catch(e) {}

		this.model.set('search',this.$el.find('input[name=search]').val());
		this.model.set('theme',this.$el.find('select[name=theme]').val());

		this.twitterBoard.themeManager.enableTheme(this.model.get('theme'));

		var _this = this;
		this.model.save(null,{
			success: function(model) {
				_this.twitterBoard.viewUtilities.removeActiveWindow();
			}
		});
		window.location = '#';
		return false;
	},
	close: function() {
		try {event.preventDefault()} catch(e) {}
		window.location = '#';
		return false;
	}
});