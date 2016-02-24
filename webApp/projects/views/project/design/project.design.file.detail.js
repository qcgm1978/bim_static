

App.Project.ProjectDesingnFileDetail=Backbone.View.extend({

	tagName:"li",

	className:"item",

	//初始化
	initialize:function(){
		//this.listenTo(this.model, 'change', this.render);
	   // this.listenTo(this.model, 'destroy', this.removeItem); 
	},

	//事件绑定
	events:{

	},
	
	template:_.templateUrl("/projects/tpls/project/design/project.design.file.detail.html"),

	//渲染
	render:function(){
		 
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}


});