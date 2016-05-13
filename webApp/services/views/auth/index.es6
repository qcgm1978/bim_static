/*
 * @require  /services/views/auth/index.nav.es6
 * */

//权限管理入口
App.Services.Auth = Backbone.View.extend({

	tagName: "div",

	render() {
		
		this.$el.html(new App.Services.AuthNav().render().el); //菜单
		this.$(".serviceBody").html(new App.Services.MemberNav().render().el); //组织菜单
		this.$(".serviceBody .content").html(new App.Services.MemberList().render().el); //主体列表
		//$("#dataLoading").show();
		App.Services.MemberType = "inner"; //设置默认类型

		App.Services.Member.loadData(App.Services.Member.innerCollection, {}, function(response) {
			if (response.data.org && response.data.org.length) {
				//样式处理
				$("#inner").addClass("active");
				$("#inner span").addClass("active"); //唯一选项
				//菜单渲染
				$("#inner + .childOz").html(new App.Services.MemberozList(response.data.org).render().el);
				$("#dataLoading").hide();
			}
		});
		return this;
	}

 

});