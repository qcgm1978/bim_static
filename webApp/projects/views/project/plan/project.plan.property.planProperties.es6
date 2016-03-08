 



App.Project.PlanProperties = Backbone.View.extend({

	tagName: "div",

	className: "planProperties",

	initialize: function() {
		this.listenTo(App.Project.PlanAttr.PlanPropertiesCollection, "add", this.addOne);
	},

	render: function() {
		 
		this.$el.html("正在加载，请稍后……");
		return this;
	},

	template:_.templateUrl("/projects/tpls/project/design/project.design.property.properties.html"),


	addOne: function(model) {
	 	var data=model.toJSON();
		this.$el.html(this.template(data));
	}


});