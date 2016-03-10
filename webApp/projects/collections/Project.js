App.Project = {

	Settings: {
		fetchNavType: 'file', // model file
		projectNav: "design",
		property: "",
		fileId: "",
		projectId: 100,
		modelId: ""
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


		//App.Project.fetchDesign();

		//加载数据
		//App.Project.loadData();

		//加载 项目版本
		App.Project.loadVersion(App.Project.renderVersion);

		//初始化滚动条
		App.Project.initScroll();

		//事件初始化
		App.Project.initEvent();

		//全局事件 只绑定一次
		if (!App.Project.Settings.initGlobalEvent) {
			App.Project.Settings.initGlobalEvent = true;
			App.Project.initGlobalEvent();
		}

	},

	//加载版本
	loadVersion: function(callback) {
		var data = {
			URLtype: "fetchCrumbsProjectVersion",
			data: {
				projectId: App.Project.Settings.projectId
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

			if ($.isFunction(callback)) {
				callback(data);
			}
		});
	},



	//渲染版本
	renderVersion: function(data) {
		debugger;
		//成功
		if (data.message == "success") {
			App.Project.Settings.projectName = "谁呀";

			var Versions = data.data,
				vCount = Versions.length,
				cVersion;
			for (var i = 0; i < vCount; i++) {
				cVersion = Versions[i];
				if (!cVersion.lastest) {
					App.Project.Settings.CurrentVersion = cVersion;
					break;
				}
			}

			//取到了当前版本
			if (App.Project.Settings.CurrentVersion) {
				//加载数据
				App.Project.loadData();

			} else {
				//无版本 数据错误
				alert("版本获取错误");
			}

		} else {
			alert("版本获取错误");
		}

	},


	// 加载数据
	loadData: function() {

		//var $contains = $("#contains"); 
		$("#contains").html(new App.Project.ProjectApp().render().el);
		//上传
		App.Project.upload = App.modules.docUpload.init($(document.body));

		// 导航文件
		App.Project.fetchFileNav();
		//导航模型
		//App.Project.fetchModelNav();

		App.Project.FileCollection.projectId = App.Project.Settings.projectId;
		App.Project.FileCollection.projectVersionId = App.Project.Settings.CurrentVersion.id;
		App.Project.FileCollection.reset();
		//文件列表
		App.Project.FileCollection.fetch({
			data: {
				fileId: App.Project.Settings.fileId
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
		$("#projectContainer").on("click", ".btnFileDownLoad", function() {

			var $selFile = $("#projectContainer .fileContent :checkbox:checked");

			if ($selFile.length > 1) {
				alert("目前只支持单文件下载");
				return;
			}

			if ($selFile.length < 1) {
				alert("请选择需要下载的文件");
				return;
			}
			var fileVersionId = $selFile.parent().data("fileversionid");

			// //请求数据
			var data = {
				URLtype: "downLoad",
				data: {
					projectId: App.Project.Settings.projectId,
					projectVersionId: App.Project.CurrentVersion.id
				}
			};

			var data = App.Comm.getUrlByType(data);
			var url = data.url + "?fileVersionId=" + fileVersionId;
			window.location.href = url;

			// App.Comm.ajax(data).done(function(){
			// 	console.log("下载完成");
			// });

		});
	},

	//绑定全局事件  document 事件
	initGlobalEvent: function() {
		$(document).on("click.project", function(event) {
			var $target = $(event.target);

			//面包屑 项目
			if ($target.closest(".breadItem.project").length <= 0) {
				$(".breadItem .projectList").hide();
			}

			//面包屑 项目版本
			if ($target.closest(".breadItem.projectVersion").length <= 0) {
				$(".breadItem .projectVersionList").hide();
			}
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
				projectId: App.Project.Settings.projectId,
				projectVersionId: App.Project.Settings.CurrentVersion.id
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
						fileId: file.id
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
	convertStatus: function(status) {

		//1：待上传；2：上传中；3：已上传；4：待审核；5：审核通过；6：审核退回；7：待移交；8：移交退回；9：已发布
 
		var result = "";
		if (status == 1) {
			result = "待上传";
		} else if (status == 2) {
			result = "上传中";
		} else if (status == 3) {
			result = "已上传";
		} else if (status == 4) {
			result = "待审核";
		} else if (status == 5) {
			result = "审核通过";
		} else if (status == 6) {
			result = "审核退回";
		} else if (status == 7) {
			result = "待移交";
		} else if (status == 8) {
			result = "移交退回";
		} else if (status == 9) {
			result = "已发布";
		}

		return result;
	}


}