// 项目总控
App.Project.ProjectApp = Backbone.View.extend({

	tagName: "div",

	className: "projectContainerApp",

	events: {
		"click .projectTab .item": "SwitchProjectNav"
	},

	render: function() {
		//nav
		this.$el.html(new App.Project.ProjectContainer().render().$el);

		//初始化数据
		this.initData();
		return this;
	},

	//加载tab 的内容
	initData: function() {
		// 导航文件
		App.Project.fetchFileNav();
		//导航模型
		App.Project.fetchModelNav();

		//文件列表
		App.Project.FileCollection.fetch();
	}, 

	// 切换项目Tab
	SwitchProjectNav: function() {

		var $el = $(event.target);
		//样式处理
		$el.addClass('selected').siblings().removeClass('selected');
		App.Project.Settings.projectNav = $el.data("type");
		//非文件导航
		if (App.Project.Settings.fetchNavType != "file") { 
			//根据类型渲染数据
			this.renderContentByType();  
		} 
	},
	//根据类型渲染数据
	renderContentByType: function(isFirst) {

		var type = App.Project.Settings.projectNav;
		//设计
		if (type == "design") {

			 

		} else if (type == "plan") {
			//计划
			this.$el.find("#rightPropety").html(new App.Project.ProjectPlan().render().$el);


		} else if (type == "cost") {
			//成本
			this.$el.find("#rightPropety").html(new App.Project.ProjectCost().render().$el);


		} else if (type == "quality") {
			//质量
			this.$el.find("#rightPropety").html(new App.Project.ProjectQuality().render().$el);

		}
	},



});