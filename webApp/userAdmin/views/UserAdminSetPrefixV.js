App.userAdmin.UserAdminSetPrefixV = Backbone.View.extend({
	tarName:"div",
	className:"userAdminPrefixBox",
	template:_.templateUrl("/userAdmin/tpls/userAdminSetPrefixV.html"),
	events: {
 		"click #submitPrefixBtn": "submitPrefixFun",
	},
	render:function(){
		this.getUserAdminSetPrefixListFun();//配置用户前缀的方法
		return this;
	},
	getUserAdminSetPrefixListFun:function(){//获取浏览用户前缀的列表的方法
		var _this = this;
	    App.userAdmin.getViewUserPrefixC.fetch({
			success: function(collection, response, options) {
				if(response.code == 0){
					_this.$el.html("");
					console.log(response.data);
					_this.$el.html(_this.template({state:response.data}));
				}
			}
		})
	},
	// getUserAdminSetPrefixFun:function(){//配置用户前缀的方法
	// 	var _this = this;
	// 	App.userAdmin.getViewUserPrefixC.fetch({
	// 		success: function(collection, response, options) {
	// 			if(response.code == 0){
	// 				_this.$el.html(_this.template({state:response.data}));
	// 			}
	// 		}
	// 	})
	// },
	// submitPrefixFun:function(){//提交前缀的方法
	// 	var userAdminPrefixInput = $("#userAdminPrefixInput");
	// 	var userAdminPrefixInputVal = userAdminPrefixInput.val().trim();
	// 	if(userAdminPrefixInputVal == ""){
	// 		alert('前缀不能为空！')
	// 		return;
	// 	}
	// 	this.submitPrefixAjaxFun(userAdminPrefixInputVal);
	// },
	// submitPrefixAjaxFun:function(val){
	// 	var _this = this;
	// 	var data = {
	// 		prefix:val
	// 	}
	// 	$.ajax({
	// 	    type:"PUT",
	// 	    url:"platform/testuser/prefix",
	// 	    contentType:"application/json",
	// 	    data:JSON.stringify(data),
	// 	    success:function(response){
	// 	       if(response.code == 0){
	//        			var UserAdminIndexV = new App.userAdmin.UserAdminIndexV;
 //       	       		UserAdminIndexV.renderAddPrefixDom();
	//        		}
	// 	    }
	// 	});
	// }
})