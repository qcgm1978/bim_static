App.Project = {

	Settings: {
		fetchNavType: 'file', // model file
		projectNav: "design",
		property:"",
		fileId: "784280535935168",
		projectId: 100,
		projectVersionId: 100,
		modelId:""
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

		parse: function(responese) {
			if (responese.message == "success") {
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

		//事件初始化
		App.Project.initEvent();
	},

	// 加载数据
	loadData: function() {
		// 导航文件
		App.Project.fetchFileNav();
		//导航模型
		App.Project.fetchModelNav();

		App.Project.FileCollection.projectId = App.Project.Settings.projectId;
		App.Project.FileCollection.projectVersionId = App.Project.Settings.projectVersionId;
		App.Project.FileCollection.reset();
		//文件列表
		App.Project.FileCollection.fetch({
			data: {
				parentId: App.Project.Settings.fileId
			}
		});
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

	//事件初始化
	initEvent: function() {

		//下载
		$("#projectContainer").on("click",".btnFileDownLoad", function() {

			var $selFile=$("#projectContainer .fileContent :checkbox:checked");

			if ($selFile.length>1) {
				alert("目前只支持单文件下载");
				return;
			}

			if ($selFile.length<1) {
				alert("请选择需要下载的文件");
				return;
			} 
			var fileVersionId=$selFile.parent().data("fileversionid");

			// //请求数据
			var data = {
				URLtype: "downLoad",
				data: {
					projectId: 100,
					projectVersionId: 100				 
				}
			};
		 
			var data=App.Comm.getUrlByType(data);
			var url=data.url+"?fileVersionId="+fileVersionId;
			window.location.href=url;

			// App.Comm.ajax(data).done(function(){
			// 	console.log("下载完成");
			// });

		});
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
			data: {
				projectId: 100,
				projectVersionId: 100
			}
		};

		App.Comm.ajax(data).done(function(data) {

			if (_.isString(data)) {
				// to json
				if (JSON && JSON.parse) {
					data = JSON.parse(data);
				} else {
					data = $.parseJSON(data);
				}

			}

			data.click = function(event) {
				var file = $(event.target).data("file");
				//App.Project.FileCollection.parentId=file.id;
				//清空数据
				App.Project.FileCollection.reset();
				$(".fileContainerScroll .fileContent").empty();
				App.Project.Settings.fileId = file.id;
				App.Project.FileCollection.fetch({
					data: {
						parentId: file.id
					}
				});
			}
			data.iconType = 1;
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
					data = JSON.parse(data);
				} else {
					data = $.parseJSON(data);
				}
			}
			var navHtml = new App.Comm.TreeViewMar(data);
			$("#projectContainer .projectNavModelContainer").html(navHtml);
		});
	},

	//状态转换
	convertStatus: function(storeStatus, status) {

		//存储状态 0：待上传；1：上传中；2：上传完成，若为文件夹此字段无意义

		//流转状态1：待审核；2：已报审；3：修改中；4：已确认；5：已移交；
		var result = "";
		if (storeStatus == 0) {
			result = "待上传";
		} else if (storeStatus == 1) {
			result = "上传中";
		} else if (storeStatus == 2) {
			if (status == 1) {
				result = "待审核";
			} else if (status == 2) {
				result = "已报审";
			} else if (status == 3) {
				result = "修改中";
			} else if (status == 4) {
				result = "已确认";
			} else if (status == 5) {
				result = "已移交";
			}
		}

		return result;
	}


}