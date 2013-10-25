var ViewUtilities = function(twitterBoard) {
	this.twitterBoard = twitterBoard;
	this.activeWindow = null;
}
ViewUtilities.prototype.removeActiveWindow = function() {
	if (this.activeWindow != null) {
		this.activeWindow.$el.remove();
	}
}
ViewUtilities.prototype.setActiveWindow = function(view) {
	$(document.body).append(view.$el);
	this.activeWindow = view;
	view.render();
}
ViewUtilities.prototype.initWindow = function(title,content,classes) {
	var variables = {
		classes: classes.join(' '),
		window_title: title,
		content: content
	}
	return _.template($("#tpl_window").html(), variables);
}
ViewUtilities.prototype.initForm = function(fields,submitValue,classes) {
	var variables = {
		classes: classes.join(' '),
		formitems: fields.join(''),
		submit_value: submitValue
	}
	return _.template($("#tpl_form").html(), variables);
}
ViewUtilities.prototype.initFormFieldset = function(name,formrows,classes) {
	var variables = {
		name: name,
		classes: classes,
		formrows: formrows.join('')
	}
	return _.template($("#tpl_form_fieldset").html(), variables);
}
ViewUtilities.prototype.initFormRow = function(label,name,formfield,classes) {
	var variables = {
		classes: classes.join(' '),
		label: label,
		name: name,
		formfield: formfield
	}
	return _.template($("#tpl_form_row").html(), variables);
}
ViewUtilities.prototype.initInput = function(name,type,value,placeholder,disabled,classes) {
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
}
ViewUtilities.prototype.initSelect = function(name,options,value,disabled,classes) {
	var html = '<select class="field" name="' + name + '" ' + (disabled ? 'disabled="disabled"' : '') + '>';
	_.each(options,function(item) {
		var selected = value == item.value ? ' selected="selected"' : '';
		html += '<option value="' + item.value + '"' + selected + '>' + item.label + '</option>';
	});
	html += '</select>';
	return html;
}