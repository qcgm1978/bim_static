App.Comm = {

	Settings: {
		v: 20160312,
		loginType: "user", // 登录状态 user token
		pageItemCount: 15 //Math.floor(($("body").height() + 60) / 70) > 10 && Math.floor(($("body").height() + 60) / 70) || 10
	},

	//项目版本状态
	versionStatus: {
		"1": "待上传",
		"2": "上传中",
		"3": "待审核",
		"4": "审核中",
		"5": "审核通过",
		"6": "审核退回",
		"7": "待移交",
		"8": "移交退回",
		"9": "已移交"
	},
	//项目版本状态
	modelStatus: {
		"1": "待上传",
		"2": "上传中",
		"3": "待审核",
		"4": "审核中",
		"5": "审核通过",
		"6": "审核退回",
		"7": "待发布",
		"8": "发布退回",
		"9": "已发布"
	},

	formatStatus: function(status, type) {
		if (type == 1) {
			return App.Comm.versionStatus[status] || '';
		} else if (type == 2) {
			return App.Comm.modelStatus[status] || '';
		}
		return '';
	},
	//文件状态转换
	convertStatus: function(status) {

		var result = "";
		if (status == 1) {
			result = "待上传";
		} else if (status == 2) {
			result = "上传中";
		} else if (status == 3) {
			result = "待审核";
		} else if (status == 4) {
			result = "审核中";
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

	user: function(key) {

		if (!App.Global.User) {
			window.location.href="/login.html";
		}

		return  App.Global.User[key];
	},

	//封装ajax
	ajax: function(data, callback) {

		if (!data) {
			return;
		}

		data = App.Comm.getUrlByType(data);


		if (data.headers) {
			data.headers.ReturnUrl = location.href;
		} else {
			//登录时要用
			data.headers = {
				ReturnUrl: location.href
			}
		}

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
				data.url = data.url.replace(rex, val);
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
		var Days = 30,
			exp = new Date();
		exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
		document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString() + ";path=/";
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
		exp.setTime(exp.getTime() - 31 * 24 * 60 * 60 * 1000);
		var cval = this.getCookie(name);
		if (cval != null)
			document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString() + ";path=/";
	},

	clearCookie() {
		var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
		if (keys) {
			for (var i = keys.length; i--;)
				document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString()
		}
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
				//$content.css(mDirc, $el.width());
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
				//$content.css(mDirc, 0);
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
				//$content.css(mPos, maxWidth);
			} else {
				//$content.css(mPos, leftNavWidth);
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

	},

	//文件后缀
	fileSuffix(type) {

		if (type == "rvt" || type == "dwg" || type == "folder" || type == 'rfa') {
			return type;
		} else {
			return "other";
		}

	},

	//初始化滚动条
	initScroll($target, axis) {

		//绑定过
		if (!$target || $target.hasClass("mCustomScrollbar")) {
			return;
		}

		var opts = {
			theme: 'minimal-dark',
			axis: axis,
			keyboard: {
				enable: true
			},
			scrollInertia: 0
		}

		if (axis.indexOf("x") > -1) {
			opts["set_width"] = "100%";
		}
		if (axis.indexOf("y") > -1) {
			opts["set_height"] = "100%";
		}

		$target.mCustomScrollbar(opts);
	},

	//获取url 参数
	GetRequest() {
		var url = location.search || location.href.substr(location.href.indexOf('?')); //获取url中"?"符后的字串
		var theRequest = new Object();
		if (url.indexOf("?") != -1) {
			var str = url.substr(1);
			strs = str.split("&");
			for (var i = 0; i < strs.length; i++) {
				theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
			}
		}
		return theRequest;
	},

	//tip组件，使用示例
	// new App.Comm.Tip({message:'',type:'success',timeout:3000}).render().show();
	// 参数说明:message 显示的内容
	// 		 type 样式，三种可选success,common,alarm
	//		 timeout 自动关闭时间 默认2000,选填

	Tip: Backbone.View.extend({
		tagName: 'div',
		className: 'mmhTip',
		template: '<div class="content <%=type%>"><i></i><%=message%></div>',
		initialize: function(data) {
			this._userData = data;
		},
		render: function() {
			var _tpl = _.template(this.template);
			this.$el.html(_tpl(this._userData));
			return this;
		},
		show: function() {
			var _this = this;
			$('body').append(this.$el);
			this.$el.animate({
				top: '40px',
			}, 1000)
			setTimeout(function() {
				_this.$el.remove();
			}, _this._userData.timeout || 2000)
		}
	})
};



//模块
App.Comm.modules = {};
//跨路由调用数据
App.Comm.publicData = {
	services: {
		project: {
			projectId: "",
			projectName: ""
		}
	}
};