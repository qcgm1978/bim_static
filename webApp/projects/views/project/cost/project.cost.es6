

App.Project.ProjectCost=Backbone.View.extend({

	tagName:"div",

	id:"ProjectCostContainer",

	render:function(){
		this.$el.html(new App.Project.ProjectCostNav().render().el);
		return this;
	}

});