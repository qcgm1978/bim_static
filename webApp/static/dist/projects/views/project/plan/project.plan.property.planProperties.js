"use strict";

App.Project.PlanProperties = Backbone.View.extend({

	tagName: "div",

	className: "planProperties",

	initialize: function initialize() {
		this.listenTo(App.Project.DesignAttr.PropertiesCollection, "add", this.addOne);
		//this.listenTo(App.Project.PlanAttr.PlanPropertiesCollection, "add", this.addOne);
	},

	render: function render() {

		this.$el.html('<div class="nullTip">请选择构件</div>');
		return this;
	},

	template: _.templateUrl("/projects/tpls/project/design/project.design.property.properties.html"),

	addOne: function addOne(model) {
		var data = model.toJSON().data;
		var temp = JSON.stringify(data);
		temp = JSON.parse(temp);
		App.Project.userProps.call(this, temp);
	}

});