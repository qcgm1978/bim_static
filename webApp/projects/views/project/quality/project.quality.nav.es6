App.Project.ProjectQualityNav=Backbone.View.extend({

	tagName:"div",

	id:"ProjectQualityNavContainer",

	template:_.templateUrl("/projects/tpls/project/quality/project.quality.nav.html",true),

	events:{

	},

	render:function(){

		this.$el.html(this.template);

		return this;
	}


});