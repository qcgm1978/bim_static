/*
write by wuweiwei
*/
var App = {
	version : "1.0.0",
	hideMainMenu : function(){
		//隐藏主菜单(页面底部)
		var footer = document.getElementsByTagName("footer")[0];
		footer.style.display = "none";
	},
	showMainMenu : function(){
		//显示主菜单(页面底部)
		var footer = document.getElementsByTagName("footer")[0];
		footer.style.display = "block";
	},
	Switch : {
		useLocalJson : false, /*使用本地JSON文件*/
		useNoCache   : true  /*动态加载js不缓存*/
	},
	setTemplateSymbol:function(){
		template.startSymbol("{{");
		template.endSymbol("}}");	
	}
};

App.setTemplateSymbol();

App.TitleBar = {
	popMenu : {
		/*所有弹出式菜单*/
		projectPopMenu : [
			{
				"caption":"分享批注",
				"icon" : ""
			},
		]
	},
	setTitle : function(title){
		$("#mainHeaderTitle").html(title);
	},
	returnCallback : function(f){

	},
	setPopMenu : function(options){
		
	},
	createPopMenu : function(){

	}
};

App.Comm = {
	requireCache : [], /*缓存js文件路径,用于判断js文件是否加载*/
	ajax : function(options){
		/*
		options 与$.ajax()相同
		增加的参数：
		options.param = {key:value} ; 匹配URL(options.url)里的参数
		*/
		var th = this;
		var url = options.url;
		var v;
		for(v in options.param)
		{
			url = url.replace("{"+v+"}",options.param[v]);
		}
		$.ajax({
			url : url,
			type : options.type||"get",
			dataType : options.dataType||"html",
			data : options.data||{},
			success : function(data){
				var _data;
				_data = th.ajaxHandle(data);
				options.success.call(th,_data);
			},
			error : function(e){

				if(options.error!=undefined)
				{
					options.error.call(th,e);
				}
			}
		});
	},
	ajaxHandle : function(data){

		return data;
	},

	require : function(url){
		var index = url.lastIndexOf(".");
		var type = url.substring(index + 1);
		var time = "";
		if(App.Switch.useNoCache)
		{
			time = "?time=" + (new Date()).getTime();
		}
		//加载过不再加载
		if (App.Comm.requireCache.indexOf(url) == -1) {
			App.Comm.requireCache.push(url);
		} else {
			return;
		}

		if (type == "js") {
			$("head").append('<script type="text/javascript" src="' + url + time + '"></script>');
		} else if (type = "css") {
			$("head").append('<link rel="styleSheet" href="' + url + time +  '" />');
		}
	}
};
