
//项目设计
App.Project.ProjectDesingn = Backbone.View.extend({

	tagName: 'div',

	id: 'projectDesignContainer',

	//初始化
	initialize: function() {
		//this.listenTo(App.Project.FileCollection,"add",this.addOneFile); 
	},

	//template: _.templateUrl('/projects/tpls/project/project.design.html', true),

	render: function() {
		
		//设计导航
		this.$el.html(new App.Project.ProjectDesignNav().render().el);
		//项目设计内容
		this.$el.append(new App.Project.ProjectDesingnContent().render().el);
		
		return this;
	} 
	 


});