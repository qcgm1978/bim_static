//服务
App.Services = {

	DefaultSettings: {
		type: ""
	},

	//初始化
	init(type, tab) {

		this.Settings = $.extend({}, this.DefaultSettings);
		 
		this.Settings.type = type;
		this.Settings.tab = tab;

		if (type) {

			var viewer;
			if (type == "auth") {
				//权限管理
				viewer = new App.Services.Auth();
			} else if (type == "project") {
				//项目管理
				viewer = new App.Services.Project();
			} else if (type == "application") {
				//应用管理
				viewer = new App.Services.Application();

			} else if (type == "system") {
				//系统管理
				viewer = new App.Services.System();
			} else if (type == "log") {
				// 日志管理
				viewer = new App.Services.Log();
			}

			$("#contains").html(viewer.render().el);
			$("#pageLoading").hide();

		} else {
			var indexTpl = _.templateUrl('/services/tpls/index.html');
			$("#contains").html(indexTpl);
			$("#pageLoading").hide();
		}
	}
}