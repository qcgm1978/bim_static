 
//模拟
App.Project.PlanAnalog = Backbone.View.extend({

	tagName: "div",

	className: "planAnalog",

	initialize: function() {
		this.listenTo(App.Project.PlanAttr.PlanAnalogCollection, "add", this.addOne);
	},

	render: function() {
		 var html=_.templateUrl("/projects/tpls/project/plan/project.plan.property.planAnalog.html",true);
		this.$el.html(html);
		return this;
	},

	template:_.templateUrl("/projects/tpls/project/plan/project.plan.property.planAnalog.detail.html"),


	addOne: function(model) {
	 	var data=model.toJSON();
		this.$(".tbPlan tbody").html(this.template(data));
	}


});