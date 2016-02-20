
App.Projects.DisplayMode=Backbone.View.extend({

	tagName:'div',

	className:'displayModeBox',

	

	events:{
		"click .list":"projectList",
		"click .map":"proMap"
	},
					
	template:_.templateUrl("/projects/tpls/project.displayMode.html",true),

	render:function(){
		this.$el.html(this.template);
		return this;
	},

	//切换为列表
	projectList:function(){
		App.Projects.Settings.type="list";
		App.Projects.fetch();
	},

	//切换为地图
	proMap:function(){
		App.Projects.Settings.type="map";
		App.Projects.fetch();
	} 

});
