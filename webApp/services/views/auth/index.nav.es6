/*
 * @require  /services/views/auth/index.es6
 * */
App.Services.AuthNav = Backbone.View.extend({

	//el:$("#contains"),

	tagName:"div",

	template:_.templateUrl("/services/tpls/auth/auth.nav.html",true),

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
		this.$el.find(".bcService span").eq(2).text(text);
	},

	initialize:function(){

		$(".serviceBody").empty();
		this.breadCrumb(this.$el.find(".memCtrl"));
		//App.Services.init({type : "auth",tab:"memCtrl"});
		//App.Service.memCtrlBlend.init();
	},


	memCtrl : function(){
		$(".serviceBody").empty();
		this.breadCrumb(this.$el.find(".memCtrl"));
		App.Services.init({type : "auth",tab:"memCtrl"});
		App.Services.memCtrlBlend.init();
	},
	roleManager : function(){
		$(".serviceBody").empty();
		this.breadCrumb(this.$el.find(".roleManager"));
		App.Services.init({type : "auth",tab:"roleManager"});
		App.Service.role.init();
	},
	keyUser : function(){
		$(".serviceBody").empty();
		this.breadCrumb(this.$el.find(".keyUser"));
		App.Services.init({type : "auth",tab:"keyUser"});
		$(".serviceBody").html(new App.Service.keyUserFrame().render().el); //框架
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
		App.Services.Settings = {type : "auth",tab:"keyUser"};
		//项目成员主模板
		//添加成员可与上面模板相同
		//删除提示
	}
});
