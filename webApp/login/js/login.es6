var Login = {

	setCookie(name, value) {
		var Days = 30,
			exp = new Date();
		exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
		document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString() + ";domain=.wanda-dev.cn";
	},
	//获取cookie
	getCookie: function(name) {
		var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
		if (arr = document.cookie.match(reg))
			return unescape(arr[2]);
		else
			return null;
	},

	//事件绑定
	bindEvent() {

		//登录
		$("#btnLogin").on("click", function() {
			Login.signIn();
		});

		// 隐藏警告
		$("#userName,#userPwd").keyup(function(e) {

			if (e.keyCode == 13) {
				Login.signIn();
			}

			var $errorMSG = $("#mainBox .errorMSG");
			if ($errorMSG.hasClass('show')) {
				if ($(this).val().trim()) {
					$errorMSG.removeClass('show');
				};
			};
		});

		//一周内自动登陆
		$("#mainBox .remember").on("click", function() {
			$(this).toggleClass("selected");
		});

	},



	//登录
	signIn() {

		var $btnLogin = $("#btnLogin");
		if ($btnLogin.data("islogin")) {
			return;
		}

		var userName = $("#userName").val().trim(),
			userPwd = $("#userPwd").val().trim(),
			isRemember = false;

		if (!userName) {
			$("#mainBox .errorMSG").addClass('show').find(".tip").text("请输入用户名");
			return false;
		}

		if (!userPwd) {
			$("#mainBox .errorMSG").addClass('show').find(".tip").text("请输入密码");
			return false;
		};

		$("#btnLogin").val("登录中").data("islogin", true);

		$.ajax({
			url: '/platform/login',
			type: 'post',
			data: {
				userid: userName,
				password: userPwd
			}
		}).done(function(data) {

			if (data.code == 0) { 

				//写cookie
				if (data.data && typeof data.data === 'object') {
					for (var p in data.data) {
						Login.setCookie(p, data.data[p]);
					}
				}

				//获取用户信息
				Login.getUserInfo();

			} else {

				//登录失败
				$("#mainBox .errorMSG").addClass('show').find(".tip").text("登录失败:" + data.message);
				$("#btnLogin").val("立即登录").data("islogin", false);

			}
		})


	},

	//获取用户信息
	getUserInfo() {
		$.ajax({
			url: '/platform/user/current'
		}).done(function(data) {
			localStorage.setItem("user", JSON.stringify(data.data));
			Login.setCookie('userId', data.data.userId);
			Login.setCookie('isOuter', data.data.outer);

			//记住我
			if ($(".loginDialog .remember").hasClass("selected")) {
				Login.rememberMe();
			} else {
				Login.setCookie("isAutoLogin", false);
			}

			window.location.href = "/index.html";
		});
	},

	//一周内记住我
	rememberMe() {

		var userName = $("#userName").val().trim(),
			userPwd = $("#userPwd").val().trim();
		//用户信息
		Login.setCookie('userName', userName);
		Login.setCookie('userPwd', userPwd);
		//自动登录信息
		Login.setCookie("isAutoLogin", true);
		Login.setCookie("autoDate", +new Date());
	},


	//初始化
	init() {
		//事件绑定
		Login.bindEvent();
		//是否自动登录
		Login.isAutoLogin();
	},

	//是否自动登录
	isAutoLogin() {
		//7天自动登录
		if (Login.getCookie("isAutoLogin")) {

			var setDate = Login.getCookie("autoDate"),

				diffMillisecond = 24 * 7 * 60 * 60 * 1000;
			//7 天内
			if ((new Date() - setDate) <= diffMillisecond) {
				//获取用户名
				$("#userName").val(Login.getCookie("userName"));
				$("#userPwd").val(Login.getCookie("userPwd"));
				$(".loginDialog .remember").addClass("selected");
				Login.signIn();
			}
		}
	}



}



/** trim() method for String */
String.prototype.trim = function() {
	return this.replace(/(^\s*)|(\s*$)/g, '');
};