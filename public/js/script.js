(function() {
	// Classes

	var TweetCannon = {
		start: function() {
			console.log('Tweet cannon started');
		},
		stop: function () {

		},
		dequeueTweet: function() {

		},
		enqueueTweet: function() {

		}
	}

	var ViewUtilities = {
		activeWindow: null,
		removeActiveWindow: function() {
			if (this.activeWindow != null) {
				this.activeWindow.$el.remove();
			}
		},
		setActiveWindow: function(view) {
			$(document.body).append(view.$el);
			this.activeWindow = view;
		},
		initWindow: function(title,content,classes) {
			var variables = {
				classes: classes.join(' '),
				window_title: title,
				content: content
			}
			return _.template($("#tpl_window").html(), variables);
		},
		initForm: function(fields,submitValue,classes) {
			var variables = {
				classes: classes.join(' '),
				formitems: fields.join(''),
				submit_value: submitValue
			}
			return _.template($("#tpl_form").html(), variables);
		},
		initFormFieldset: function(name,formrows,classes) {
			var variables = {
				name: name,
				classes: classes,
				formrows: formrows.join('')
			}
			return _.template($("#tpl_form_fieldset").html(), variables);
		},
		initFormRow: function(label,name,formfield,classes) {
			var variables = {
				classes: classes.join(' '),
				label: label,
				name: name,
				formfield: formfield
			}
			return _.template($("#tpl_form_row").html(), variables);
		},
		initInput: function(name,type,value,placeholder,disabled,classes) {
			var input = '<input name="<%= name %>" type="<%= type %>" value="<%= value %>" placeholder="<%= placeholder %>" class="field <%= classes %>" <%= additional %> />';
			var variables = {
				name: name,
				type: type,
				value: value,
				placeholder: placeholder,
				classes: classes.join(' '),
				additional: (disabled ? 'disabled="disabled"' : '')
			}
			return _.template(input, variables);
		},
		initSelect: function(name,options,value,disabled,classes) {
			var html = '<select class="field" name="' + name + '" ' + (disabled ? 'disabled="disabled"' : '') + '>';
			_.each(options,function(item) {
				var selected = value == item.value ? ' selected="selected"' : '';
				html += '<option value="' + item.value + '"' + selected + '>' + item.label + '</option>';
			});
			html += '</select>';
			return html;
		}
	};

	var ThemeManager = {
		themes: {},
		loadThemes: function() {
			var _this = this;
			$.getJSON('/themes/manifest.json')
				.done(function(data) {
					if (data instanceof Array) {
						_.each(data,function(theme) {
							_this.themes[theme.id] = theme;
						});
						if (ViewUtilities.activeWindow != null) {
							ViewUtilities.activeWindow.render();
						}
					}
				});
		},
		enableTheme: function(theme) {
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
		},
		activateTheme: function(fns) {
			this.activeTheme.fns = fns;
			this.activeTheme.fns.start();
		}
	};

	var Settings = Backbone.Model.extend({
		urlRoot: '/settings',
		id: 'default',
		defaults: {
			search: '',
			theme: ''
		}
	});

	var SettingsView = Backbone.View.extend({
		initialize: function() {
			this.render();
		},
		render: function() {
			var fieldsets = [
				this.renderTwitterSettings(),
				this.renderThemeSettings()
			];
			var form = ViewUtilities.initForm(fieldsets,'Save',[]);
			var win = ViewUtilities.initWindow('Settings',form,['settings']);
			this.$el.html(win);
		},
		renderTwitterSettings: function() {
			var fields = [];

			if (this.model.get('account') != null) {
				fields.push(ViewUtilities.initFormRow('Account','account','<span class="field">Logged-in as ' + this.model.get('account').screenname+ ' </span>',[]));
			} else {
				fields.push(ViewUtilities.initFormRow('Account','account','<a class="field" href="/auth">Log in to Twitter</a>',[]));
			}

			fields.push(ViewUtilities.initFormRow('Search','search',ViewUtilities.initInput('search','text','','from:@handle',this.model.get('account') == null,[]),[]));

			return ViewUtilities.initFormFieldset('Twitter',fields,['twitter']);
		},
		renderThemeSettings: function() {
			var fields = [];

			var themesForSelect = [];
			_.each(ThemeManager.themes,function(theme) {
				themesForSelect.push({
					value: theme.id,
					label: theme.name
				});
			});

			var select = ViewUtilities.initSelect('theme',themesForSelect,this.model.get('theme'),this.model.get('account') == null,[]);
			fields.push(ViewUtilities.initFormRow('Theme','theme',select,[]));

			return ViewUtilities.initFormFieldset('Theme',fields,['theme']);
		},
		events: {
			'submit form': 'save',
			'click .close': 'close'
		},
		save: function(event) {
			try {event.preventDefault()} catch(e) {}

			this.model.set('search',this.$el.find('input[name=search]').val());
			this.model.set('theme',this.$el.find('select[name=theme]').val());

			ThemeManager.enableTheme(this.model.get('theme'));

			this.model.save(null,{
				success: function(model) {
					ViewUtilities.removeActiveWindow();
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

	var AppRouter = Backbone.Router.extend({
		routes: {
			'settings': 'openSettings',
			'*actions': 'default'
		}
	});

	// Globals

	var settings = new Settings();
	var router = new AppRouter();
	window.tm = ThemeManager;

	// Init

	ThemeManager.loadThemes();

	router.on('route:default', function(){
		ViewUtilities.removeActiveWindow();
	});

	router.on('route:openSettings', function(id) {
		ViewUtilities.removeActiveWindow();
		var settingsView = new SettingsView({model: settings});
		ViewUtilities.setActiveWindow(settingsView);
	});

	$.getJSON('/settings/account')
		.done(function(data) {
			//window.location = '#';
			settings.id = data.id;
			settings.fetch({
				success: function (settings) {
					if (ViewUtilities.activeWindow != null) {
						ViewUtilities.activeWindow.render();
					}
					ThemeManager.enableTheme(settings.get('theme'));
					TweetCannon.start();
				}
			});
		})
		.fail(function() {
			window.location = '#settings';
		});

	Backbone.history.start();
})();