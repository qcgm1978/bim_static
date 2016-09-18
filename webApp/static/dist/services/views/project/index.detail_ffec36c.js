"use strict";

//项目详情
App.Services.ProjectDetail = Backbone.View.extend({

	tagName: "div",

	className: "projectDetail",

	template: _.templateUrl('/services/tpls/project/index.detail.html', true),

	render: function render() {

		this.$el.html(this.template);
		return this;
	}
});