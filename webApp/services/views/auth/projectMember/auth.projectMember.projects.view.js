//我管理的项目列表view
App.Services.projectMember.projects.view = Backbone.View.extend({

	tagName: 'li',

	className: 'project',
	
	events:{
		"click":"selectProject"
	},
	
	
	template: _.templateUrl('/services/tpls/auth/projectMember/projects.html'),

	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	
	selectProject:function(event){
		$("#projectMember .projects li").removeClass("active");
		$(event.target).addClass("active");
	}
});