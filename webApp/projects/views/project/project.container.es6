App.Project.ProjectContainer=Backbone.View.extend({

	tagName:'div',

	id:'projectContainer',

	events:{

	},

	template:_.templateUrl('/projects/tpls/project/project.container.html',true),

	render:function(){
		this.$el.html(this.template);
		return this;
	}



});