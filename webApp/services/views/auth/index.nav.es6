/**
 * @require /services/collections/auth/keyuser/keyuser.js
 */

App.Services.AuthNav = Backbone.View.extend({

	tagName:"div",
	template:_.templateUrl("/services/tpls/auth/auth.nav.html"),

	events:{
		"click .memCtrl" : "memCtrl",
		"click .roleManager" : "roleManager",
		"click .keyUser" : "keyUser",
		"click .projectMember" : "projectMember"
	},
	render:function(){
		this.$el.html(this.template);
		return this;
	},
//面包屑
	breadCrumb : function(ele){
		$(ele).addClass("active").siblings("li").removeClass("active");
		var n = $(ele).index();
		var text = this.$el.find("li").eq(n).text();
		this.$el.find(".bcService span:last").text(text);
	},

	initialize:function(){
		this.breadCrumb(this.$el.find(".memCtrl"));
	},

	memCtrl : function(){
		$(".serviceBody").empty();
		this.breadCrumb(this.$el.find(".memCtrl"));
		this.$(".serviceBody").html(new App.Services.MemberNav().render().el);//组织菜单
		this.$(".serviceBody .content").html(new App.Services.MemberList().render().el);//主体列表
		App.Services.Member.loadData(App.Services.Member.innerCollection,{},function(){});//加载数据
		//App.Services.init("auth","memCtrl");
	},
	roleManager : function(){
		$(".serviceBody").empty();
		//App.Services.init("auth","roleManager");
		App.Services.role.init(function(){
			$(".roleManager").addClass("active").siblings("li").removeClass("active");
			$("#dataLoading").hide();
		});
	},
	keyUser : function(){
		$(".serviceBody").empty();
		this.breadCrumb(this.$el.find(".keyUser"));
		App.Services.KeyUser.init();
		$(".serviceBody").html(new App.Services.keyUserFrame().render().el); //框架
		$('.keyUserList .needloading').html("<div class='smallLoading'><img  src='/static/dist/images/comm/images/pageLoading.gif'/></div>");
		App.Services.KeyUser.loadData(App.Services.KeyUser.KeyUserList,'',function(r){

			if(r && !r.code && r.data){
				App.Services.KeyUser.KeyUserList.set(r.data);
				App.Services.KeyUser.userList = r.data;
			}
		});
		//主模板  四个列表：  关键用户列表 （默认第一个？）  关键要用户基本信息  项目权限   部门权限
		//新增关键用户，注意步骤，关联性
		//删除关键用户弹窗
		//项目授权  权限，两个列表（注意关联性）
		//部门授权
		//弹窗主模板相同，名称可能不同，需要主模板管理器（标题，副标题，内容刷新底下按钮）
	},
	projectMember : function(){
		$(".serviceBody").empty();
		this.breadCrumb(this.$el.find(".projectMember"));
		App.Services.projectMember.init({type : "auth",tab:"projectMember"});
		//App.Services.Settings = {type : "auth",tab:"keyUser"};
		//项目成员主模板
		//添加成员可与上面模板相同
		//删除提示
	}
});

