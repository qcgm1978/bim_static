App.Comm = {

	Settings: {
		v: 20160312,
		pageItemCount: 30 //Math.floor(($("body").height() + 60) / 70) > 10 && Math.floor(($("body").height() + 60) / 70) || 10
	},

	//封装ajax
	ajax: function(data, callback) {

		data = App.Comm.getUrlByType(data);


		 return $.ajax(data).done(function(data) { 

			if (_.isString(data)) {
				// to json
				if (JSON && JSON.parse) {
					data = JSON.parse(data);
				} else {
					data = $.parseJSON(data);
				}
			}

			//未登录
			if (data.code == 10004) {
				window.location.href = data.data;
			}

			if ($.isFunction(callback)) {
				//回调
				callback(data);
			} 

		});



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
		var temp = data.data;
		if ((typeof temp) == 'string') {
			temp = JSON.parse(temp);
		}
		if (urlPars) {
			for (var i = 0; i < urlPars.length; i++) {

				var rex = urlPars[i],
					par = rex.replace(/[{|}]/g, ""),
					val = temp[par];
				if (val) {
					data.url = data.url.replace(rex, val);
				}
			}
		}

		//删除
		if ((data.URLtype.indexOf("delete") > -1 || data.URLtype.indexOf("put") > -1) && data.data) {
			if (data.url.indexOf("?") == -1) {
				data.url += "?1=1";
			}
			for (var p in data.data) {
				data.url += "&" + p + "=" + data.data[p];
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
	//格式化 文件大小
	formatSize: function(size) {
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
	},
	//状态转换
	convertStatus: function(status) {
		//1：待上传；2：上传中；3：已上传；4：待审核；5：审核通过；6：审核退回；7：待移交；8：移交退回；9：已发布

		var result = "";
		if (status == 1) {
			result = "待上传";
		} else if (status == 2) {
			result = "上传中";
		} else if (status == 3) {
			result = "已上传";
		} else if (status == 4) {
			result = "待审核";
		} else if (status == 5) {
			result = "审核通过";
		} else if (status == 6) {
			result = "审核退回";
		} else if (status == 7) {
			result = "待移交";
		} else if (status == 8) {
			result = "移交退回";
		} else if (status == 9) {
			result = "已发布";
		}

		return result;
	},

	//收起和暂开
	navBarToggle: function($el, $content, dirc, Viewer) {

		var dircWidth, mDirc;
		if (dirc == "left") {
			mDirc = "margin-left";
		} else {
			mDirc = "margin-right";
		}

		dircWidth = parseInt($el.css(mDirc));

		if (dircWidth < 0) {

			var ani = {}
			ani[mDirc] = "0px";

			$el.animate(ani, 500, function() {
				$el.find(".dragSize").show().end().find(".slideBar i").toggleClass('icon-caret-left icon-caret-right');
				$content.css(mDirc, $el.width());
				if (Viewer) {
					Viewer.resize();
				}

			});
		} else {
			var width = $el.width(),
				ani = {};

			ani[mDirc] = -width;
			$el.animate(ani, 500, function() {
				$el.find(".dragSize").hide().end().find(".slideBar i").toggleClass('icon-caret-left icon-caret-right');
				$content.css(mDirc, 0);
				if (Viewer) {
					Viewer.resize();
				}
			});
		}

	},
	//拖拽改变尺寸
	dragSize: function(event, $el, $content, dirc, Viewer) {

		var initX = event.pageX,
			isLeft = dirc == "left" ? true : false,
			initWidth = $el.width();

		var $target = $(event.target);

		$(document).on("mousemove.dragSize", function(event) {
			var newWidth;
			if (isLeft) {
				newWidth = initWidth + event.pageX - initX;
			} else {
				newWidth = initWidth + initX - event.pageX;
			}

			$el.width(newWidth);
		});

		$(document).on("mouseup.dragSize", function() {

			$(document).off("mouseup.dragSize");
			$(document).off("mousemove.dragSize");

			var contentWidth = $content.width(),
				leftNavWidth = $el.width(),
				gap = leftNavWidth - initWidth;

			var mPos = "margin-right";
			if (isLeft) {
				mPos = "margin-left";
			}

			if (contentWidth - gap < 10) {
				var maxWidth = initWidth + contentWidth - 10;
				$el.width(maxWidth);
				$content.css(mPos, maxWidth);
			} else {
				$content.css(mPos, leftNavWidth);
			}
			if (Viewer) {
				Viewer.resize();
			}
		});

		return false;

	},
	managePoint: function(data) {
		App.Comm.viewpointView(data);
	},

	//下载
	checkDownLoad: function(projectId, projectVersionId, fileVersionId) {


		var checkData = {
			URLtype: "checkDownLoad",
			data: {
				projectId: projectId,
				versionId: projectVersionId,
				fileVersionId: fileVersionId
			}
		}

		App.Comm.ajax(checkData, function(data) {
			if (data.code == 0) {
				// //请求数据
				var data = {
					URLtype: "downLoad",
					data: {
						projectId: projectId,
						projectVersionId: projectVersionId
					}
				};

				var data = App.Comm.getUrlByType(data);
				var url = data.url + "?fileVersionId=" + fileVersionId;
				window.location.href = url;
			} else {
				alert(data.message);
			}

		})


	}

};



//模块
App.Comm.modules = {};