

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
			this.bindScroll("commissionLists");
	    }else{
	    	this.$el.find('.alreadyLists').append(view.render().el); 
	    	this.bindScroll();
	    }
    	
	} ,

	bindScroll:function(type){

		//  $(selector).mCustomScrollbar("destroy");
		 
		var $content = $("#todoContent"),$el;
		if (type=="commissionLists") {
			$el=$content.find(".commissionBox");
		}else{
			$el=$content.find(".alreadyBox");
		}

		//绑定过了
		if ($el.hasClass('mCustomScrollbar ')) {
			return;
		} 

		//代办滚动条
		$el.mCustomScrollbar({
			set_height: "100%",
			theme: 'minimal-dark',
			axis: 'y',
			keyboard: {
				enable: true
			},
			scrollInertia: 0
		}); 

	}


});
