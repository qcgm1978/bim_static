"use strict";

//成本 -> 变更
App.Project.CostChange = Backbone.View.extend({

	tagName: "div",

	className: "CostChange",

	initialize: function initialize() {
		this.listenTo(App.Project.CostAttr.ChangeCollection, "add", this.addOne);
		this.listenTo(App.Project.CostAttr.ChangeCollection, "reset", this.reset);
	},

	events: {},

	//渲染
	render: function render() {
		var page = _.templateUrl("/projects/tpls/project/cost/project.cost.property.change.html", true);
		this.$el.html(page);
		return this;
	},

	template: _.templateUrl("/projects/tpls/project/cost/project.cost.property.change.detail.html"),

	reset: function reset() {
		this.$(".tbCostChange tbody").html(App.Project.Settings.loadingTpl);
	},


	//获取数据后处理
	addOne: function addOne(model) {
		var data = model.toJSON();
		this.$(".tbCostChange tbody").html(this.template(data));
	}

});