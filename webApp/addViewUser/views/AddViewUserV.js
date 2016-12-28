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
	initialize:function(){
		this.listenTo(App.AddViewUser.getViewUserListC, "add", this.addOne);
		this.listenTo(App.AddViewUser.getViewUserListC, "reset", this.reset);
	},
	el:$("#contains"),
	template:_.templateUrl("/addViewUser/tpls/index.html"),
	events: {
 		"click .viewUserTopTab li": "switchTab",
 		"click #addViewUserBtn": "addViewUserFun",
 		"click .viewUserEdite": "addViewUserFun",
 		"click #myDropText": "myDropDownFun",
 		"click .viewUserDelete": "viewUserDeleteFun",
 		"click #deleteBtn": "deleteUserFun",
 	},
 	defautlSetings:{
 		pageIndex:1,
 	},
	render:function(){
	    this.$el.html(this.template({state:this.default.state}));
	    this.getViewUserListFun();
	    return this;
	},
	viewUserDeleteFun:function(evt){//删除浏览用户的列表的方法
		var _this =  this;
		var target = $(evt.target);
		var deleteId = target.data("loginid");
		var ifrem = _.templateUrl("/addViewUser/tpls/deleteViewUserAlert.html")();
		var viewUserDeleteDialog = new App.Comm.modules.Dialog({
		    title: "删除当前浏览用户",
		    width: 280,
		    height: 100,
		    isConfirm: false,
		    isAlert: false,
		    message: ifrem
		})
		$(".deleteBtn").off("click")
		$(".deleteBtn").on("click",function(){
			_this.deleteUserFun(deleteId,viewUserDeleteDialog);
		})
	},
	deleteUserFun:function(deleteId,viewUserDeleteDialog){//删除当前用户的方法
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
				_this.getViewUserListFun();
				viewUserDeleteDialog.close();
			}
		})
	},
	getViewUserListFun:function(){//获取浏览用户列表的方法
	    var _data = {
	    	pageIndex:this.defautlSetings.pageIndex,
	    	pageItemCount:App.Comm.Settings.pageItemCount
	    }
	    App.AddViewUser.getViewUserListC.fetch({
			data: _data,
			success: function(collection, response, options) {
				
			}
		})
	},
	renderDom:function(){
		this.$el.html(this.template({state:this.default.state}));
	},
	//获取用户列表的方法
	addOne: function(model) {
		var data = model.toJSON(); 
		this.default.state.userListData = data.items;
		this.renderDom();
	},
	//清空内容
	emptyContent:function(){
		this.$el.find(".viewUserListBox > table > tbody").html('<li class="loading">正在加载...</li>');
	},
	switchTab:function(event){
		var target = $(event.target);
		if(!target.hasClass('selected')){
			this.default.state.selectedIndex = target.data('type');
			this.default.state.showIndex = target.data('type');
			this.render();
		}
	},
	addViewUserFun:function(evt){
		var target = $(evt.target);
		var dialogEle = new App.AddViewUser.AddViewUserDialogV;
		if(target.hasClass('viewUserEdite')){
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
		}else{
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
		}
	},
});