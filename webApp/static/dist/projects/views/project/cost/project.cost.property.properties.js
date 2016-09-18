"use strict";

//成本 -> 属性
App.Project.CostProperties = Backbone.View.extend({

	tagName: "div",

	className: "CostProperties",

	initialize: function initialize() {
		//this.listenTo(App.Project.CostAttr.PropertiesCollection,"add",this.addOne);
		this.listenTo(App.Project.DesignAttr.PropertiesCollection, "add", this.addOne);
	},

	events: {},

	//渲染
	render: function render() {

		this.$el.html('<div class="nullTip">请选择构件</div>');

		return this;
	},

	template: _.templateUrl("/projects/tpls/project/design/project.design.property.properties.html"),

	//获取数据后处理
	addOne: function addOne(model) {
		var data = model.toJSON().data;
		var temp = JSON.stringify(data);
		temp = JSON.parse(temp);
		App.Project.userProps.call(this, temp);
	}

});