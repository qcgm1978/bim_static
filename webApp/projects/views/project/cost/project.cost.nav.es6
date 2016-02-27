
App.Project.ProjectCostNav=Backbone.View.extend({

	tagName:"div",

	id:"ProjectCostNavContainer",

	template:_.templateUrl("/projects/tpls/project/cost/project.cost.nav.html",true),

	events:{

	},

	render:function(){

		this.$el.html(this.template);

		return this;
	}

});