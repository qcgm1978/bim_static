App.TopNav = {

	init() {
		//获取用户只
		var _userInfo = JSON.parse(localStorage.getItem("user"));

		if (_userInfo) {
			$("#loginName").html(_userInfo.name);
			$("#uiAccount").html(App.Comm.getCookie('OUTSSO_LoginId'));
			$("#uiPosition").html(_userInfo.position);
			$("#uiPartment").html("test");//_userInfo.org ? _userInfo.org[0].name : ''
			$("#uiLogo").attr('src', _userInfo.photoUrl);
		}else{
			return;
		}

		var $target=$(".user > span");
		//分享
		if (App.Project && App.Project.Settings.isShare) {
			$target=$("#topBar .login");
			$("#topBar .login").off();
		}		

		$target.click(function(e) {
			$('.userinfo').show();
			e.stopPropagation();
		})

		$(document).on('click', function(e) {
			$('.userinfo').hide();
		})
	}

};