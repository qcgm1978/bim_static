App.ResourceModel = {

	Settings: {
		type: "", //模型类型
		id: "", //模型id
		pageIndex: 1,
		CurrentVersion: null,
		libsId: "",
		libsName: "", //模型库的名称
		libsVersionId: "",
		libsVersionName: "", //模型版本名称
	},

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
						App.ResourceModel.Settings.libsId = Version.projectId;
						App.ResourceModel.Settings.libsName = Version.projectName; //模型库的名称
						App.ResourceModel.Settings.libsVersionId = Version.id;
						App.ResourceModel.Settings.libsVersionName = Version.name; //模型版本名称
					}
				}

				if (!App.ResourceModel.Settings.CurrentVersion) {
					alert("无默认版本");
					return;
				}else{
					//渲染数据
					new App.ResourceModel.App().render();
				}


			} else {
				alert("获取版本失败");
			} 
			 
		});



	}

}