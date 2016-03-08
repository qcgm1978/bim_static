App.Comm = {

	Settings: {
		v: 20160307,
		pageItemCount: Math.floor(($("body").height() + 60) / 70) > 10 && Math.floor(($("body").height() + 60) / 70) || 10
	},

	//封装ajax 
	ajax: function(data) {

		data=App.Comm.getUrlByType(data);

		return $.ajax(data);
	},

	getUrlByType: function(data) {

		//是否调试
		if (App.API.Settings.debug) {
			data.url = App.API.DEBUGURL[data.URLtype];
		} else {
			data.url = App.API.Settings.hostname + App.API.URL[data.URLtype];
		}

		//没有调试接口
		if (!data.url) {
			data.url = App.API.Settings.hostname + App.API.URL[data.URLtype];
		}

		//url 是否有参数
		var urlPars = data.url.match(/\{([\s\S]+?(\}?)+)\}/g);
		if (urlPars) {
			for (var i = 0; i < urlPars.length; i++) {
				var rex = urlPars[i],
					par = rex.replace(/[{|}]/g, ""),
					val = data.data[par];
				if (val) {
					data.url = data.url.replace(rex, val);
				}
			}
		}

		return data;

	}

};



//模块
App.Comm.modules = {};