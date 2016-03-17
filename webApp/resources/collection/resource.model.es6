App.ResourceModel = {

	Settings: {
		fileVersionId: "",
		type: "", //模型类型
		id: "", //模型id
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

	//初始化
	init: function() {

		App.ResourceModel.Settings.pageIndex = 1;
		App.ResourceModel.getVersion();
	},

	//获取数据
	getVersion: function() {


		var data = {
			URLtype: "fetchStandardVersion",
			data: {
				standardModelId: App.ResourceModel.Settings.id
			}
		};

		App.Comm.ajax(data, function(data) {

			if (data.message == "success") {

				var Versions = data.data,
					vCount = Versions.length,
					Version;
				for (var i = 0; i < vCount; i++) {
					Version = Versions[i];
					if (Version.lastest) {
						App.ResourceModel.Settings.CurrentVersion = Version;
					}
				}

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
					//事件初始化
					App.ResourceModel.initEvent();
				}


			} else {
				alert("获取版本失败");
			}

		});
	},

	//事件初始化
	initEvent: function() {

		var $resourceModelListNav = $("#resourceModelListNav");
		//下载
		$resourceModelListNav.on("click", ".btnFileDownLoad", function() {

			var $selFile = $resourceModelListNav.find(".fileContent :checkbox:checked");

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
					projectId: App.ResourceModel.Settings.CurrentVersion.projectId,
					projectVersionId: App.ResourceModel.Settings.CurrentVersion.id
				}
			};

			var data = App.Comm.getUrlByType(data);
			var url = data.url + "?fileVersionId=" + fileVersionId;
			window.location.href = url;

			// App.Comm.ajax(data).done(function(){
			// 	console.log("下载完成");
			// });

		});

		//删除
		$resourceModelListNav.on("click", ".btnFileDel", function() {
			var $selFile = $resourceModelListNav.find(".fileContent :checkbox:checked");
			if ($selFile.length > 1) {
				alert("目前只支持单文件删除");
				return;
			}

			if ($selFile.length < 1) {
				alert("请选择需要删除的文件");
				return;
			}

			var $item = $selFile.closest(".item");
			//删除
			App.ResourceModel.delFileDialog($item);

		});


		//新建项目文件夹
		$resourceModelListNav.on("click", ".btnNewFolder", function() {
			App.ResourceModel.createNewFolder();
		});

	},

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

				var fileVersionId = $item.find(".filecKAll").data("fileversionid"),id=$item.find(".fileName .text").data("id"),
				  models=App.ResourceModel.FileCollection.models;
				
				//修改数据
				$.each(models,function(i,model){
					if (model.toJSON().id==id) {
						
						model.urlType="deleteFile";
						model.projectId=App.ResourceModel.Settings.CurrentVersion.projectId;
						model.projectVersionId=App.ResourceModel.Settings.CurrentVersion.id;
						model.fileVersionId=fileVersionId;
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