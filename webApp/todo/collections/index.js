

/**
 * @require /todo/module/todo.list.es6
 */ 

App.Todo = {

	Settings:{
		type:"commission"
	},

	TodoCollection: new(Backbone.Collection.extend({

		model: App.TodoModule.TodoListModule,

		debugUrl:"/dataJson/todo/todo.json",

		url:""

		//parse 
	})),


	init: function() {


		//nav
		$("#contains").html(new App.Todo.NavView().render().$el);
		// list contain
		$("#contains").append(new App.Todo.TodoListView().render().$el); 

		// load list
		App.Todo.TodoCollection.fetch();
		//App.Todo.TodoCollection.fetch();

		//初始化滚动条
		App.Todo.initScroll();
	},

	initScroll:function(){

		//  $(selector).mCustomScrollbar("destroy");

		var $content=$("#todoContent");

		  $content.find(".commissionBox").mCustomScrollbar({
		  		set_height:"100%",
                theme: 'minimal-dark',
                axis: 'y',
                keyboard: {
                    enable: true
                },
                scrollInertia: 0
            });

		   $content.find(".alreadyBox").mCustomScrollbar({
		  		set_height:"100%",
                theme: 'minimal-dark',
                axis: 'y',
                keyboard: {
                    enable: true
                },
                scrollInertia: 0
            });

	 
	},


	//未用
	fetch : function(type) {

		//删除所有数据
		App.Todo.TodoCollection.models=[];

		$(".todoLists").empty();

		var data = [],msg="我是未完成";

		if (type) {
			msg="我是已经完成"
		};
		for (var i = 0; i < 13; i++) {
			data.push();
		}

		App.Todo.TodoCollection.add(data);
	} 

}