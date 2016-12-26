App.AddViewUser = {
	init:function(){
		$("#contains").empty();
		var AddViewUserV = new App.AddViewUser.AddViewUserV(); //渲染框架
		AddViewUserV.render();
	}
};
