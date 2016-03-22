
//设计属性 碰撞
App.Project.DesignCollision=Backbone.View.extend({

	tagName:"div",

	className:"designCollision",

	events: {
		"click .selectBox .currColl":"showSelectList",
		"click .newColl":"collPanel",
		"click .collItem":"getDetail"
	},

	template:_.templateUrl("/projects/tpls/project/design/project.design.property.collision.html",true),

	render:function(){
		this.$el.html(this.template);
		this.$el.find(".collBox").html(new App.Project.DesignCollisionDetail().render().el);
		this.$el.find(".selectBox").append(new App.Project.DesignCollisionTaskList().render().el);
		return this;
	},

	showSelectList:function(){
		// 显示碰撞任务列表
		var that = this;
		var list = that.$el.find('.collSelect');
		list.show();
		App.Project.DesignAttr.CollisionTaskList.fetch();
		$(document).on('click',that.hideSelectList);
	},

	hideSelectList:function(event){
		// 隐藏碰撞任务列表
		var that = this;
		var target = $(event.target);
		var list = $(that).find('.collSelect');
		if(!target.is('.selectBox,.selectBox *')){
			list.hide();
			$(document).off('click',that.hideSelectList);
		}
	},

	collPanel:function(){
		var dialog = new App.Comm.modules.Dialog({
			width: 580,
			height:360,
			limitHeight: false,
			title: '碰撞检查设置',
			cssClass: 'task-create-dialog',
			message: "",
			readyFn:function(){
				this.element.find(".content").html(new App.Project.ProjectDesignSetting().render().el)
				App.Project.DesignAttr.CollisionFilesList.projectId = App.Project.Settings.CurrentVersion.projectId
				App.Project.DesignAttr.CollisionFilesList.fetch();
			},
			okCallback:function(){
				var data = {},
						taskName = $("#taskName").val(),
						floor = $("#floor").val(),
						treeA = $("#treeA"),
						treeB = $("#treeB");
			}
		})
	},

	getDetail:function(event){
		var list = this.$el.find('.collSelect');
		list.hide();
		App.Project.DesignAttr.CollisionCollection.projectId = App.Project.Settings.CurrentVersion.projectId
		App.Project.DesignAttr.CollisionCollection.fetch();
	}

});


