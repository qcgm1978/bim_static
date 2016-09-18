"use strict";

//日志管理入口
App.Services.Log = Backbone.View.extend({

	tagName: "div",

	render: function render() {
		this.$el.html('log manager');
		return this;
	}
});