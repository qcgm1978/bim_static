App.ResourceModel = {

	Settings: {
		leftType: "file",
		DataModel: "", //模型id
		fileVersionId: "",
		type: "", //模型类型
		projectId: "", //项目id
		versionId: "", // 版本id
		pageIndex: 1,
		CurrentVersion: {}
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
	// 文件 容器
	FileThumCollection: new(Backbone.Collection.extend({


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

	PropertiesCollection: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType: "fetchDesignProperties",

		parse: function(response) {

			if (response.message == "success") {
				return response;
			}
		}

	})),

	//初始化
	init: function() {

		//this.reset();
		//释放上传
		App.Comm.upload.destroy();

		//重置参数
		this.reset();

		//存在直接渲染 否则 加载数据
		if (App.ResourceModel.Settings.CurrentVersion && 　App.ResourceModel.Settings.CurrentVersion.id) {
			App.ResourceModel.renderLibs();
		} else {
			App.ResourceModel.getVersion();
		}

		if (!App.ResourceModel.Settings.bindGlobalEvent) {
			App.ResourceModel.Settings.bindGlobalEvent = true;
			App.ResourceModel.bindGlobalEvent();
		}
	},

	reset: function() {


		App.ResourceModel.Settings.leftType = "file";
		App.ResourceModel.Settings.pageIndex = 1;
		App.ResourceModel.Settings.DataModel = null;
		App.ResourceModel.Settings.CurrentVersion={};

	},

	//绑定全局的事件
	bindGlobalEvent() {


		$(document).on("click.resources", function(event) {

			var $target = $(event.target);

			if ($target.closest('.thumContent .item').length <= 0) {
				$('.thumContent .item').each(function(i, item) {
					if ($(item).hasClass("selected")) {
						if (!$(item).find(".filecKAll input").is(":checked")) {
							$(item).removeClass("selected");
						}
					}

				});
			}

			//面包屑 切换 文件 模型 浏览器 
			if ($target.closest(".breadItem.fileModelNav").length <= 0) {
				$(".breadItem .fileModelList").hide();
			}

			//面包屑 切换 文件 模型 浏览器 
			if ($target.closest(".breadItem.resourcesList").length <= 0) {
				$(".breadItem.resourcesList .projectVersionList").hide();
			}
			if ($target.closest(".breadItem.standardLibsVersion ").length <= 0) {
				$(".breadItem.standardLibsVersion  .projectVersionList").hide();
			}
		});


	},


	//获取数据
	getVersion: function() {


		var data = {
			URLtype: "fetchVersion",
			data: {
				projectId: App.ResourceModel.Settings.projectId,
				versionId: App.ResourceModel.Settings.versionId
			}
		};

		App.Comm.ajax(data, function(data) {

			if (data.message == "success") {

				App.ResourceModel.Settings.CurrentVersion = data.data;

				if (!App.ResourceModel.Settings.CurrentVersion) {
					alert("无默认版本");
					return;
				} else {
					//渲染数据
					App.ResourceModel.renderLibs();
				}

			} else {
				alert("获取版本失败");
			}

		});
	},


	//渲染标准模型库
	renderLibs() {
		if (!App.ResourceModel.Settings.CurrentVersion) {
			alert("无默认版本");
			return;
		} else {
			//渲染数据
			new App.ResourceModel.App().render();
			var type = App.ResourcesNav.Settings.type;
			if (type == "standardLibs") {
				App.ResourceModel.FileCollection.projectId = App.ResourceModel.Settings.CurrentVersion.projectId;
				App.ResourceModel.FileCollection.projectVersionId = App.ResourceModel.Settings.CurrentVersion.id;
				App.ResourceModel.FileCollection.reset();
				App.ResourceModel.FileCollection.fetch();
			} else if (type == "famLibs") {
				App.ResourceModel.FileThumCollection.projectId = App.ResourceModel.Settings.CurrentVersion.projectId;
				App.ResourceModel.FileThumCollection.projectVersionId = App.ResourceModel.Settings.CurrentVersion.id;
				App.ResourceModel.FileThumCollection.reset();
				App.ResourceModel.FileThumCollection.fetch();
			}

			//上传
			App.ResourceUpload.init($(document.body));

		}
	},


	//创建文件夹
	createNewFolder: function() {

		var virModel = {
			isAdd: true,
			id: "createNew",
			children: null,
			fileVersionId: 520,
			folder: true,
			name: "新建文件夹",
			createTime: null,
			creatorId: null,
			creatorName: null,
			digest: null,
			floor: null
		}

		var type = App.ResourceModel.Settings.type;
		if (type == "standardLibs") {
			App.ResourceModel.FileCollection.push(virModel);
		} else if (type == "famLibs") {
			App.ResourceModel.FileThumCollection.push(virModel);
		}

	},

	//创建文件夹后处理
	afterCreateNewFolder(file, parentId) {



		var $treeViewMar = $(".projectNavFileContainer .treeViewMar"),
			$treeViewMarUl = $treeViewMar.find(".treeViewMarUl");

		var data = {
			data: [file],
			iconType: 1
		};

		//窜仔
		if ($treeViewMar.find('span[data-id="' + file.id + '"]').length > 0) {
			return;
		}

		//没有的时候绑定点击事件
		if ($treeViewMarUl.length <= 0) {

			data.click = function(event) {
				var file = $(event.target).data("file");

				if (type == "standardLibs") {
					//清空数据
					$("#resourceListContent .fileContent").empty();
					App.ResourceModel.Settings.fileVersionId = file.fileVersionId;
					App.ResourceModel.FileCollection.reset();

					App.ResourceModel.FileCollection.fetch({
						data: {
							parentId: file.fileVersionId
						}
					});
				} else if (type == "famLibs") {
					var file = $(event.target).data("file");
					//清空数据
					$("#resourceThumContent .thumContent").empty();
					App.ResourceModel.Settings.fileVersionId = file.fileVersionId;
					App.ResourceModel.FileThumCollection.reset();

					App.ResourceModel.FileThumCollection.fetch({
						data: {
							parentId: file.fileVersionId
						}
					});
				}

			}
		}


		var navHtml = new App.Comm.TreeViewMar(data);
		//不存在创建
		if ($treeViewMarUl.length <= 0) {
			$treeViewMar.html($(navHtml).find(".treeViewMarUl"));
		} else {

			if (parentId) {

				var $span = $treeViewMarUl.find("span[data-id='" + parentId + "']");
				if ($span.length > 0) {
					var $li = $span.closest('li');
					if ($li.find(".treeViewSub").length <= 0) {
						$li.append('<ul class="treeViewSub mIconOrCk" style="display:block;" />');
					}

					var $itemContent = $li.children('.item-content'),
						$noneSwitch = $itemContent.find(".noneSwitch");

					if ($noneSwitch.length > 0) {
						$noneSwitch.toggleClass('noneSwitch nodeSwitch on');
					}

					var $newLi = $(navHtml).find(".treeViewMarUl li").removeClass("rootNode").addClass('itemNode');
					$li.find(".treeViewSub").prepend($newLi);
				}

			} else {
				$treeViewMarUl.prepend($(navHtml).find(".treeViewMarUl li"));
			}
		}

	},

	afterRemoveFolder(file) {

		if (!file.folder) {
			return;
		}

		var $treeViewMar = $(".projectNavFileContainer .treeViewMar"),
			$treeViewMarUl = $treeViewMar.find(".treeViewMarUl");

		if ($treeViewMarUl.length > 0) {
			var $span = $treeViewMarUl.find("span[data-id='" + file.id + "']");
			if ($span.length > 0) {
				var $li = $span.closest('li'),
					$parent = $li.parent();
				$li.remove();
				//没有文件夹了
				if ($parent.find("li").length <= 0) {
					$parent.parent().children(".item-content").find(".nodeSwitch").removeClass().addClass("noneSwitch");
				}

			}

		}

	},

	//删除文件弹出层
	delFileDialog: function($item) {

		var dialog = new App.Comm.modules.Dialog({
			width: 580,
			height: 168,
			limitHeight: false,
			title: '删除文件提示',
			cssClass: 'deleteFileDialog',
			okClass: "delFile",
			okText: '确&nbsp;&nbsp;认',
			okCallback: function() {

				var fileVersionId = $item.find(".filecKAll").data("fileversionid"),
					id = $item.find(".text").data("id"),
					models = App.ResourceModel.FileCollection.models;

				if (App.ResourceModel.Settings.type == "famLibs") {
					models = App.ResourceModel.FileThumCollection.models;
				}

				//修改数据
				$.each(models, function(i, model) {
					if (model.toJSON().id == id) {

						model.urlType = "deleteFile";
						model.projectId = App.ResourceModel.Settings.CurrentVersion.projectId;
						model.projectVersionId = App.ResourceModel.Settings.CurrentVersion.id;
						model.fileVersionId = fileVersionId;
						model.destroy();

						return false;
					}
				});

				// //请求数据
				// var data = {
				// 	URLtype: "deleteFile",
				// 	type: "DELETE",
				// 	data: {
				// 		projectId: App.ResourceModel.Settings.CurrentVersion.projectId,
				// 		projectVersionId: App.ResourceModel.Settings.CurrentVersion.id,
				// 		fileVersionId: fileVersionId
				// 	}
				// };

				// //删除
				// App.Comm.ajax(data, function(data) {
				// 	console.log(data);
				// });
			},
			message: $item.find(".folder").length > 0 ? "确认要删除该文件夹么？" : "确认要删除该文件么？"


		});

	}

}