/*
 * @require  /services/views/auth/index.nav.es6
 * */

//权限管理入口
App.Services.Auth = Backbone.View.extend({

	tagName: "div",

	render(){
		App.Services.MemberType = "inner";//默认加载类型
		this.$el.html(new App.Services.AuthNav().render().el);//菜单
		this.loadMemberData();
		return this;
	},

	initialize:function(){
		Backbone.on("loadMemberData",this.loadMemberData,this);
	},
	loadMemberData:function(pram){
		this.$(".serviceBody").addClass("services_loading");
		var _this = this;
		this.$(".serviceBody").html(new App.Services.MemberNav().render().el);
		this.$(".serviceBody .content").html(new App.Services.MemberList().render().el);
		App.Services.Member.loadData(App.Services.Member.innerCollection, {}, function (response) {
			App.Services.Member.memLoadingStatus = false;
			_this.$("#inner span").addClass("active");
			_this.$("#inner").addClass("active").siblings(".childOz").html(App.Services.tree(response));
			_this.$(".serviceBody").removeClass("services_loading");
		});
	}
});