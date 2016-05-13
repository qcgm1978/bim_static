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
		this.$(".serviceBody").html(new App.Services.MemberNav().render().el);
		this.$(".serviceBody .content").html(new App.Services.MemberList().render().el);
		App.Services.Member.loadData(App.Services.Member.innerCollection,{},function(){
			$("#inner span").addClass("active");
			$("#inner").siblings(".childOz").html(new App.Services.MemberozList(App.Services.Member.innerCollection.models).render().el);
		});
		//App.Services.init("auth","memCtrl");
	},
	roleManager : function(){
		$(".serviceBody").empty();
		this.breadCrumb(this.$el.find(".roleManager"));
		//App.Services.init("auth","roleManager");
		App.Services.role.init(function(){});
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
	},
	projectMember : function(){
		$(".serviceBody").empty();
		this.breadCrumb(this.$el.find(".projectMember"));
		App.Services.projectMember.init({type : "auth",tab:"projectMember"});
	}
});

