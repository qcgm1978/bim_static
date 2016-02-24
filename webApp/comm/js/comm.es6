App.Comm = {

	Settings:{
		debug:true
	},

	//封装ajax 
	ajax:function(data){

		//是否调试
		if (App.Comm.Settings.debug) {
			data.url=App.API.DEBUGURL[data.URLtype];
		}else{
			data.url=AApp.API.URL[data.URLtype];
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