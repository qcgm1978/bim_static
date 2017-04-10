/*

write by wuweiwei
core code , config route and controller handle

*/

/*配置路由*/
wRouter.config({
	container:$("#mainContainer")[0],             /*指定载入templateUrl的容器DOM*/
	routes:[
		{
			url:"/index",                         /*页面路由*/
			controller:"index",                   /*路由的名称,根据含义起名*/
			templateUrl:"tpls/index/index.html"   /*载入的页面,当在浏览器执行"#/index"后,会自动载入此页面*/
		},
		{
			url:"/projects",
			controller:"projects",
			templateUrl:"tpls/projects/projectsList.html"
		},
		{
			url:"/project/:id/:version",
			controller:"project",
			templateUrl:"tpls/projects/projectFileList.html"
		},
		{
			url:"/flow",
			controller:"flow",
			templateUrl:"tpls/flow/flowList.html"
		},
		{
			url:"/resource",
			controller:"resource",
			templateUrl:"tpls/resource/resourceList.html"
		},
		{
			url:"/service",
			controller:"service",
			templateUrl:"tpls/service/serviceList.html"
		}
	],
	otherwise:{
		redirectTo:"/index"
	}
});

/*通用controller处理函数*/
wRouter.commonController(function(isFirst){
	/*isFirst is Boolean ,true is first laod or refresh*/
	App.showMainMenu();
	if(isFirst)
	{

	}
});


/*
下面是每个controller对应的业务处理函数
wRouter.controller("",function(){})
第一个参数对应wRouter.config({})里的controller
*/

wRouter.controller("index",function(args){
	console.log(App.version);
	App.Comm.require("js/app/index/App.index.js");
	App.Index.init();
});

wRouter.controller("projects",function(args){
	App.Comm.require("css/projects.css");
	App.Comm.require("js/app/projects/App.Projects.js");
	App.Projects.init();
});

wRouter.controller("project",function(args){
	App.Comm.require("css/projects.css");
	App.Comm.require("js/app/projects/App.Projects.js");
	alert(args.id + "/" + args.version);
	App.Projects.ProjectFileList.init();
});

wRouter.controller("flow",function(args){
	App.Comm.require("css/flow.css");
	App.Comm.require("js/app/flow/App.Flow.js");
	App.Flow.init();
	
});

wRouter.controller("resource",function(args){
	App.Comm.require("css/resource.css");
	App.Comm.require("js/app/resource/App.Resource.js");
	App.Resource.init();
});

wRouter.controller("service",function(args){
	App.Comm.require("css/service.css");
	App.Comm.require("js/app/service/App.Service.js");
	App.Service.init();
});

wRouter.endController(function(controllerName){
	/*通过controllerName判断，来清理对应的controller*/
	console.log(controllerName+" 清理");
});

