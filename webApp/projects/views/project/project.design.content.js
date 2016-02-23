App.Project.ProjectDesingnContent = Backbone.View.extend({

	tagName: 'div',

	id: 'projectDesignContent',

	//初始化
	initialize: function() {
		this.listenTo(App.Project.FileCollection,"add",this.addOneFile); 
	},

	events: {

	},

	template: _.templateUrl('/projects/tpls/project/project.design.content.html', true),

	render: function() { 

		this.$el.append(this.template);
		
		return this;
	},

	//添加单个li
	addOneFile:function(model){
		  
		var view=new App.Project.ProjectDesingnFileDetail({
			model:model
		});
		this.$el.find(".fileContent").append(view.render().el);
	}



});