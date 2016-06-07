var AppRoute = Backbone.Router.extend({

	routes: {
		'': 'bodyContent',
		'todo': 'todo',
		'imbox': 'imbox',
		'projects': 'projects',
		'projects/:id/:versionId': 'project',
		'flow': 'flow',
		'resources': 'resources',
		'resources/:type': 'resource',
		//'resources/:type/:reltype/:ruleType': 'resourcesArtifacts',
		'resources/:type/:projectId/:versionId': 'resourceModel',
		'console': 'console',
		'console/:type/:step': 'console',
		'console1': 'console1',
		'console1/:type/:step': 'console1',
		'services': 'services',
		'services/:type': 'services',
		'services/:type/:tab': 'services',
		'list/:id': 'list',
		'bodyContent': 'bodyContent',
		'logout': 'logout'
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

		App.Comm.delCookie('OUTSSO_AuthToken');
		App.Comm.delCookie('AuthUser_AuthNum');
		App.Comm.delCookie('AuthUser_AuthMAC');
		App.Comm.delCookie('OUTSSO_AuthNum');
		App.Comm.delCookie('OUTSSO_AuthMAC');
		App.Comm.setCookie('IS_OWNER_LOGIN', '1');

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
	imbox: function() {
		this.reset();
		//加载css js
		_.require('/static/dist/imbox/imbox.css');
		_.require('/static/dist/imbox/imbox.js');
		App.IMBox.init();
	},

	//项目
	projects: function() {
		this.reset();
		//销毁上传
		$("#topBar .navHeader").find(".item").removeClass("selected").end().find(".projects").addClass('selected');
		//加载css js
		_.require('/static/dist/projects/projects.css');
		_.require('/static/dist/projects/projects.js');
		//_.require('http://www.api.map.baidu.com/api?v=2.0&ak=osmP2eNEjPlvebAAIVhcDc6c');
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

	/*resourcesArtifacts:function(type,reltype,ruleType){
		this.reset();
		$("#topBar .navHeader").find(".item").removeClass("selected").end().find(".resources").addClass('selected');
		_.require('/static/dist/resources/resources.css');
		_.require('/static/dist/resources/resources.js');
		//  规则模板   --  权限入口
		App.ResourceArtifacts.Settings.ruleModel = 3;         //    1 只有模块化，  2 只有质量标准  ， 3 有模块化和质量标准
		App.ResourcesNav.Settings.type = type;
		App.ResourcesNav.Settings.reltype = reltype;
		App.ResourcesNav.Settings.ruleType = ruleType;
		//App.AuthObj.lib.mappingRuleTemplate =true;
		App.ResourcesNav.init();
		//App.ResourceArtifacts.init();
	},*/

	//单个项目
	resource: function(type) {
		this.reset();
		$("#topBar .navHeader").find(".item").removeClass("selected").end().find(".resources").addClass('selected');
		_.require('/static/dist/resources/resources.css');
		_.require('/static/dist/resources/resources.js');
		App.ResourcesNav.Settings.type = type;
		App.ResourcesNav.init();
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

		$("#topSaveTip,#topSaveTipLine").remove();

		if (!$._data($(".user > span")[0],"events")) {
			//绑定用户信息
			App.TopNav.init();
		}		 
		//用户信息
		App.Global.User = JSON.parse(localStorage.getItem("user"));
		$("#pageLoading").show();
		//销毁右键
		$.fn.contextMenu.destory();
		//销毁上传
		App.Comm.upload.destroy();
		App.Global.User && $("#topBar .userName .text").text(App.Global.User.name);

		if (!App.Global.User) {
			return;
		}

		var Autharr =App.Global.User && App.Global.User["function"],
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