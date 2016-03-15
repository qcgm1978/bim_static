App.ResourcesNav = {

	Settings: {
		pageIndex: 1,
		type: "", // 库的类型 

	},

	//标准模型库
	StandardLibsCollection: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}

		}),

		urlType: "fetchStandardLibs",

		parse: function(responese) {
			if (responese.message == "success") {
				return responese.data.items;
			}
		}

	})),


	//获取名称更具类型
	getNameByType() {

		var name = "",
			type = App.ResourcesNav.Settings.type;
		if (type == "standardLibs") {
			name = " 标准模型库";
		} else if (type == "famLibs") {
			name = "族库";
		} else if (type == "qualityStandardLibs") {
			name = "质量标准库";
		} else if (type == "manifestLibs") {
			name = " 清单库";
		}
		return name;

	},

	init() {
		App.ResourcesNav.reset();
		new App.ResourcesNav.App().render();
	},

	//重置数据
	reset: function() {
		App.ResourcesNav.Settings.pageIndex = 1;
		if (App.ResourceModel) {
			App.ResourceModel.Settings.CurrentVersion = null;
			App.ResourceModel.Settings.libsId = null;
			App.ResourceModel.Settings.libsName = null; //模型库的名称
			App.ResourceModel.Settings.libsVersionId = null;
			App.ResourceModel.Settings.libsVersionName = null; //模型版本名称} 
		}
	}
}