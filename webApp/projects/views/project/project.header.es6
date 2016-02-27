App.Project.ProjectHeader = Backbone.View.extend({

	tagName: 'div',

	className: 'projectHeader', 

	template: _.templateUrl('/projects/tpls/project/project.header.html',true),

	events:{
		"click .breadItem":"breadItemClick"
	},

	render: function() {
		this.$el.html(this.template);
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