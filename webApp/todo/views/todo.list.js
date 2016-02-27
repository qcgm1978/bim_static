

App.Todo.TodoListView=Backbone.View.extend({

	tagName:'div',

	className:'todoList',

	// 重写初始化
	initialize:function(){ 
		this.listenTo(App.Todo.TodoCollection, 'add', this.addOne);  
		 
	}, 

	//代办
	events:{
		 
	},  

	template:_.templateUrl("./todo/tpls/todo.list.html",true),

	render:function(){ 
	 
		this.$el.html(this.template);
		//type=="my-backbone-fast" && this.$el.find(".fast").addClass('selected')|| this.$el.find(".msg").addClass('selected');
		return this;

	},

	addOne:function(model){ 
		//渲染单个view
	    var view=new App.Todo.TodoDetailView({model:model});
	    if (App.Todo.Settings.type=="commission") {
			this.$el.find('.commissionLists').append(view.render().el); 
	    }else{
	    	this.$el.find('.alreadyLists').append(view.render().el); 
	    }
    	
	} 

});
