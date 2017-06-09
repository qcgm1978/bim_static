App.TopNav = {

	init() {
		 
		//获取用户只
		var _userInfo = JSON.parse(localStorage.getItem("user"));
		if (_userInfo) {
			$("#loginName").html(_userInfo.name);
			$("#loginName").attr("title",_userInfo.name);
			$("#uiAccount").html(_userInfo.loginName);
			$("#uiPosition").html(_userInfo.position);
			$("#uiPartment").html(_userInfo.org ? _userInfo.org[0].name : '');//
			$("#uiLogo").attr('src', _userInfo.photoUrl);
			$('#topBar .user .userBg').attr("src",_userInfo.photoUrl);
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
			$('.userinfo').hide();
			$('.onlineNav').hide();
			$('.userinfo').show();
			e.stopPropagation();
		})

		$(".user i").click(function(e) {
			$('.userinfo').hide();
			$('.onlineNav').hide();
			$('.userinfo').show();
			e.stopPropagation();
		})

		$('.menuNav').click(function(e){
			$('.userinfo').hide();
			$('.onlineNav').hide();
			$('.onlineNav').show();
			e.stopPropagation();
		})

		$(document).on('click', function(e) {
			$('.userinfo').hide();
			$('.onlineNav').hide();
		})
		var indexAuthenticationItem = $("#indexAuthenticationItem");
		var indexTrainingItem = $("#indexTrainingItem");
		var myTrain = $("#myTrain");
		var indexTrainingAuthenItem = $("#indexTrainingAuthenItem");
		if(!App.Global.User.hasTrainOperation){
			indexAuthenticationItem.hide();
			indexTrainingItem.hide();
			indexTrainingAuthenItem.hide();
		}
		indexAuthenticationItem.on("click",function(evt){
			window.open("http://bimrzuat.wanda-dev.cn/wdsso/wdEnter.jsp?m=pxda&userName="+App.Global.User.name,"_blank");
		})
		indexTrainingItem.on("click",function(evt){
			window.open("http://bimrzuat.wanda-dev.cn/wdsso/wdEnter.jsp?m=rzjg&userName="+App.Global.User.name,"_blank");
		})
		myTrain.on("click",function(evt){
			window.open("http://bimrzuat.wanda-dev.cn/wdsso/wdEnter.jsp?m=pxgl&userName="+App.Global.User.name,"_blank");
		})

	}

};