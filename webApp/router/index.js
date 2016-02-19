

var AppRoute=Backbone.Router.extend({

	routes:{
		'':'todo',
		'todo':'todo', 
		'projects':'projects', 
		'flow':'flow', 
		'resources':'resources', 
		'console':'console', 
		'list/:id':'list'		 
	},

	todo:function(){ 
		//加载css js
		_.require('/dist/todo/todo.css');
		_.require('/dist/todo/todo.js');  
		App.Todo.init();  
	},

 
	projects:function(){
	   $("#contains").html("项目");  
	},

	flow:function(){
		 
		  $("#contains").html("flow");
		 
	},

	resources:function(){
		 
		  $("#contains").html("resources");
		 
	},

	console:function(){ 
		$("#contains").html("console");
	}

	 

});
 
App.Router=new AppRoute();
 
//开始监听
Backbone.history.start();
 
 