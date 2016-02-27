
App.Project.ProjectPlan=Backbone.View.extend({

	tagName:"div",

	id:"projectPlan",

	render:function(){
		this.$el.html(new App.Project.ProjectPlanNav().render().el);
		return this;
	}

});