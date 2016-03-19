App.ResourceModel = {

	Settings: {
		leftType: "file",
		modelId: "", //模型id
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

		//释放上传
		App.Comm.upload.destroy();

		App.ResourceModel.Settings.pageIndex = 1;
	 

		//标准模型库
		if (App.ResourcesNav.Settings.type == "standardLibs") {
			//存在直接渲染 否则 加载数据
			if (App.ResourceModel.Settings.CurrentVersion && 　App.ResourceModel.Settings.CurrentVersion.id) {
				App.ResourceModel.renderLibs();
			} else {
				App.ResourceModel.getVersion();
			}


		} else if (App.ResourcesNav.Settings.type == "famLibs") {

			//族库
			App.ResourceModel.Settings.CurrentVersion = 100;

			new App.ResourceModel.App().render();
			//App.ResourceModel.FileCollection.projectId = App.ResourceModel.Settings.CurrentVersion.projectId;
			//App.ResourceModel.FileCollection.projectVersionId = App.ResourceModel.Settings.CurrentVersion.id;
			//App.ResourceModel.FileCollection.fetch();

			//上传
			App.ResourceUpload.init($(document.body));
		}


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
			App.ResourceModel.FileCollection.projectId = App.ResourceModel.Settings.CurrentVersion.projectId;
			App.ResourceModel.FileCollection.projectVersionId = App.ResourceModel.Settings.CurrentVersion.id;
			App.ResourceModel.FileCollection.fetch();
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

		App.ResourceModel.FileCollection.push(virModel);
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
					id = $item.find(".fileName .text").data("id"),
					models = App.ResourceModel.FileCollection.models;

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