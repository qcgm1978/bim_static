var AppRoute = Backbone.Router.extend({

	routes: {
		'family/:libId': 'resourceModel',

	},



	//单个项目
	resource: function(type, id) { 

		this.reset();
		$("#topBar .navHeader").find(".item").removeClass("selected").end().find(".resources").addClass('selected');
		_.require('/static/dist/resources/resources.css');
		_.require('/static/dist/resources/resources.js');
		App.ResourcesNav.Settings.type = type;
		App.ResourcesNav.init();
	},

	resourceModel: function(type, projectId) {


		this.checkLogin((isLogin)=>{

			if (!isLogin) {
				return;
			}


			this.reset();

			$("#topBar .navHeader").find(".item").removeClass("selected").end().find(".resources").addClass('selected');

			_.require('/static/dist/resources/resources.css');

			_.require('/static/dist/resources/resources.js');

			App.ResourcesNav.Settings.type = App.ResourceModel.Settings.type = type;
			App.ResourceModel.Settings.CurrentVersion = {};
			App.ResourceModel.Settings.projectId = projectId;

			App.ResourceModel.init();
		});


	},



	//重置数据
	reset: function() {
		//用户信息
		App.Global.User = JSON.parse(localStorage.getItem("user"));

		//销毁上传
		App.Comm.upload.destroy();
		//$("#topBar .userName .text").text(App.Comm.getCookie("OUTSSO_LoginId"));
	},

	//检查登录
	checkLogin(fn) {
		debugger
		$("#pageLoading").show();

		$("#topBar .bodyConMenu").remove().end().find(".flow").remove().end().find(".services").remove();
		App.Comm.Settings.loginType = "token";
		var that = this;
		//是否登录了
		if (!App.Comm.getCookie("token_cookie")) {
			var Request = App.Comm.GetRequest(),
				appKey = Request.appKey,
				token = Request.token;

			var data = {
				URLtype: "appToken",
				data: {
					appKey: appKey,
					token: 123 || token
				}
			}

			App.Comm.ajax(data, function(data) {
				if (data.code == 0) {

					App.Comm.setCookie("token_cookie", data.data);

					that.getUserInfo(fn);

				} else {
					if (data.code == 10004) {
						window.location.href = data.data;
					} else {
						alert("验证失败");
						fn(false);
					}

				}
			});

		} else {
			fn(true);
		}

	},

	//获取用户信息
	getUserInfo(fn) {

		$.ajax({
			url: '/platform/user/current'
		}).done(function(data) {
			//失败
			if (data.code != 0) {
				alert("获取用户信息失败");
				fn(false);
				return;
			}

			localStorage.setItem("user", JSON.stringify(data.data));
			fn(true);

		});
	},



});



App.Router = new AppRoute();

//开始监听
Backbone.history.start();