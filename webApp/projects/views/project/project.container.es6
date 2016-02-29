App.Project.ProjectContainer = Backbone.View.extend({

	tagName: 'div',

	className: 'projectContent', 

	template: _.templateUrl('/projects/tpls/project/project.container.html',true),

	events:{
		"click .breadItem":"breadItemClick"
	},

	render: function() {
		this.$el.html(this.template);
		//导航
		this.$el.find("#projectContainer").prepend(new App.Project.leftNav().render().el);
		 
		//加载文件
		this.$el.find(".projectCotent").prepend(new App.Project.FileContainer().render().el);
		return this;
	},

	//点击面包靴
	breadItemClick:function(event){
		  var dialog = new App.Comm.modules.Dialog({
                width: 580,
                height: 268,
                limitHeight: false,
                title: '新建任务',
                cssClass: 'task-create-dialog',
                okText: '添&nbsp;&nbsp;加',
                message: "内容"
              
            })
	}

	 
});