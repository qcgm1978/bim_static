

//关注
App.Project.PlanPublicity = Backbone.View.extend({

	tagName: "div",

	className: "planPublicity",

	initialize: function() {
		this.listenTo(App.Project.PlanAttr.PlanPublicityCollection, "add", this.addOne);
	},

	render: function() {
		 
		this.$el.html("正在加载，请稍后……");
		return this;
	},

	template:_.templateUrl("/projects/tpls/project/plan/project.plan.property.publicityCollection.html"),


	addOne: function(model) {
	 	var data=model.toJSON();
		this.$el.html(this.template(data));
	}


});