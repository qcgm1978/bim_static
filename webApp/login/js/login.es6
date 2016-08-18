var Login = {

	doMain: window.location.host.substring(window.location.host.indexOf(".")),

	setCookie(name, value) {
		var Days = 0.02,
			exp = new Date();
		exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
		document.cookie = name + "=" + value + ";expires=" + exp.toGMTString() + ";domain=" + Login.doMain + ";path=/";
	},
	//获取cookie
	getCookie: function(key, cookis) {    

		var cooks = cookis || document.cookie, 
			items = cooks.split("; "), 
			result,
			len = items.length,
			str, pos;
 

		for (var i = 0; i < len; i++) {

			str = items[i];
			pos = str.indexOf('=');

			name=str.substring(0,pos);

			 

			if (name == key) {
				result = str.substring(pos+1);
				break;
			}
		} 
		 
		return result; 
	 
	},
	//删除cookie
	delCookie: function(name) {
		var exp = new Date();
		exp.setTime(exp.getTime() - 31 * 24 * 60 * 60 * 1000);
		var cval = this.getCookie(name);
		if (cval != null)
			document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString() + ";domain=" + Login.doMain + ";path=/";
	},

	//cookie名称
	cookieNames: function(cookies) {

		var items = cookies.split("; "); 

		var names = [],
			len = items.length,
			str, pos;

		for (var i = 0;i < len; i++) {
			str = items[i];
			pos = str.indexOf('='); 
			names.push(str.substring(0, pos));
		} 

		return names;
	},


	//事件绑定
	bindEvent() {
		var $remeber = $("#mainBox .remember");
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
		$remeber.on("click", function() {
			$(this).toggleClass("selected");
		});
		if (Login.getCookie("isAutoLogin") == 'true') {
			$remeber.click();
		}

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

				Login.delCookie("token_cookie");

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
			url: '/platform/user/current?t=' + (+new Date())

		}).done(function(data) {

			//获取referer returnurl 进行重定向
			var r = document.URL.split('ReturnUrl=').pop();
			//失败
			if (data.code != 0) {
				$("#mainBox .errorMSG").addClass('show').find(".tip").text("获取用户信息失败");
				$("#btnLogin").val("立即登录").data("islogin", false);
				return;
			}

			localStorage.setItem("user", JSON.stringify(data.data))
            Login.setCookie('OUTSSO_LoginId', data.data.userId); 
			Login.setCookie('userId', data.data.userId);
			Login.setCookie('isOuter', data.data.outer);

			//记住我
			if ($(".loginDialog .remember").hasClass("selected")) {
				Login.rememberMe();
			} else {
				Login.setCookie("isAutoLogin", false);
			}
			//是否主动退出标记 2 默认状态 1 为主动退出
			Login.setCookie('IS_OWNER_LOGIN', '2');


			 
			if (r && r != document.URL) {
				window.location = decodeURIComponent(r); 
			} else {
				window.location.href = '/index.html';
			}

			//window.location.href='/static/dist/app/oPage/download/IEH5Agent.exe?commType=loginIn';
				

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
		//验证登录
		this.checkLogin();
	},

	//
	checkLoginBefore: function(cookies) {

		if (cookies) {
			
			var keys = Login.cookieNames(cookies),
			val;  

			for (var i = 0; i < keys.length; i++) { 

				val = Login.getCookie(keys[i], cookies);  

				val &&　Login.setCookie(keys[i], val);

			}
		}

		return document.cookie;

	},

	//验证登录
	checkLogin: function() {

		$.ajax({
			url: '/platform/user/current?t=' + (+new Date())
		}).done(function(data) {

			if (typeof(data) == "string") {
				data = JSON.parse(data);
			}

			if (data.code == 0) {
				localStorage.setItem("user", JSON.stringify(data.data))
				Login.setCookie('userId', data.data.userId);
				Login.setCookie('isOuter', data.data.outer);
				window.location.href = '/index.html';
			}
		});

		return "comm";
	},

	//是否自动登录
	isAutoLogin() {
		//7天自动登录
		if (Login.getCookie("isAutoLogin")) {

			var setDate = Login.getCookie("autoDate"),

				diffMillisecond = 24 * 7 * 60 * 60 * 1000;
			//7 天内
			if ((new Date() - setDate) <= diffMillisecond && Login.getCookie('IS_OWNER_LOGIN') == '2') {
				//获取用户名
				$("#userName").val(Login.getCookie("userName"));
				$("#userPwd").val(Login.getCookie("userPwd"));
				$(".loginDialog .remember").addClass("selected");
				Login.signIn();
			}
		}
	}



}


var App = {
	Comm: {
		//獲取cook 和 localstore
		getCookAndStore: function() {
			return JSON.stringify({
				cookie: document.cookie,
				user: localStorage.getItem("user")
			});
		}
	}
}

/** trim() method for String */
String.prototype.trim = function() {
	return this.replace(/(^\s*)|(\s*$)/g, '');
};