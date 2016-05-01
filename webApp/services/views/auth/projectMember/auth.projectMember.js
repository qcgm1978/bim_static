//主容器
App.Services.projectMember.mainView = Backbone.View.extend({
	
	
	template: _.templateUrl('/services/tpls/auth/projectMember/tplProjectMember.html'),
	
	render: function() {
		this.$el.html(this.template());
		new App.Services.projectMember.projects();
		return this;
	}
});