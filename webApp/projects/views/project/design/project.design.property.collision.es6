
//设计属性 碰撞
App.Project.DesignCollision=Backbone.View.extend({

	tagName:"div",

	className:"detailList",

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
		App.Project.DesignAttr.CollisionTaskList.projectId = App.Project.Settings.CurrentVersion.projectId;
		App.Project.DesignAttr.CollisionTaskList.projectVerionId = App.Project.Settings.CurrentVersion.id;
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
				this.element.find(".content").html(new App.Project.ProjectDesignSetting().render().el);			},
			okCallback:function(){
				var formData = {},
						taskName = $("#taskName").val(),
						floor = $("#floor").val(),
						treeA = $("#treeA"),
						treeB = $("#treeB");
				formData.name = taskName;
				formData.floor = floor;
				formData.chooseA = getSpecialty(treeA);
				formData.chooseB = getSpecialty(treeB);
				formData.projectId=App.Project.Settings.projectId;
				formData.projectVerionId=App.Project.Settings.CurrentVersion.id;
				data = {
	        type:'post',
	        URLtype:"creatCollisionTask",
	        contentType:"application/json",
	        data:JSON.stringify(formData)
	      }
	      App.Comm.ajax(data,function(data){
		      if (data.message=="success") {
		      	console.log('')
		      }else{
		        alert(data.message);
		      }
		    });
			}
		})
		function getSpecialty(element){
			var data = []
			element.find(".subTree").each(function(){
				var that = $(this),
						specialty = that.data("type"),
						categories = [];
				that.find(".inputCheckbox").each(function(){
					var _self = $(this),
							code = _self.data("id");
					if(_self.is(":checked")){
						categories.push(code);
					}
				});
				if(categories.length>0){
					data.push({
						"specialty":specialty,
						"categories":categories
					});
				}
			});
			return data;
		}
	},

	getDetail:function(event){
		var list = this.$el.find('.collSelect');
		list.hide();
		var that = $(event.target).closest('.collItem');
		collisionId = that.data('id');
		App.Project.DesignAttr.CollisionTaskDetail.projectId = App.Project.Settings.projectId
		App.Project.DesignAttr.CollisionTaskDetail.projectVersionId = App.Project.Settings.CurrentVersion.id
		App.Project.DesignAttr.CollisionTaskDetail.collisionId = collisionId
		App.Project.DesignAttr.CollisionTaskDetail.fetch();
	}

});


