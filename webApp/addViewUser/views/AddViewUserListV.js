App.AddViewUser.AddViewUserListV = Backbone.View.extend({
	template:_.templateUrl("/addViewUser/tpls/AddViewUserListV.html"),
	events: {
 		"click .viewUserEdite": "editViewUserFun",
 		"click .viewUserDelete": "deleteViewUserFun",
 	},
	render:function(model){
		this.$el.html(this.template({state:model}));
		return this;
	},
	editViewUserFun:function(evt){//编辑用户列表
		var target = $(evt.target);
		var dialogEle = new App.AddViewUser.AddViewUserDialogV;
		var editId = target.data("loginid");
	    var _data = {
	    	loginId:editId,
	    }
	    App.AddViewUser.getViewUserInfoC.fetch({
			data: _data,
			success: function(collection, response, options) {
				dialogEle = dialogEle.render(response.data).el;
				//初始化窗口
				App.AddViewUser.AddViewUserV.closeDialog = new App.Comm.modules.Dialog({
				    title:"编辑用户",
				    width:400,
				    height:300,
				    isConfirm:false,
				    isAlert:false,
				    closeCallback:function(){},
				    message:dialogEle
				});
			}
		})
	},
	deleteViewUserFun:function(evt){//删除浏览用户的列表的方法
		var _this =  this;
		var target = $(evt.target);
		var deleteId = target.data("loginid");
		var ifrem = _.templateUrl("/addViewUser/tpls/deleteViewUserAlert.html")();
		App.AddViewUser.AddViewUserListV.viewUserDeleteDialog = new App.Comm.modules.Dialog({
		    title: "删除当前浏览用户",
		    width: 280,
		    height: 100,
		    isConfirm: false,
		    isAlert: false,
		    message: ifrem
		})
		$(".deleteBtn").off("click")
		$(".deleteBtn").on("click",function(){
			_this.deleteUserFun(deleteId);
		})
	},
	deleteUserFun:function(deleteId,viewUserDeleteDialog){//点击弹出层里面的确定按钮执行的方法
		var _this = this;
		var data = {
			URLtype: "deleteViewUser",
			data:{
				loginId:deleteId
			},
			type: "DELETE",
		}
		App.Comm.ajax(data,function(result){
			if(result.data == "ok"){
				var AddViewUserV = new App.AddViewUser.AddViewUserV;
		       		AddViewUserV.getViewUserListFun();
				App.AddViewUser.AddViewUserListV.viewUserDeleteDialog.close();
			}
		})
	},
})