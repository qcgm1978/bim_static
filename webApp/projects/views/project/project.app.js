
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
		this.$el.find("#projectContainer").html(new App.Project.ProjectDesingn().render().$el);
		 
		
		 return this;
	},

	SwitchProjectNav:function(){

		var $el = $(event.target),
			type = $el.data("type");
		$el.addClass('selected').siblings().removeClass('selected');
		 
		//设计
		if (type == "design") {

		}else if (type=="plan") {
			//计划
		}else if (type=="cost") {
			//成本
		}else if (type=="quality") {
			//质量
		}
	}



});