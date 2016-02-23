App.Project.ProjectHeader = Backbone.View.extend({

	tagName: 'div',

	className: 'projectHeader', 

	template: _.templateUrl('/projects/tpls/project/project.header.html',true),

	render: function() {
		this.$el.html(this.template);
		return this;
	}

	 
});