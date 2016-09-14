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
			}else if(type=="workbook"){
				//操作手册
				viewer=new App.Services.WorkBook();
			}else if(type=="issue"){
				//问题反馈
				viewer=new App.Services.Issue();
			}

			$("#contains").html(viewer.render().el);
			$("#pageLoading").hide();
			if (type == "project") {
			 	App.Comm.initScroll($('#contains .scrollWrap'),"y");
			}
			

		} else {
			var indexTpl = _.templateUrl('/services/tpls/index.html');
			$("#contains").html(indexTpl); 
			//设置权限
			this.setAuth();
			$("#pageLoading").hide();
		}
	},
	//权限设置
	setAuth(){
		var $serviceNav = $(".servicesIndexBox .servicesIndex"),
		    user = JSON.parse(localStorage.user || "{}"),
		    isKeyUser = user.isKeyUser || false,
			_AuthObj=App.AuthObj||{};

		if (_AuthObj && !_AuthObj.service) {
			$serviceNav.remove();
		} else {
			var Auth = _AuthObj.service||{};
			 
			if (!Auth.app) {
				$serviceNav.find(".application").remove();
			}
		 
			if (!Auth.auth && !isKeyUser) {
				$serviceNav.find(".notice").remove();
			}
		 
			if (!Auth.log) {
				$serviceNav.find(".log").remove();
			}
			 
			if (!Auth.operationManual) {
				$serviceNav.find(".workbook").remove();
			}

			if (!Auth.sys) {
				$serviceNav.find(".systen").remove();
			}

			if (!Auth.project) {
				$serviceNav.find(".project").remove();
			}
		}
		//判断是否是空页面
		this.isNullPage();
	},

	isNullPage(){	

		var $page=$(".servicesIndexBox"); 
		//空页面
		if ($page.find(".item").length<=0) {
			$page.html(_.templateUrl('/services/tpls/nullPage.html'),true);
		}

	}


};