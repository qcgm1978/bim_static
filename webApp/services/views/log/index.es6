
//日志管理入口
App.Services.Log=Backbone.View.extend({

	tagName:"div",

	className:"systemContainerBox",



	events:{
		//"click .serviceNav .item":"itemClick"
	},

	render(){

		this.$el.html(new App.Services.Log.topBar().render().el);

		this.$('#logContainer').append(new App.Services.searchView().render().$el);

		this.$('#logContainer').append(new App.Services.ContentMode().render().$el);

		App.Services.loadData();


		return this;
	}




});
App.Services.Log.chooseTypes = ["项目","族库","标准模型","权限管理","项目管理","应用管理","系统管理","模型"];