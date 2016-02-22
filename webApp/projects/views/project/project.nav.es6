
App.Project.ProjectNav=Backbone.View.extend({

	tagName:'div',

	id:'projectNav',

	template:_.templateUrl('/projects/tpls/project/project.nav.html',true),

	render:function(){
		this.$el.html(this.template);
		return this;
	}

});