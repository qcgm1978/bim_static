App.Project = {

	Settings: {
		fetchNavType: 'file', // model file
		projectNav: "design",
		property: "",
		fileId: "",
		projectId: 100,
		attrView: null,
		DataModel: null //渲染模型的数据

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

		//reset options
		App.Project.resetOptions();


		//加载 项目版本
		App.Project.loadVersion(App.Project.renderVersion);

	},

	//初始化数据
	resetOptions: function() {
		App.Project.Settings.CurrentVersion = null;
		App.Project.Settings.fetchNavType = 'file';
		App.Project.Settings.projectNav = 'design';
		App.Project.Settings.fileId = '';
		App.Project.Settings.property = '';
		App.Project.Settings.DataModel = null;
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

		//成功
		if (data.message == "success") {


			// 	var Versions = data.data,
			// 		vCount = Versions.length,
			// 		cVersion;
			// 	for (var i = 0; i < vCount; i++) {
			// 		cVersion = Versions[i];

			// 		if (cVersion.lastest) {
			// 			App.Project.Settings.CurrentVersion = cVersion;
			// 			break;
			// 	}
			// }


			var VersionGroups = data.data,
				gCount = VersionGroups.length,
				cVersionGroup;

			for (var i = 0; i < gCount; i++) {

				if (App.Project.Settings.CurrentVersion) {
					break;
				}

				cVersionGroup = VersionGroups[i];

				var cVersionDate, VersionsDates = cVersionGroup.item,
					dateCount = VersionsDates.length;

				for (var j = 0; j < dateCount; j++) {

					if (App.Project.Settings.CurrentVersion) {
						break;
					}

					cVersionDate = VersionsDates[j];

					var Versions = cVersionDate.version,
						vCount = Versions.length,
						cVersion;
					for (var k = 0; k < vCount; k++) {
						cVersion = Versions[k];
						if (cVersion.latest) {
							App.Project.Settings.projectName = cVersion.projectName;
							App.Project.Settings.CurrentVersion = cVersion;
							break;
						}
					}

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
				parentId: App.Project.Settings.fileId
			}
		});


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

			var $selFile = $("#projectContainer .fileContent :checkbox:checked").parent();

			if ($selFile.length < 1) {
				alert("请选择需要下载的文件");
				return;
			}

			var FileIdArr = [];
			$selFile.each(function(i, item) {
				FileIdArr.push($(this).data("fileversionid"));
			});

			var fileVersionId = FileIdArr.join(",");

			//下载
			App.Comm.checkDownLoad(App.Project.Settings.projectId,App.Project.Settings.CurrentVersion.id,fileVersionId);
			

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

			//面包屑 切换 文件 模型 浏览器 
			if ($target.closest(".breadItem.fileModelNav").length <= 0) {
				$(".breadItem .fileModelList").hide();
			}
		});
	},

	//根据类型渲染数据
	renderModelContentByType: function() {


		var type = App.Project.Settings.projectNav;

		// if (this.Settings.attrView && this.Settings.attrView.render) {
		// 	this.Settings.attrViewthis.stopListening();
		// }

		//解绑属性
		App.Project.DesignAttr.PropertiesCollection.unbind();

		//设计
		if (type == "design") {

			//this.Settings.attrView = new App.Project.ProjectDesignPropety();
			
			$("#projectContainer .rightPropertyContent").html(new App.Project.ProjectDesignPropety().render().$el);

		} else if (type == "plan") {
			//计划
			App.Project.DesignAttr.PropertiesCollection.unbind();
			//this.Settings.attrView = new App.Project.ProjectPlanProperty();
			$("#projectContainer .rightPropertyContent").html(new App.Project.ProjectPlanProperty().render().$el);


		} else if (type == "cost") {
			//成本
			//this.Settings.attrView = new App.Project.ProjectCostProperty();
			$("#projectContainer .rightPropertyContent").html(new App.Project.ProjectCostProperty().render().$el);


		} else if (type == "quality") {
			//质量
			//this.Settings.attrView = new App.Project.ProjectQualityProperty();
			$("#projectContainer .rightPropertyContent").html(new App.Project.ProjectQualityProperty().render().$el);

		}

		//$("#projectContainer .rightPropertyContent").html(this.Settings.attrView.render().$el);
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
				// 
				$("#projectContainer .header .ckAll").prop("checked",false);
				//App.Project.FileCollection.parentId=file.id;
				//清空数据
				App.Project.FileCollection.reset();
				$(".fileContainerScroll .fileContent").empty();
				App.Project.Settings.fileId = file.fileVersionId;

				App.Project.FileCollection.fetch({
					data: {
						parentId: file.fileVersionId
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

	//右侧属性是否渲染
	renderProperty: function() {
		var model;
		if (App.Project.Settings.ModelObj) {
			model = App.Project.Settings.ModelObj;
		} else {
			return;
		}

		App.Project.DesignAttr.PropertiesCollection.projectId = App.Project.Settings.projectId;
		App.Project.DesignAttr.PropertiesCollection.projectVersionId = App.Project.Settings.CurrentVersion.id;
		App.Project.DesignAttr.PropertiesCollection.fetch({
			data: {
				elementId: model.intersect.userId,
				sceneId: model.intersect.object.userData.sceneId
			}
		});
	}



}