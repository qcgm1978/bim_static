//主容器
App.Services.projectMember.mainView = Backbone.View.extend({
	
	tagName:"div",
	
	id:"projectMember",
	
	events:{
		'click #addMemberBtn':'openMemberManagerModal'
	},
	
	template: _.templateUrl('/services/tpls/auth/projectMember/tplProjectMember.html'),
	
	render: function() {
		this.$el.html(this.template());
		new App.Services.projectMember.projects();
		new App.Services.projectMember.members();
		return this;
	},
	
	//打开成员部门管理视图窗口
	openMemberManagerModal:function(){
		(new ViewComp.Modal).render({title:"添加成员/部门"}).append(new ViewComp.MemberManager);
	}
});

