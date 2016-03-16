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
			href,
			type = App.ResourcesNav.Settings.type;
		if (type == "standardLibs") {
			name = " 标准模型库";
			href = "#resources/standardLibs";
		} else if (type == "famLibs") {
			name = "族库";
		} else if (type == "qualityStandardLibs") {
			name = "质量标准库";
		} else if (type == "manifestLibs") {
			name = " 清单库";
		}
		return {
			name: name,
			href: href
		};

	},

	init() {
		App.ResourcesNav.reset();
		new App.ResourcesNav.App().render();
	},

	//重置数据
	reset: function() {
		App.ResourcesNav.Settings.pageIndex = 1;
		if (App.ResourceModel) {
			App.ResourceModel.Settings.CurrentVersion = {};
			App.ResourceModel.Settings.fileVersionId = "";
			App.ResourceModel.Settings.type = "";
			App.ResourceModel.Settings.id = "";
			App.ResourceModel.Settings.pageIndex = 1; 
		}
	}
}