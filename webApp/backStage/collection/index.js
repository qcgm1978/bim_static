App.backStage = {
	init:function(){
		$("#contains").empty();
		var BackStageIndexV = new App.backStage.BackStageIndexV(); //渲染框架
		BackStageIndexV.render();
	}
}