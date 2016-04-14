App.Project.PlanModel = Backbone.View.extend({

	tagName: "div",

	className: "planModel",

	initialize: function() {
		this.listenTo(App.Project.PlanAttr.PlanModelCollection, "add", this.addOne);
	},

	render: function() {
		 var tpl=_.templateUrl("/projects/tpls/project/plan/project.plan.property.planModel.html",true);
		this.$el.html(tpl);
		return this;
	},

	template:_.templateUrl("/projects/tpls/project/plan/project.plan.property.planAnalog.detail.html"),


	addOne: function(model) {
		 
	 	var data=model.toJSON();
		this.$(".tbPlan tbody").html(this.template(data));
	}


});