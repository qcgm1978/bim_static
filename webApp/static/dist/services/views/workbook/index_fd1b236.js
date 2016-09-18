"use strict";

//WorkBook管理入口
App.Services.WorkBook = Backbone.View.extend({

	tagName: "div",

	render: function render() {
		this.$el.html('WorkBook manager');
		return this;
	}
});