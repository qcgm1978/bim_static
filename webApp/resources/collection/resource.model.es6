App.ResourceModel = {

	Settings: {
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
				}else{
					//渲染数据
					new App.ResourceModel.App().render();
					App.ResourceModel.FileCollection.projectId=App.ResourceModel.Settings.CurrentVersion.projectId;
					App.ResourceModel.FileCollection.projectVersionId=App.ResourceModel.Settings.CurrentVersion.id;
					App.ResourceModel.FileCollection.fetch();
				}


			} else {
				alert("获取版本失败");
			} 
			 
		});



	}

}