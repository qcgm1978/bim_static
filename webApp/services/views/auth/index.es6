/*
 * @require  /services/views/auth/index.nav.es6
 * */

//权限管理入口
App.Services.Auth = Backbone.View.extend({

	tagName:"div",


	render(){
		this.$el.html(new App.Services.AuthNav().render().el);//菜单
		return this;
	},

	initialize:function(){
		this.render();
	}



});