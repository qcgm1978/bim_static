
App.Projects.searchView=Backbone.View.extend({

	tagName:'div',

	className:'projectSearch', 
	
	//
	events:{
		 
	}, 

	template:_.templateUrl("/projects/tpls/project.search.html",true),

	addOne:function(model){
		//渲染单个view
	    var view=new App.Todo.TodoDetailView({model:model});
	    if (App.Todo.Settings.type=="commission") {
			this.$el.find('.commissionLists').append(view.render().el); 
	    }else{
	    	this.$el.find('.alreadyLists').append(view.render().el); 
	    }
    	
	},



	render:function(){ 
	 
		this.$el.html(this.template);
		//type=="my-backbone-fast" && this.$el.find(".fast").addClass('selected')|| this.$el.find(".msg").addClass('selected');
		return this;

	}

});
