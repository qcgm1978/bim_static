App.userAdmin.UserAdminIndexV = Backbone.View.extend({
	el:$("#contains"),
	template:_.templateUrl("/userAdmin/tpls/index.html"),
	events: {
 		"click #viewUlTab li": "switchTab",
 		"click #addViewUserBtn": "addViewUserFun",
 		"click .searchBtnBoxBtn": "searchBtnBox",
 		"click #addViewUserPrefixFun": "addViewUserPrefixFun",
 	},
	render:function(){
		this.$el.html(this.template());
		$("#viewUlTab").find("li").eq(0).addClass("selected");
		$("#viewShowBox > div").eq(0).css("display","block");
		this.renderUserAdminListDom();//显示用户列表
		$(".inputBox input").on('keydown',(e)=>this.initEventHandle(e));
		return this;
	},
	switchTab:function(event){
		var target = $(event.target);
		if(!target.hasClass('selected')){
			target.siblings().removeClass('selected').end().addClass('selected');
			if(target.data('type') == "userList"){
				this.renderUserAdminListDom();//显示用户列表
			}else if(target.data('type') == "userSet"){
				this.renderAddPrefixDom();//配置前缀
			}
		}
	},
	renderAddPrefixDom:function(){//加载添加前缀的方法
		$("#viewShowBox").find("div.viewUserSet").siblings().css("display","none").end().css("display","block");
		var UserAdminPrefixListV = new App.userAdmin.UserAdminPrefixListV;
		this.$el.find(".viewUserSetBox").append(UserAdminPrefixListV.render().el);
	},
	renderUserAdminListDom:function(parmer){//加载添加用户的方法
		$("#viewShowBox").find("div.viewUserList").siblings().css("display","none").end().css("display","block");
		var UserAdminListV = new App.userAdmin.UserAdminListV;
		this.$el.find(".viewUserListBox").html(UserAdminListV.render(parmer).el);
	},
	addViewUserFun:function(evt){//添加用户列表的方法
		var addDialogEle = new App.userAdmin.AddUserAdminDialogV;
		var addDialogEleDom = addDialogEle.render().el;
		//初始化窗口
		App.userAdmin.UserAdminIndexV.AddDialog = new App.Comm.modules.Dialog({
		    title:"新建用户",
		    width:600,
		    height:454,
		    isConfirm:false,
		    isAlert:false,
		    closeCallback:function(){},
		    message:addDialogEleDom
		});
	},
	searchBtnBox:function(){//点击搜索执行的方法
		var inputBoxVal = $(".inputBox input").val().trim();
		this.renderUserAdminListDom({name:inputBoxVal});
	},
	addViewUserPrefixFun:function(evt){//添加用户前缀的方法
		var addDialogEle = new App.userAdmin.AddUserAdminPrefixDialogV;
		var addDialogEleDom = addDialogEle.render().el;
		//初始化窗口
		App.userAdmin.UserAdminIndexV.AddPrefixDialog = new App.Comm.modules.Dialog({
		    title:"新建用户前缀",
		    width: 380,
	    	height: 100,
		    isConfirm:false,
		    isAlert:false,
		    closeCallback:function(){},
		    message:addDialogEleDom
		});
	},
	initEventHandle:function(e){
		if(e.keyCode == 13){
			var inputBoxVal = $(".inputBox input").val().trim();
			this.renderUserAdminListDom({name:inputBoxVal});
		}
	}
})