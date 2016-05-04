/**
 * @require /services/collections/auth/projectMember/services.auth.projectMember.js
 */
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
		

		App.Services.maskWindow=new App.Comm.modules.Dialog({title:'新增关键用户',width:600,height:500,isConfirm:false,message:new ViewComp.MemberManager().render({title:"添加成员/部门"}).el});
        $('.mod-dialog .wrapper').html();
		
		return this;
	},
	
	//打开成员部门管理视图窗口
	openMemberManagerModal:function(){
		
		App.Services.maskWindow=new App.Comm.modules.Dialog({title:'新增关键用户',width:600,height:500,isConfirm:false});
        $('.mod-dialog .wrapper').html(new ViewComp.MemberManager().render({title:"添加成员/部门"}).el);
		
		//(new ViewComp.Modal).render({title:"添加成员/部门"}).append(new ViewComp.MemberManager);
	}
});

