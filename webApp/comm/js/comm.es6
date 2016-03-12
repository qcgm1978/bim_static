App.Comm = {

	Settings: {
		v: 20160312,
		pageItemCount: Math.floor(($("body").height() + 60) / 70) > 10 && Math.floor(($("body").height() + 60) / 70) || 10
	},

	//封装ajax 
	ajax: function(data, callback) {

		data = App.Comm.getUrlByType(data);

		if ($.isFunction(callback)) {
			$.ajax(data).done(function(data) {
				if (_.isString(data)) {
					// to json
					if (JSON && JSON.parse) {
						data = JSON.parse(data);
					} else {
						data = $.parseJSON(data);
					}
				}

				//回调
				callback(data);

			});
		} else {
			return $.ajax(data);
		}

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

	},

	//JS操作cookies方法!
	//写cookies
	setCookie: function(name, value) {
		var Days = 30;
		var exp = new Date();
		exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
		document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
	},
	//获取cookie
	getCookie: function(name) {
		var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
		if (arr = document.cookie.match(reg))
			return unescape(arr[2]);
		else
			return null;
	},
	//删除cookie
	delCookie: function(name) {
		var exp = new Date();
		exp.setTime(exp.getTime() - 1);
		var cval = getCookie(name);
		if (cval != null)
			document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
	},
	formatSize:function (size) {
        if (size === undefined || /\D/.test(size)) {
            return '';
        }
        if (size >= 1073741824) {
            return (size / 1073741824).toFixed(2) + 'GB';
        }
        if (size >= 1048576) {
            return (size / 1048576).toFixed(2) + 'MB';
        } else if (size >= 6) {
            return (size / 1024).toFixed(2) + 'KB';
        } else {
            return size + 'b';
        }
    }

};



//模块
App.Comm.modules = {};