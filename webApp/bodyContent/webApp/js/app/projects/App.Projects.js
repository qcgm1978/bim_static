/*
write by wuweiwei

templateUrl:tpls/projects/projectsList.html
*/
App.Projects = {
	init : function(){
		this.loadData();
	},
	loadData : function(){
		var th = this;
		App.Comm.ajax({
			type:"get",
			url:App.Restful.urls.projectsList,
			dataType:"json",
			success:function(data){
				th.viewToPage(data);
			}
		});
	},
	viewToPage : function(data){
		/*渲染数据*/
		template.repeat({
			repeatElement : $("#projectList")[0], /*页面的DOM元素*/
			data : data.data
		});
	}
};

App.Projects.ProjectFileList = {
	init : function(){
		this.initChangeVersion();
		this.bindEvent();
	},
	initChangeVersion : function(){
		//页面滑动代码参考这个
		this.gate = new wGate();
		this.gate.append({
			zIndex:3000,
			name:"selectVersion",
			element : $("#fileVersionContent")[0],
			returnButton:{
				element : $("#btn_fileVerReturn")[0],
			},
			direction : "toLeft",
			backgroundColor: "#EEEEEE"
		});
	},
	bindEvent : function(){
		var th = this;
		$("#fileVersion").on("click",function(e){
			th.gate.show("selectVersion");
		});
	}
}