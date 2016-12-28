/*!/addViewUser/collection/index.js调用*/
App.AddViewUser.AddViewUserV = Backbone.View.extend({
	default:{
		state:{
			selectedIndex:"userList",
			showIndex:"userList",
			userListData:[],
			userSetData:[{
				name:"ys"
			}],
		},
	},
	el:$("#contains"),
	template:_.templateUrl("/addViewUser/tpls/index.html"),
	events: {
 		"click .viewUserTopTab li": "switchTab",
 		"click #addViewUserBtn": "addViewUserFun",
 	},
 	defautlSetings:{
 		pageIndex:1,
 	},
	render:function(){
		this.$el.html(this.template({state:this.default.state}));
	    this.getViewUserListFun();//第一次进入 获取用户列表的方法
	    return this;
	},
	getViewUserListFun:function(){//获取浏览用户列表的方法
		var _this = this;
	    var _data = {
	    	pageIndex:this.defautlSetings.pageIndex,
	    	pageItemCount:App.Comm.Settings.pageItemCount
	    }
	    this.$el.find(".viewUserListBox").html('<div class="demoLoading">正在加载...</div>');
	    App.AddViewUser.getViewUserListC.fetch({
			data: _data,
			success: function(collection, response, options) {
				if(response.code == 0){
					_this.default.state.userListData = response.data.items;
					_this.renderDom();
				}
			}
		})
	},
	renderDom:function(){//渲染页面的方法
		var addViewUserListV = new App.AddViewUser.AddViewUserListV;
		this.$el.find(".viewUserListBox").html('');
		this.$el.find(".viewUserListBox").append(addViewUserListV.render(this.default.state.userListData).el);
	},
	switchTab:function(event){
		var target = $(event.target);
		if(!target.hasClass('selected')){
			this.default.state.selectedIndex = target.data('type');
			this.default.state.showIndex = target.data('type');
			this.renderDom();
		}
	},
	addViewUserFun:function(evt){//添加用户列表的方法
		var dialogEle = new App.AddViewUser.AddViewUserDialogV;
		dialogEle = dialogEle.render().el;
		//初始化窗口
		App.AddViewUser.AddViewUserV.closeDialog = new App.Comm.modules.Dialog({
		    title:"新建用户",
		    width:400,
		    height:300,
		    isConfirm:false,
		    isAlert:false,
		    closeCallback:function(){},
		    message:dialogEle
		});
	},
});