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
		this.$el.find(".bcService span").eq(2).text(text);
	},

	initialize:function(){},

	memCtrl : function(){
		this.breadCrumb(this.$el.find(".memCtrl"));
		App.Services.init("auth","memCtrl");
		$("#dataLoading").show();
		App.Services.Member.loadData(App.Services.Member.innerCollection,{},function(){
			//两个不可控异步，已知顺序为加载-点击，只好先清空再添加
			App.Services.Member.innerCollection.each(function(item){
				$("#blendList").html("");
				item.set("checked",false);
				var newView = new App.Services.memberDetail({model:item});
				this.$("#blendList").append(newView.render().el);
				$("#dataLoading").hide();
			});
		});//默认加载内部列表

	},
	roleManager : function(){
		$(".serviceBody").empty();
		$("#dataLoading").show();
		this.breadCrumb($(".roleManager"));
		App.Services.init("auth","roleManager");
		App.Services.role.init(function(){
			$(".roleManager").addClass("active").siblings("li").removeClass("active");
			$("#dataLoading").hide();
		});
	},
	keyUser : function(){
		$(".serviceBody").empty();
		this.breadCrumb(this.$el.find(".keyUser"));
		$(".serviceBody").html(new App.Services.keyUserFrame().render().el); //框架
		$("#mask").html(new App.Services.addKeyUser().render().el); //框架
		$("#mask").show();

		App.Services.KeyUser.loadData(App.Services.KeyUser.KeyUserList,'',function(r){
			console.log( r)

			if(r && !r.code && r.data){
				App.Services.KeyUser.KeyUserList.set(r.data);
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

