App.Project.ProjectQualityProperty=Backbone.View.extend({

	tagName:"div",

	className:"ProjectQualityNavContainer projectNav",

	template:_.templateUrl("/projects/tpls/project/quality/project.quality.nav.html",true),

	events:{

	},

	render:function(){

		this.$el.html(this.template);

		return this;
	}


});