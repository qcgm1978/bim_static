App.AddViewUser = {
	init:function(){
		$("#contains").empty();

		var AddViewUserV = new App.AddViewUser.AddViewUserV(); //渲染框架
		AddViewUserV.render();
	},
	checkUserC:new(Backbone.Collection.extend({//获取弹出层项目列表的collection方法
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ''
				}
			}
		}),
		urlType: "checkUser",
		parse: function(response) {
			if (response.message == "success") {
				return response.data;
			}
		}
	})),
	getProjectsDataC:new(Backbone.Collection.extend({//获取弹出层项目列表的collection方法
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ''
				}
			}
		}),
		urlType: "getProjectsList",
		parse: function(response) {
			if (response.message == "success") {
				return response.data;
			}
		}
	})),
	getViewUserListC : new(Backbone.Collection.extend({//获取用户列表的collection方法
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ''
				}
			}
		}),
		urlType: "getViewUserList",
		parse: function(response) {
			if (response.message == "success") {
				return response.data;
			}
		}
	})),
	getViewUserInfoC : new(Backbone.Collection.extend({//获取用户列表的collection方法
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ''
				}
			}
		}),
		urlType: "getViewUserInfo",
		parse: function(response) {
			if (response.message == "success") {
				return response.data;
			}
		}
	}))
};
