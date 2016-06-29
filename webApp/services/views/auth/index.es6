/*
 * @require  /services/views/auth/index.nav.es6
 * */

//权限管理入口
App.Services.Auth = Backbone.View.extend({

	tagName: "div",

	render(){
		App.Services.MemberType = "inner";//默认加载类型
		this.$el.html(new App.Services.AuthNav().render().el);//菜单
		this.$(".serviceBody").html(new App.Services.MemberNav().render().el);
		this.$(".serviceBody .content").html(new App.Services.MemberList().render().el);
		$("#blendList").addClass("services_loading");
		return this;
	},

	initialize:function(){
		this.render();
		Backbone.on("loadMemberData",this.loadMemberData,this);
		this.loadMemberData();
		/*	setTimeout(function(){
		 $('.serviceNav .active').trigger('click');
		 },1000)*/
	},
	loadMemberData:function(){
		App.Services.Member.loadData(App.Services.Member.innerCollection,{},function(response){
			$("#inner span").addClass("active");
			$("#inner").addClass("active").siblings(".childOz").html(App.Services.tree(response));
			$("#blendList").removeClass("services_loading");
		});
	}
});