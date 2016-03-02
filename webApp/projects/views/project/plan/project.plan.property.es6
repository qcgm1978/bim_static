App.Project.ProjectPlanProperty=Backbone.View.extend({

	tagName:"div",

	className:"ProjectPlanPropertyContainer projectNav",

	template:_.templateUrl("/projects/tpls/project/plan/project.plan.nav.html",true),

	events:{

	},

	render:function(){

		this.$el.html(this.template);

		return this;
	}


});