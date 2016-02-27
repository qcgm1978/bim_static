var AppRoute = Backbone.Router.extend({

	routes: {
		'': 'todo',
		'todo': 'todo',
		'projects': 'projects',
		'projects/:id': 'project',
		'flow': 'flow',
		'resources': 'resources',
		'console': 'console',
		'list/:id': 'list'
	},

	todo: function() {
		//销毁上传
		App.Comm.upload.destroy();
		$("#topBar .nav").find(".item").removeClass("selected").end().find(".todo").addClass('selected');
		//加载css js
		_.require('/dist/todo/todo.css');
		_.require('/dist/todo/todo.js');
		App.Todo.init();
	},


	projects: function() {
		//销毁上传
		$("#topBar .nav").find(".item").removeClass("selected").end().find(".projects").addClass('selected');
		//加载css js
		_.require('/dist/projects/projects.css');
		_.require('/dist/projects/projects.js');
		//_.require('http://www.api.map.baidu.com/api?v=2.0&ak=osmP2eNEjPlvebAAIVhcDc6c');
		App.Projects.init();

	},


	project: function(id) {
		$("#topBar .nav").find(".item").removeClass("selected").end().find(".projects").addClass('selected');
		_.require('/dist/projects/projects.css');
		_.require('/dist/projects/projects.js');
		App.Project.init();
	},


	flow: function() {
		//销毁上传
		$("#topBar .nav").find(".item").removeClass("selected").end().find(".flow").addClass('selected');
		_.require('/dist/flow/flow.css');
		_.require('/dist/flow/flow.js');

		$("#contains").html(new App.Flow().render().el);

	},

	resources: function() {
		//销毁上传
		$("#topBar .nav").find(".item").removeClass("selected").end().find(".resources").addClass('selected');

		$("#contains").html("resources");

	},

	console: function() {
		//销毁上传
		$("#topBar .nav").find(".item").removeClass("selected").end().find(".console").addClass('selected');
		$("#contains").html("console");
	}



});



App.Router = new AppRoute();

//开始监听
Backbone.history.start();