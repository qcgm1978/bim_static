var Login = {

	doMain: window.location.host.substring(window.location.host.indexOf(".")),

	isIp : function(){
		//判断URL是否是IP地址,是IP地址返回IP地址,否则返回空字符串
		var ip="";
		var host = location.host;
		var reg = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
		
		if(reg.test(host))
		{
			ip = host;
		}
		else
		{
			ip = "";
		}
		return ip;
	},

	setCookie(name, value) {
		var ip = Login.isIp();
		var Days = 0.02,
			exp = new Date();
		exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
		if(ip!="")
		{
			Login.doMain = ip;
		}
		if(location.host == "bim-demo.wanda.cn")
		{
			exp.setTime(exp.getTime() + 365 * 24 * 60 * 60 * 1000);
		}
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

			name = str.substring(0, pos);



			if (name == key) {
				result = str.substring(pos + 1);
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

	//删除cookie
	delCook: function(name) {
		var exp = new Date();
		exp.setTime(exp.getTime() - 1);
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

		for (var i = 0; i < len; i++) {
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
					Login.isDemoUser(data); //判断是否演示用户   
				}
				//获取用户信息
				Login.getUserInfo();
			} else {

				//登录失败
				$("#mainBox .errorMSG").addClass('show').find(".tip").text("登录失败:用户名密码错误" );
				$("#btnLogin").val("立即登录").data("islogin", false);

			}
		})
	},

	//判断是否演示用户(即demo用户)
	isDemoUser : function(data){
		for (var p in data.data) {
			if(data.data[p]==1 || data.data[p]=="1")
			{
				Login.setCookie("isDemoEnv","yes");
				return;
			}
		}
	},

	//发布ie的消息
	dispatchIE(url) {
		if (navigator.userAgent.indexOf("QtWebEngine/5.7.0") > -1) {
			window.open(url);
		}
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


			//ie
			Login.dispatchIE('/?commType=loginIn');


			localStorage.setItem("user", JSON.stringify(data.data))
			Login.setCookie('OUTSSO_LoginId', data.data.userId);
			Login.setCookie('userId', data.data.userId);
			Login.setCookie('isOuter', data.data.outer);

			//判断用户是外网用户还是内网用户
			if(data.data.outer)
			{
				Login.setCookie("userType","outerNet");
			}
			else
			{
				Login.setCookie("userType","innerNet");
			}
			
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
				window.location.href = '/index.html?t='+(+new Date());
			} 

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
		
		if(Login.isSSO())
		{
			Login.checkSSO();
		}
		else
		{
			//是否自动登录
			Login.isAutoLogin();
		}


		//谷歌下验证登录
		if (navigator.userAgent.indexOf("QtWebEngine/5.7.0") <= -1) {
			//验证登录
			this.checkLogin();
		}
	},

	isSSO : function(cooks){
		var bool;
		alert(cooks);
		var AuthUser_AuthNum = Login.getCookie("AuthUser_AuthNum",cooks);
		var AuthUser_AuthToken = Login.getCookie("AuthUser_AuthToken",cooks);
		var AuthUser_AuthMAC = Login.getCookie("AuthUser_AuthMAC",cooks);
		var AuthUser_Signature = Login.getCookie("AuthUser_Signature",cooks);

		alert("AuthUser_AuthNum:",AuthUser_AuthNum);
		alert("AuthUser_AuthToken:",AuthUser_AuthToken);
		alert("AuthUser_AuthMAC:",AuthUser_AuthMAC);
		alert("AuthUser_Signature:",AuthUser_Signature);

		//try
		{
			bool = AuthUser_AuthNum.length>5 && AuthUser_AuthToken.length>5 && AuthUser_AuthMAC.length>5 && AuthUser_Signature.length>5;
			alert("bool:"+bool);
			if(AuthUser_AuthToken == undefined)
			{
				return false;
			}
			if(AuthUser_Signature == undefined)
			{
				return false;
			}
			if(bool)
			{
				Login.checkSSO(cooks);
				return true;
			}
			else
			{
				return false;
			}
		}
		//catch(e)
		{
			return false;
		}
	},

	getSSO : function(cooks){
		var AuthUser_AuthNum = Login.getCookie("AuthUser_AuthNum",cooks);
		var AuthUser_AuthToken = Login.getCookie("AuthUser_AuthToken",cooks);
		var AuthUser_AuthMAC = Login.getCookie("AuthUser_AuthMAC",cooks);

		return {
		"AuthUser_AuthNum":AuthUser_AuthNum,
		"AuthUser_AuthToken":AuthUser_AuthToken,
		"AuthUser_AuthMAC":AuthUser_AuthMAC
		};
	},

	//万达系统登陆后,然后在本项目中自动登录
	//万达用户跳转到总发包系统的登录条件：
	//OUTSSO_AuthNum为空; AuthUser_AuthNum,AuthUser_AuthToken,AuthUser_AuthMAC有值; wd_sso_user不为空
	checkSSO : function(cooks){
		var url = "/platform/login/inner";
		alert("into checkSSO");
		var SSO = Login.getSSO(cooks);
		alert(SSO.AuthUser_AuthNum);
		alert(SSO.AuthUser_AuthToken);
		alert(SSO.AuthUser_AuthMAC);

		$.ajax({
			url:url,
			type :"post",
			dataType:"json",
			contentType: "application/json",
			data : JSON.stringify(SSO),
			success:function(data){
				var obj,p,i;
				if(data.code==0)
				{
					obj = data.data;
					for (var p in obj) 
					{
						Login.setCookie(p, obj[p]);
					}			
					Login.getUserInfo();
				}
			}
		});
		
	},

	clearCookie() {

		var keys = Login.cookieNames(document.cookie);

		if (keys) {
			for (var i = keys.length; i--;) {
				Login.delCookie(keys[i]);
			}
		}
	},

	//
	checkLoginBefore: function(cookies) {

		Login.clearCookie();

		if (cookies) {

			var keys = Login.cookieNames(cookies),
				val;

			for (var i = 0; i < keys.length; i++) {

				val = Login.getCookie(keys[i], cookies);

				val && 　Login.setCookie(keys[i], val);

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
				window.location.href = '/index.html?t='+(+new Date());
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

//Login.setCookie("test",'"abc"');
//alert(Login.getCookie("test").length);