App.Project = {

	Settings: {
		fetchNavType: 'file', // model file
		projectNav: "design",
	},

	// 文件 容器
	FileCollection: new(Backbone.Collection.extend({
		url: "/dataJson/project/project.design.json?a=1",
		debugUrl: "/dataJson/project/project.design.json",
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		})

	})),

	//初始化
	init: function() {

		//var $contains = $("#contains"); 
		$("#contains").html(new App.Project.ProjectApp().render().el);
		//上传
		App.Project.upload = App.modules.docUpload.init($(document.body));
		//App.Project.fetchDesign();

		//初始化滚动条
		App.Project.initScroll();
	},

	//初始化滚动条
	initScroll:function(){

		$("#projectContainer").find(".projectFileNavContent").mCustomScrollbar({
             set_height: "100%",
             set_width:"100%",
             theme: 'minimal-dark',
             axis: 'y', 
             keyboard: {
                 enable: true
             },
             scrollInertia: 0
         });

		$("#projectContainer").find(".projectModelNavContent").mCustomScrollbar({
             set_height: "100%",
             set_width:"100%",
             theme: 'minimal-dark',
             axis: 'yx',
             keyboard: {
                 enable: true
             },
             scrollInertia: 0
         });
 
		// $("#projectDesignContainer").find(".designContainer").mCustomScrollbar({
  //            set_height: "100%",
  //            set_width:"100%",
  //            theme: 'minimal-dark',
  //            axis: 'y',
  //            keyboard: {
  //                enable: true
  //            },
  //            scrollInertia: 0
  //        });
	},

	//根据类型渲染数据
	renderModelContentByType: function() {

		var type = App.Project.Settings.projectNav;
		//设计
		if (type == "design") {

			$("#projectContainer .rightPropertyContent").html(new App.Project.ProjectDesignPropety().render().$el);

		} else if (type == "plan") {
			//计划
			$("#projectContainer .rightPropertyContent").html(new App.Project.ProjectPlanProperty().render().$el);


		} else if (type == "cost") {
			//成本
			$("#projectContainer .rightPropertyContent").html(new App.Project.ProjectCostProperty().render().$el);


		} else if (type == "quality") {
			//质量
			 $("#projectContainer .rightPropertyContent").html(new App.Project.ProjectQualityProperty().render().$el);

		} 

		//添加样式
		$("#projectContainer").find(".rightProperty").addClass("showPropety").end().find(".projectCotent").addClass("showPropety")

	},

	//设计导航
	fetchFileNav: function() {

		var data = {
			URLtype: "fetchDesignFileNav"
		};

		App.Comm.ajax(data).done(function(data) {
			var navHtml = new App.Comm.TreeViewMar(data);
			$("#projectContainer .projectNavFileContainer").html(navHtml);
		});

	},

	//设计模型
	fetchModelNav: function() { 
		var data = {
			URLtype: "fetchDesignModelNav"
		};

		App.Comm.ajax(data).done(function(data) {
			var navHtml = new App.Comm.TreeViewMar(data);
			$("#projectContainer .projectNavModelContainer").html(navHtml);
		});
	}


}