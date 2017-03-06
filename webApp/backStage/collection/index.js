App.backStage = {
	init:function(){
		$("#contains").empty();
		var BackStageIndexV = new App.backStage.BackStageIndexV(); //渲染框架
		BackStageIndexV.render();
	},
	setPermissionsInit:function(){
		$("#contains").empty();
		var SetPermissionsIndexV = new App.backStage.SetPermissionsIndexV(); //渲染框架
		SetPermissionsIndexV.render();
	}
}