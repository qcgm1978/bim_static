var AppRoute = Backbone.Router.extend({

	routes: {
		'': 'bodyContent',
		'todo': 'todo',
		'inbox': 'inbox',
		'projects': 'projects',
		'projects/:id/:versionId': 'project',
		'projects/:id/:versionId/:viewPintId': 'projectViewPoint',
		'flow': 'flow',
		'resources': 'resources',
		'resources/:type': 'resource',
		'resources/:type/:optionType': 'resourceMapping',
		'resources/:type/:projectId/:versionId': 'resourceModel',
		'console': 'console',
		'console/:type/:step': 'console',
		'console1': 'console1',
		'console1/:type/:step': 'console1',
		'services': 'services',
		'services/:type': 'services',
		'services/:optionType/:projectModelId': 'servicesMappingRule',
		'list/:id': 'list',
		'bodyContent': 'bodyContent',
		'logout': 'logout',
		"post/detail/:id": 'postDetail'
	},
	//首页主体展示

	bodyContent: function() {

		this.reset();
		$("#topBar .navHeader").find(".item").removeClass("selected").end().find(".bodyConMenu").addClass('selected');
		_.require('/static/dist/bodyContent/bodyContent.css');
		_.require('/static/dist/bodyContent/bodyContent.js');
		App.BodyContent.control.init();
		$("#pageLoading").hide();
	},

	logout: function() { 
		//清除cookie
		App.Comm.clearCookie(); 
		
		App.Comm.setCookie('IS_OWNER_LOGIN', '1'); 
		 
		localStorage.removeItem("user");
		
		window.location.href = "/login.html";
	},
	//待办
	todo: function() {

		this.reset();
		$("#topBar .navHeader").find(".item").removeClass("selected").end().find(".todo").addClass('selected');
		//加载css js
		_.require('/static/dist/todo/todo.css');
		_.require('/static/dist/todo/todo.js');
		App.Todo.init();
	},
	//消息中心
	inbox: function() {
		this.reset();
		//加载css js
		_.require('/static/dist/imbox/imbox.css');
		_.require('/static/dist/imbox/imbox.js');
		App.INBox.init();
	},
	postDetail: function(id) {
		_.require('/static/dist/bodyContent/bodyContent.css');
		_.require('/static/dist/bodyContent/bodyContent.js');
		App.BodyContent.control.post(id);
	},
	//项目
	projects: function() {
		this.reset();
		//销毁上传
		$("#topBar .navHeader").find(".item").removeClass("selected").end().find(".projects").addClass('selected');
		//加载css js
		_.require('/static/dist/projects/projects.css');
		_.require('/static/dist/projects/projects.js');
	//	//_.require('http://www.api.map.baidu.com/api?v=2.0&ak=osmP2eNEjPlvebAAIVhcDc6c');
		App.Projects.init();
	},

	//单个项目
	project: function(id, versionId) {

		this.reset();

		$("#topBar .navHeader").find(".item").removeClass("selected").end().find(".projects").addClass('selected');
		_.require('/static/dist/projects/projects.css');
		_.require('/static/dist/projects/projects.js');

		App.Project.Settings = $.extend({}, App.Project.Defaults);

		App.Project.Settings.projectId = id;

		App.Project.Settings.versionId = versionId;

		App.Project.init();
	},

	//直接转到视点
	projectViewPoint: function(id, versionId, viewPintId) {

		this.reset();

		$("#topBar .navHeader").find(".item").removeClass("selected").end().find(".projects").addClass('selected');
		_.require('/static/dist/projects/projects.css');
		_.require('/static/dist/projects/projects.js');

		App.Project.Settings = $.extend({}, App.Project.Defaults);

		App.Project.Settings.projectId = id;

		App.Project.Settings.versionId = versionId;

		App.Project.Settings.viewPintId = viewPintId;

		App.Project.init();
	},

	//流程
	flow: function() {
		this.reset();
		//销毁上传
		$("#topBar .navHeader").find(".item").removeClass("selected").end().find(".flow").addClass('selected');
		_.require('/static/dist/flow/flow.css');
		_.require('/static/dist/flow/flow.js');
		App.Flow.Controller.init();
	},

	//资源库
	resources: function() {
		this.reset();
		//销毁上传
		$("#topBar .navHeader").find(".item").removeClass("selected").end().find(".resources").addClass('selected');
		_.require('/static/dist/resources/resources.css');
		_.require('/static/dist/resources/resources.js');
		App.Resources.init();
		$("#pageLoading").hide();
		//$("#contains").html("resources");

	},

	//单个项目
	resource: function(type) {
		this.reset();
		$("#topBar .navHeader").find(".item").removeClass("selected").end().find(".resources").addClass('selected');
		_.require('/static/dist/resources/resources.css');
		_.require('/static/dist/resources/resources.js');
		App.ResourcesNav.Settings.type = type;
		App.ResourcesNav.init();
	},

	//项目映射
	resourceMapping: function(type, optionType) {
		this.reset();
		$("#topBar .navHeader").find(".item").removeClass("selected").end().find(".resources").addClass('selected');
		_.require('/static/dist/resources/resources.css');
		_.require('/static/dist/resources/resources.js');
		App.ResourcesNav.Settings.type = type;
		App.ResourcesNav.Settings.optionType = optionType;
		App.ResourceArtifacts.Status.type = 1;
		new App.ResourcesNav.App().render();
		App.ResourceArtifacts.resetPreRule();
		App.ResourceArtifacts.Settings.ruleModel = 3; //权限入口，模块化，质量标准
		$("#pageLoading").hide();
	},

	resourceModel: function(type, projectId, versionId) {
		this.reset();
		$("#topBar .navHeader").find(".item").removeClass("selected").end().find(".resources").addClass('selected');
		_.require('/static/dist/resources/resources.css');
		_.require('/static/dist/resources/resources.js');
		App.ResourcesNav.Settings.type = App.ResourceModel.Settings.type = type;
		App.ResourceModel.Settings.CurrentVersion = {};
		App.ResourceModel.Settings.projectId = projectId;
		App.ResourceModel.Settings.versionId = versionId;
		App.ResourceModel.init();
	},


	//貌似改掉了
	console: function(type, step) {
		this.reset();
		//销毁上传
		_.require('/static/dist/console/console.css');
		_.require('/static/dist/console/console.js');
		$("#topBar .navHeader").find(".item").removeClass("selected").end().find(".console").addClass('selected');
		App.Console.Settings.type = type;
		App.Console.Settings.step = step;
		App.Console.init();
		$("#pageLoading").hide();
	},
	//by zzx
	console1: function(type, step) {
		this.reset();
		//销毁上传
		_.require('/static/dist/console1/console.css');
		_.require('/static/dist/console1/console.js');
		$("#topBar .navHeader").find(".item").removeClass("selected").end().find(".console").addClass('selected');
		App.Console.Settings.type = type;
		App.Console.Settings.step = step;
		App.Console.init();
		$("#pageLoading").hide();
	},

	//服务-项目管理-项目映射规则
	servicesMappingRule: function(type, optionType, projectModelId) {
		this.reset();
		$("#topBar .navHeader").find(".item").removeClass("selected").end().find(".services").addClass('selected');
		_.require('/static/dist/resources/resources.css');
		_.require('/static/dist/resources/resources.js');
		App.ResourcesNav.Settings.type = type;
		App.ResourcesNav.Settings.optionType = optionType;
		App.ResourceArtifacts.Status.projectId = optionType;
		App.ResourceArtifacts.Status.type = 2;
		new App.ResourcesNav.App().render();
		App.ResourceArtifacts.resetPreRule();
		App.ResourceArtifacts.Settings.ruleModel = 3; //权限入口，模块化，质量标准
		$("#pageLoading").hide();
	},


	services: function(type, tab) {
		this.reset();
		$("#pageLoading").hide();
		$("#topBar .navHeader").find(".item").removeClass("selected").end().find(".services").addClass('selected');
		_.require('/static/dist/services/services.css');
		_.require('/static/dist/services/services.js');
		$("#bottomBar").hide(); //隐藏脚部
		App.Services.init(type, tab);
	},

	//重置数据
	reset: function() {
		 //判断是否是IE浏览器
		var hash = window.location.hash;
		if(hash && hash!="#bodyContent"){
			var explorer = window.navigator.userAgent ;
			//ie
			if (!!window.ActiveXObject || "ActiveXObject" in window){
				window.location.href = location.host + "/static/dist/app/todo/remind.html";
			}
		}

		if (!$._data($(".user > span")[0], "events")) {
			//绑定用户信息
			App.TopNav.init();
		}
		//用户信息
		App.Global.User = JSON.parse(localStorage.getItem("user"));
		$("#pageLoading").show();

		//销毁上传
		App.Comm.upload.destroy();
		App.Global.User && $("#topBar .userName .text").text(App.Global.User.name);

		if (!App.Global.User || !App.Comm.getCookie('OUTSSO_AuthMAC')) {
			App.Comm.ajax({
				URLtype:"current"
			});
			return;
			//location.href="/login.html";
		}

		var Autharr = App.Global.User && App.Global.User["function"],
			keys, len;
		App.AuthObj = {};
		//遍历权限
		$.each(Autharr, function(i, item) {
			keys = item.code.split('-');
			len = keys.length;

			if (len == 1) {
				App.AuthObj[keys[0]] = true;
			} else {

				App.AuthObj[keys[0]] = App.AuthObj[keys[0]] || {}

				if (len == 2) {
					App.AuthObj[keys[0]][keys[1]] = true
				} else {
					App.AuthObj[keys[0]][keys[1]] = App.AuthObj[keys[0]][keys[1]] || {}
					App.AuthObj[keys[0]][keys[1]][keys[2]] = true;
				}

			}
		});


	}



});



App.Router = new AppRoute();

//开始监听
Backbone.history.start();