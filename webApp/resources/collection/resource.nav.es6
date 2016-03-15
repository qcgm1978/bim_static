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
		App.ResourcesNav.Settings.pageIndex=1; 
		new App.ResourcesNav.App().render();
	}  


}
 