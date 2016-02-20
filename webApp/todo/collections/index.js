

/**
 * @require /todo/module/todo.list.es6
 */

App.Todo = {

	Settings:{
		type:"commission"
	},

	TodoCollection: new(Backbone.Collection.extend({

		model: App.TodoModule.TodoListModule

		//parse 
	})),


	init: function() {


		//nav
		$("#contains").html(new App.Todo.NavView().render().$el);
		// list contain
		$("#contains").append(new App.Todo.TodoListView().render().$el);
		// load list
		App.Todo.fetch();
		//App.Todo.TodoCollection.fetch();

	},

	fetch : function(type) {

		//删除所有数据
		App.Todo.TodoCollection.models=[];

		$(".todoLists").empty();

		var data = [],msg="我是未完成";

		if (type) {
			msg="我是已经完成"
		};
		for (var i = 0; i < 13; i++) {
			data.push({
				title: msg + i,
				userName:'张三'+i,
				time:'2016-12-12'
			});
		}

		App.Todo.TodoCollection.add(data);
	} 

}