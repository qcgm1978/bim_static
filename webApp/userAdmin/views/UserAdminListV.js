App.userAdmin.UserAdminListV = Backbone.View.extend({
	default:{
		pageIndex:1
	},
	template:_.templateUrl("/userAdmin/tpls/userAdminListV.html"),
	events: {
 		"click .viewUserEdite": "editViewUserFun",
 		"click .viewUserDelete": "deleteViewUserFun",
 	},
	render:function(){
		this.getViewUserListFun();//第一次进入 获取用户列表的方法
		return this;
	},
	getViewUserListFun:function(){//获取浏览用户列表的方法
		var _this = this;
	    var _data = {
	    	pageIndex:this.default.pageIndex,
	    	pageItemCount:App.Comm.Settings.pageItemCount
	    }
	    App.userAdmin.getViewUserListC.fetch({
			data: _data,
			success: function(collection, response, options) {
				if(response.code == 0){
					_this.$el.html("");
					_this.$el.html(_this.template({state:response.data.items}));
				}
			}
		})
	},
	editViewUserFun:function(evt){//编辑用户列表
		var target = $(evt.target);
		var EditDialogEle = new App.userAdmin.EditUserAdminListDialogV;
		var editId = target.data("loginid");
		var EditDialogEleDom = EditDialogEle.render(editId).el;
		//初始化窗口
		App.userAdmin.UserAdminListV.EditDialog = new App.Comm.modules.Dialog({
		    title:"编辑用户",
		    width:400,
		    height:300,
		    isConfirm:false,
		    isAlert:false,
		    closeCallback:function(){},
		    message:EditDialogEleDom
		});
	},
	deleteViewUserFun:function(evt){//删除浏览用户的列表的方法
		var _this =  this;
		var target = $(evt.target);
		var deleteId = target.data("loginid");
		var deleteDialogEle = new App.userAdmin.DeleteUserAdminListDialogV;
		var deleteDialogEleDom = deleteDialogEle.render(deleteId).el;
		App.userAdmin.UserAdminListV.Dialog = new App.Comm.modules.Dialog({
		    title: "删除用户",
		    width: 280,
		    height: 100,
		    isConfirm: false,
		    isAlert: false,
		    message: deleteDialogEleDom
		})
	},
})