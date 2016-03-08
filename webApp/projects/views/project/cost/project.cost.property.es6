
App.Project.ProjectCostProperty=Backbone.View.extend({

	tagName:"div",

	className:"ProjectCostPropetyContainer projectNav",

	template:_.templateUrl("/projects/tpls/project/cost/project.cost.nav.html",true),

	events:{

	},

	render:function(){ 

		this.$el.html(this.template);

		return this;
	}

});