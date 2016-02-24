
// 项目总控
App.Project.ProjectApp=Backbone.View.extend({

	tagName:"div",

	className:"projectContainerApp",

	events:{
		"click .projectTab .item":"SwitchProjectNav"
	},

	render:function(){ 
		//nav
		this.$el.html(new App.Project.ProjectHeader().render().$el); 
		this.$el.append('<div id="projectContainer" />');
		//根据类型渲染数据
		this.renderContentByType(); 
		return this;
	},

	//根据类型渲染数据
	renderContentByType:function(){
		var type=App.Project.Settings.projectNav;
		//设计
		if (type == "design") {
			this.$el.find("#projectContainer").html(new App.Project.ProjectDesingn().render().$el); 
			//获取设计数据 
			//App.Project.FileCollection.fetch({success:function(){},error:function(){console.log(1)}}); 
			//设计导航
			if (App.Project.Settings.fetchNavType=="file") {
				//列表
				App.Project.FileCollection.fetch();
				//导航
				App.Project.fetchDesignFileNav();
			}else{
				//导航
				App.Project.fetchDesignModelNav();
			} 
		  
		}else if (type=="plan") {
			//计划
		}else if (type=="cost") {
			//成本
		}else if (type=="quality") {
			//质量
		}
	},

	// 切换项目Tab
	SwitchProjectNav:function(){

		var $el = $(event.target);	 
		//样式处理
		$el.addClass('selected').siblings().removeClass('selected');
		App.Project.Settings.projectNav=$el.data("type");
		//根据类型渲染数据
		this.renderContentByType(); 
		
	}



});