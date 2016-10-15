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
			this.initEvent();
			this.loadXW();
		}
	},

	initEvent:function(){
		$('.tileIcon').on('click',function(){
			var name=$(this).attr('name');
			if(name=='suggest'){
				App.Services.SuggestView.init();
			}
		})
	},

	loadXW:function(){
		if (window['$ibot']) {
			App.Services.initXW();
			return
		}
		$("<link>")
			.attr({
				rel: "stylesheet",
				type: "text/css",
				href: "http://xiaowan.wanda.cn/wdrobot/rjfiles/css/robot.css"
			})
			.appendTo("head");
		$.getScript('http://xiaowan.wanda.cn/wdrobot/rjfiles/js/robot.js', function (a) {
			App.Services.initXW();
		});
	},
	//初始化小万机器人
	initXW:function(){
		//设计角色：4F88E20D-BD8F-43E2-857B-A94F5828662D
		//计划角色：C2E3CC70-7481-403D-8554-87F2B8501D16
		//成本角色：17EBA967-A8FF-475D-B9C4-1B7E4AB71692
		//质量角色：9CBE6DC9-7DAC-4A9B-89D1-0F7C68EECB80
		var key='17EBA967-A8FF-475D-B9C4-1B7E4AB71692';
		var welcomeQuestion='hello';
		var remindMsg='输入文字提问';
		var inputTooLongMsg='输入过长';
		$ibot.run('small-robot-div', null,'小万',key,welcomeQuestion,remindMsg,inputTooLongMsg, {
			'width' : $("#robotDiv").width()-400,
			'height' : $("#contains").height()-36,
			'btnWidth' : 70,
			'btnHeight' : 30,
			'inputDivHeight':75,
			'toolbarDivHight':40,
			'toolbarContentDivHeight':35,
			'toolbarContentDivWidth':150,
			'toolbarContentDivMarginLeft':20,
			'inputLength':100,
			// 为解决跨域问题，这里在hosts配置了127.0.0.1为ibot.xiaoi.com,在访问页面的时候可以用127.0.0.1
			'robotAskUrl':'http://xiaowan.wanda.cn/wdrobot/appAsk?t='+new Date().getTime(),
			'robotQuestionUrl':'http://xiaowan.wanda.cn/wdrobot/appQuestion?t='+new Date().getTime()
		});

		$(window).resize(function() {
			var url=window.location.href;
			if(url=="http://bim.wanda-dev.cn/#services"){
				window.location.reload();
			}
		});
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