App.Project.ProjectPlanNav=Backbone.View.extend({

	tagName:"div",

	id:"ProjectPlanNavContainer",

	template:_.templateUrl("/projects/tpls/project/plan/project.plan.nav.html",true),

	events:{

	},

	render:function(){

		this.$el.html(this.template);

		return this;
	}


});