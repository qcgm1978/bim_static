var AppRoute = Backbone.Router.extend({

	routes: {
		'': 'todo',
		'todo': 'todo',
		'projects': 'projects',
		'projects/:id': 'project',
		'flow': 'flow',
		'resources': 'resources',
		'resources/:type': 'resource',
		'resources/:type/:projectId/:versionId': 'resourceModel',
		'console': 'console',
		'console/:type/:step': 'console',
		'list/:id': 'list'
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
	project: function(id) {
		this.reset();
		$("#topBar .navHeader").find(".item").removeClass("selected").end().find(".projects").addClass('selected');
		_.require('/static/dist/projects/projects.css');
		_.require('/static/dist/projects/projects.js');
		App.Project.Settings.projectId = id;
		App.Project.init();
	},

	//流程
	flow: function() {
		this.reset();
		//销毁上传
		$("#topBar .navHeader").find(".item").removeClass("selected").end().find(".flow").addClass('selected');
		_.require('/static/dist/flow/flow.css');
		_.require('/static/dist/flow/flow.js');

		$("#contains").html(new App.Flow().render().el);

	},

	//资源库
	resources: function() {

		this.reset();
		//销毁上传
		$("#topBar .navHeader").find(".item").removeClass("selected").end().find(".resources").addClass('selected');
		_.require('/static/dist/resources/resources.css');
		_.require('/static/dist/resources/resources.js');
		App.Resources.init();
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

	resourceModel: function(type, projectId, versionId) {

		this.reset();
		$("#topBar .navHeader").find(".item").removeClass("selected").end().find(".resources").addClass('selected');
		_.require('/static/dist/resources/resources.css');
		_.require('/static/dist/resources/resources.js');
		App.ResourcesNav.Settings.type = App.ResourceModel.Settings.type = type;
		App.ResourceModel.Settings.projectId = projectId;
		App.ResourceModel.Settings.versionId = versionId;
		App.ResourceModel.init();
	},


	//貌似改掉了
	console: function(type,step) {
		this.reset();
		//销毁上传
		_.require('/static/dist/console/console.css');
		_.require('/static/dist/console/console.js');
		$("#topBar .navHeader").find(".item").removeClass("selected").end().find(".console").addClass('selected');
		App.Console.Settings.type=type;
		App.Console.Settings.step=step;
		App.Console.init();
	},

	//重置数据
	reset: function() {
		//销毁上传
		App.Comm.upload.destroy();
	}



});



App.Router = new AppRoute();

//开始监听
Backbone.history.start();