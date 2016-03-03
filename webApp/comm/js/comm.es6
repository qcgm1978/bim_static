

App.Comm = {

	Settings:{
		debug:true,
		hostname:"http://127.0.0.1:8080/"
	},

	//封装ajax 
	ajax:function(data){
		 
		//是否调试
		if (App.Comm.Settings.debug) {
			data.url=App.API.DEBUGURL[data.URLtype]; 
		}else{
			data.url=AApp.API.URL[data.URLtype];
			data.url=App.Comm.Settings.hostname+data.url;
		}

		//没有调试接口
		if (!data.url) {
			data.url=App.API.URL[data.URLtype];
		} 

		return $.ajax(data);
	}

};

//模块
App.Comm.modules={};