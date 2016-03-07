App.Project = {

	Settings: {
		fetchNavType: 'file', // model file
		projectNav: "design",
	},

	// 文件 容器
	FileCollection: new(Backbone.Collection.extend({


		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType: "fetchFileList",

		parse:function(responese){
			if (responese.message=="success") {
				return responese.data;
			}
		}



	})),

	//初始化
	init: function() {

		//var $contains = $("#contains"); 
		$("#contains").html(new App.Project.ProjectApp().render().el);
		//上传
		App.Project.upload = App.modules.docUpload.init($(document.body));
		//App.Project.fetchDesign();

		//加载数据
		 App.Project.loadData();


		//初始化滚动条
		App.Project.initScroll();
	},

	// 加载数据
	loadData: function() {
		// 导航文件
		App.Project.fetchFileNav();
		//导航模型
		App.Project.fetchModelNav();

		App.Project.FileCollection.projectId=100;
		App.Project.FileCollection.projectVersionId=100;
		App.Project.FileCollection.parentId=782867504277696;

		//文件列表
		App.Project.FileCollection.fetch();
	},

	//初始化滚动条
	initScroll: function() {

		$("#projectContainer").find(".projectFileNavContent").mCustomScrollbar({
			set_height: "100%",
			set_width: "100%",
			theme: 'minimal-dark',
			axis: 'y',
			keyboard: {
				enable: true
			},
			scrollInertia: 0
		});

		$("#projectContainer").find(".projectModelNavContent").mCustomScrollbar({
			set_height: "100%",
			set_width: "100%",
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

		//添加样式 弹出属性层 
		$("#projectContainer").find(".rightProperty").addClass("showPropety").end().find(".projectCotent").addClass("showPropety")

		//触发数据加载
		$("#projectContainer .rightPropertyContent .projectNav .item:first").click();

	},

	//设计导航
	fetchFileNav: function() {
		//请求数据
		var data = {
			URLtype: "fetchDesignFileNav",
			data:{
				projectId:100,
				projectVersionId:100
			}
		};
		 
		App.Comm.ajax(data).done(function(data) {
			 
			if (_.isString(data)) {
				// to json
				if (JSON && JSON.parse) {
					data=JSON.parse(data);
				}else{
					data= $.parseJSON(data);
				}  
			}

			data.click=function(event){  
				var file=$(event.target).data("file");
			 	//App.Project.FileCollection.parentId=file.id;
			 	App.Project.FileCollection.fetch({
			 		data:{parentId:file.id}
			 	}); 
			}

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
			if (_.isString(data)) {
				// to json
				if (JSON && JSON.parse) {
					data=JSON.parse(data);
				}else{
					data= $.parseJSON(data);
				} 
			}
			var navHtml = new App.Comm.TreeViewMar(data);
			$("#projectContainer .projectNavModelContainer").html(navHtml);
		});
	}


}