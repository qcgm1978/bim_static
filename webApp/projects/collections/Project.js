App.Project = {

	Settings: {
		fetchNavType: 'file', // model file
		projectNav:"design",
	},
 
	// 文件 容器
	FileCollection:new (Backbone.Collection.extend({
		url:"/dataJson/project/project.design.json?a=1",
		debugUrl:"/dataJson/project/project.design.json",
		model:Backbone.Model.extend({
			defaults:function(){
				return {
					title:""
				}
			}
		}) 

	})),

	//初始化
	init: function() {

		//var $contains = $("#contains"); 
		$("#contains").html(new App.Project.ProjectApp().render().el); 
		 //App.Project.fetchDesign();
	},

	 //设计导航
	fetchDesignFileNav: function() {
		 
	 	var data={
	 		URLtype:"fetchDesignFileNav"
	 	};

	 	App.Comm.ajax(data).done(function(data){
	 		var navHtml = new App.Comm.TreeViewMar(data);
			$("#projectDesignNav .projectNavContent").html(navHtml);
	 	});

	},

	//设计模型
	fetchDesignModelNav:function(){

		var data={
	 		URLtype:"fetchDesignModelNav"
	 	};

	 	App.Comm.ajax(data).done(function(data){
	 		var navHtml = new App.Comm.TreeViewMar(data);
			$("#projectDesignNav .projectNavContent").html(navHtml);
	 	});
	}


}