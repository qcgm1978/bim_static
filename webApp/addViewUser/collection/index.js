App.AddViewUser = {
	init:function(){
		$("#contains").empty();

		var AddViewUserV = new App.AddViewUser.AddViewUserV(); //渲染框架
		AddViewUserV.render();
	},
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
	AddViewUserC : new(Backbone.Collection.extend({//获取用户列表的collection方法
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
	}))
};
