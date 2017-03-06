App.setPermissions = {
	init:function(){
		$("#contains").empty();
		var SetPermissionsIndexV = new App.setPermissions.SetPermissionsIndexV(); //渲染框架
		SetPermissionsIndexV.render();
	},
}