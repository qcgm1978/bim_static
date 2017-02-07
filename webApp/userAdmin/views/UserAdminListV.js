App.userAdmin.UserAdminListV = Backbone.View.extend({
	tagName:'div',
	className:'userAdminClassName',
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
	initScroll:function(){
		$(".userAdminListClass").mCustomScrollbar({
             set_height: "100%",
             theme: 'minimal-dark',
             axis: 'y',
             keyboard: {
                 enable: true
             },
             scrollInertia: 0
         });
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
					var $content = $(".pagingBox");
					var pageCount = response.data.totalItemCount;
					$content.find(".sumDesc").html('共 ' + pageCount + ' 个用户');
					$content.find(".listPagination").empty().pagination(pageCount, {
					    items_per_page: response.data.pageItemCount,
					    current_page: response.data.pageIndex - 1,
					    num_edge_entries: 3, //边缘页数
					    num_display_entries: 5, //主体页数
					    link_to: 'javascript:void(0);',
					    itemCallback: function(pageIndex) {
					        //加载数据
					        _this.default.pageIndex = pageIndex + 1;
					        _this.getViewUserListFun();
					    },
					    prev_text: "上一页",
					    next_text: "下一页"
					});
					_this.initScroll();
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
		    width:600,
		    height:454,
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