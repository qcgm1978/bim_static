'use strict';

App.TodoModule = {};

App.TodoModule.TodoListModule = Backbone.Model.extend({

	defaults: function defaults() {
		return {
			title: ''
		};
	}
});