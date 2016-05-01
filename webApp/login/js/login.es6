var Login = {

	//事件绑定
	bindEvent() {

			//登录
			$("#btnLogin").on("click", function() {

				Login.signIn();
			});

			// 隐藏警告
			$("#userName,#userPwd").keyup(function(){
				var $errorMSG=$("#mainBox .errorMSG");
				 if ($errorMSG.hasClass('show')) {
				 	if ($(this).val().trim()) {
				 		$errorMSG.removeClass('show');
				 	};
				 };
			});

			//一周内自动登陆
			$("#mainBox .remember").on("click",function(){
				$(this).toggleClass("selected");
			});

		},

		 


		//登录
		signIn() {

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
			
			$.ajax({
				url:'/platform/login',
				type:'post',
				data:{
					userid:userName,
					password:userPwd
				}
			}).done(function(data){
				if(data.code==0){
					window.location.href="index.html";
				}else{
					$("#mainBox .errorMSG").addClass('show').find(".tip").text("登录失败:"+data.message);
				}
			})

		},


		//初始化
		init() {
			Login.bindEvent();
		} 

}





/** trim() method for String */  
String.prototype.trim=function() {  
    return this.replace(/(^\s*)|(\s*$)/g,'');  
};  