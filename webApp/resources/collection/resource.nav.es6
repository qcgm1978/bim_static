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

	//族库
	FamLibsCollection: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}

		}),

		urlType: "fetchFamLibs",

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
			href = "#resources/famLibs";
		} else if (type == "qualityStandardLibs") {
			name = "质量标准库";
			href = "#resources/qualityStandardLibs";
		} else if (type == "manifestLibs") {
			name = " 清单库";
			href = "#resources/manifestLibs";
		}else if(type == "artifactsMapRule"){
			name = " 映射规则库";
			href = "#resources/artifactsMapRule";
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
			 
			var settings = App.ResourceModel.Settings
			for (var p in settings) {
				settings[p] = "";
			}
			App.ResourceModel.Settings.leftType = "file";
			App.ResourceModel.Settings.pageIndex = 1;
		}
	},

	//生成url
	getNavUrl: function(id, version) {

		var url = "#resources/";
		if (App.ResourcesNav.Settings.type == 'famLibs') {
			url += "famLibs/";
		} else {
			url += "standardLibs/";
		}
		url += id + "/";
		if (version) {
			url += version.id;
		}
		return url;

	}
}