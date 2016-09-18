"use strict";

//日志管理入口
App.Services.Issue = Backbone.View.extend({

	tagName: "div",

	render: function render() {
		this.$el.html('Issue manager');
		return this;
	}
});