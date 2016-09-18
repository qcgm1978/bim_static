;/*!/comm/js/comm.es6*/
"use strict";

App.Comm = {

	Settings: {
		v: 20160313,
		loginType: "user", // 登录状态 user token
		pageItemCount: 15, //Math.floor(($("body").height() + 60) / 70) > 10 && Math.floor(($("body").height() + 60) / 70) || 10
		pageSize: 9999
	},

	//批注类型  0: 模型；1：rvt单文件；2：dwg图纸文件
	hostType: {
		0: "m-single-model",
		1: "m-single-rvt",
		2: "m-single-dwg"
	},

	//是否登录
	isLogin: function isLogin(async) {

		//默认 同步
		if (async) {
			async = true;
		} else {
			async = false;
		}

		var isLogin = false;

		$.ajax({
			url: '/platform/user/current?t=' + +new Date(),
			async: async
		}).done(function (data) {

			if (typeof data == "string") {
				data = JSON.parse(data);
			}
			if (data.code == 0) {
				isLogin = true;
			} else {
				isLogin = false;
			}
		});

		return isLogin;
	},

	//ie预览模型
	isIEModel: function isIEModel() {

		if ("ActiveXObject" in window || window.ActiveXObject) {
			window.location.href = '/ie.html?path=' + window.location.href;
			return true;
		}
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
		"9": "已移交",
		"10": "待审核",
		"11": "审核通过",
		"12": "审核退回",
		"13": "待移交",
		"14": "移交退回"
	},

	//族库和标准模型状态
	modelStatus: {
		"1": "待上传",
		"2": "上传中",
		"3": "待审核",
		"4": "审核中",
		"5": "审核通过",
		"6": "审核退回",
		"7": "待发布",
		"8": "发布退回",
		"9": "已发布",
		"10": "待审核",
		"11": "审核通过",
		"12": "审核退回",
		"13": "待移交",
		"14": "移交退回"
	},

	isAuth: function isAuth(type, s) {
		if (!App.AuthObj) {
			return false;
		}
		var _subType,
		    _auth,
		    _status,
		    _setting,
		    isChange = false,
		    _temp = '4,7,9';
		if (s == 'family') {
			_auth = App.AuthObj.lib && App.AuthObj.lib.family || {};
			_setting = App.ResourceModel.Settings || {};
		} else if (s == 'model') {
			_setting = App.ResourceModel.Settings || {};
			_auth = App.AuthObj.lib && App.AuthObj.lib.model || {};
		} else {
			_setting = App.Project.Settings || {};
			_auth = App.AuthObj.project && App.AuthObj.project.prjfile || {};
		}
		_subType = _setting.CurrentVersion.subType;
		_status = _setting.CurrentVersion.status;
		isChange = _setting.CurrentVersion.name == "初始版本" ? false : true;
		//如果状态等于4,7,9直接禁用
		if (_temp.indexOf(_status) != -1) {
			return false;
		}
		if (s == 'family' || s == 'model') {
			if (_auth.edit) {
				return true;
			} else {
				return false;
			}
		}

		//非标、用户权限、不是变更版本才有（创建、重命名、删除）
		if (type == 'create' || type == "rename" || type == "delete") {

			//变更版本不能创建、删除、重命名
			if (_subType == 3 && _auth.edit && !isChange) {
				return true;
			}
		} else if (type == "upload") {

			if (_auth.edit) {
				return true;
			}
		} else if (type == "down") {
			return true;
		}
		/*//如果状态不等于4,7,9，并且是族库、标准模型则有所有权限
  if (s == 'family' || s == 'model') {
  	return true;
  }*/
		return false;
	},

	//格式化 状态  type 1  project  2 resource
	formatStatus: function formatStatus(status, type, createId, locked) {

		//项目  非初始 锁定
		if (type == 1 && App.Project.Settings.CurrentVersion.name != '初始版本' && locked) {
			if (App.Global.User.userId != createId && createId) {
				return '锁定';
			}
		}

		if (type == 1) {
			return App.Comm.versionStatus[status] || '';
		} else if (type == 2) {
			return App.Comm.modelStatus[status] || '';
		}
		return '';
	},

	user: function user(key) {
		if (!App.Global.User) {
			window.location.href = "/login.html";
		} else {
			return App.Global.User[key];
		}
	},

	//封装ajax
	ajax: function ajax(data, callback) {

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
			};
		}

		return $.ajax(data).done(function (data) {

			//cookie延长30分钟
			App.Comm.setCookieTime(120);

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

			if (data.code != 0) {
				console.log(data.message);
			}

			if ($.isFunction(callback)) {
				//回调
				callback(data);
			}
		});
	},

	getUrlByType: function getUrlByType(data) {

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

		if (typeof temp == 'string') {
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

		if (data.url.indexOf("?") > -1) {
			data.url += "&t=" + +new Date();
		} else {
			data.url += '?t=' + +new Date();
		}

		return data;
	},

	//JS操作cookies方法!
	doMain: window.location.host.substring(window.location.host.indexOf(".")),

	setCookie: function setCookie(name, value) {
		var Days = 0.02,
		    exp = new Date();
		exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
		document.cookie = name + "=" + value + ";expires=" + exp.toGMTString() + ";domain=" + App.Comm.doMain + ";path=/";
	},

	//获取cookie
	getCookie: function getCookie(key, cookis) {

		var cooks = cookis || document.cookie,
		    items = cooks.split("; "),
		    result,
		    len = items.length,
		    str,
		    pos;

		for (var i = 0; i < len; i++) {

			str = items[i];
			pos = str.indexOf('=');

			name = str.substring(0, pos);

			if (name == key) {
				result = str.substring(pos + 1);
				break;
			}
		}
		return result;
	},
	//删除cookie
	delCookie: function delCookie(name) {
		var exp = new Date();
		exp.setTime(exp.getTime() - 31 * 24 * 60 * 60 * 1000);
		var cval = this.getCookie(name);
		if (cval != null) document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString() + ";domain=" + App.Comm.doMain + ";path=/";
	},

	clearCookie: function clearCookie() {
		var keys = this.cookieNames(document.cookie); //  document.cookie.match(/[^ =;]+(?=\=)/g);
		if (keys) {
			for (var i = keys.length; i--;) {
				document.cookie = keys[i] + "=0;expires=" + new Date(0).toUTCString() + ";domain=" + App.Comm.doMain + ";path=/";
			}
		}
	},


	//cookie名称
	cookieNames: function cookieNames(cookies) {

		var items = cookies.split("; ");

		var names = [],
		    len = items.length,
		    str,
		    pos;

		for (var i = 0; i < len; i++) {
			str = items[i];
			pos = str.indexOf('=');
			names.push(str.substring(0, pos));
		}
		return names;
	},

	//设置cookie 时间
	setCookieTime: function setCookieTime(min) {

		var exp = new Date(),
		    keys = this.cookieNames(document.cookie);

		exp.setTime(exp.getTime() + min * 60 * 1000);

		if (keys) {
			for (var i = keys.length; i--;) {
				document.cookie = keys[i] + "=" + this.getCookie(keys[i]) + ";expires=" + exp.toGMTString() + ";domain=" + App.Comm.doMain + ";path=/";
			}
		}

		App.Comm.dispatchIE('?commType=setCookieTime');
	},


	//校验cookie
	checkCookie: function checkCookie(cookies) {

		//用户重新登录了
		if (App.Comm.getCookie("userId") != App.Comm.getCookie("userId", cookies)) {

			App.Comm.clearCookie();

			if (cookies) {
				var keys = App.Comm.cookieNames(cookies),
				    val;
				for (var i = 0; i < keys.length; i++) {

					val = App.Comm.getCookie(keys[i], cookies);

					val && App.Comm.setCookie(keys[i], val);
				}
			}
			App.Comm.getUserInfo();
			window.location.reload();
		}
	},


	//格式化 文件大小
	formatSize: function formatSize(size) {
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
	navBarToggle: function navBarToggle($el, $content, dirc, Viewer) {

		var dircWidth, mDirc;
		if (dirc == "left") {
			mDirc = "margin-left";
		} else {
			mDirc = "margin-right";
		}

		dircWidth = parseInt($el.css(mDirc));

		if (dircWidth >= 0) {
			var width = $el.width(),
			    ani = {};

			ani[mDirc] = -width;
			$el.animate(ani, 500, function () {
				$el.find(".dragSize").hide().end().find(".slideBar i").toggleClass('icon-caret-left icon-caret-right');
				//$content.css(mDirc, 0);
				if (Viewer) {
					Viewer.resize();
				}
			});
		} else {

			var ani = {};
			ani[mDirc] = "0px";

			$el.animate(ani, 500, function () {
				$el.find(".dragSize").show().end().find(".slideBar i").toggleClass('icon-caret-left icon-caret-right');
				//$content.css(mDirc, $el.width());
				if (Viewer) {
					Viewer.resize();
				}
			});
		}
	},
	//拖拽改变尺寸
	dragSize: function dragSize(event, $el, $content, dirc, Viewer) {

		var initX = event.pageX,
		    isLeft = dirc == "left" ? true : false,
		    initWidth = $el.width();

		var $target = $(event.target);

		$(document).on("mousemove.dragSize", function (event) {
			var newWidth;
			if (isLeft) {
				newWidth = initWidth + event.pageX - initX;
			} else {
				newWidth = initWidth + initX - event.pageX;
			}

			$el.width(newWidth);
		});

		$(document).on("mouseup.dragSize", function () {

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
	managePoint: function managePoint(data) {
		App.Comm.viewpointView(data);
	},

	//下载
	checkDownLoad: function checkDownLoad(projectId, projectVersionId, fileVersionId) {

		// if (!App.Comm.getCookie("OUTSSO_AuthToken")) {
		// 	// $.tip({
		// 	// 	message: "登录后下载",
		// 	// 	type: "alarm"
		// 	// });
		// 	window.location.href = "/login.html";
		// 	return;
		// }

		var checkData = {
			URLtype: "checkDownLoad",
			data: {
				projectId: projectId,
				versionId: projectVersionId,
				fileVersionId: fileVersionId
			}
		};

		App.Comm.ajax(checkData, function (data) {
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
				var url = data.url + "&fileVersionId=" + fileVersionId;
				window.location.href = url;
			} else {
				alert(data.message);
			}
		});
	},

	//文件后缀
	fileSuffix: function fileSuffix(type) {

		if (type == "rvt" || type == "dwg" || type == "folder" || type == 'rfa') {
			return type;
		} else {
			return "other";
		}
	},


	//初始化滚动条
	initScroll: function initScroll($target, axis) {

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
		};

		if (axis.indexOf("x") > -1) {
			opts["set_width"] = "100%";
		}
		if (axis.indexOf("y") > -1) {
			opts["set_height"] = "100%";
		}

		$target.mCustomScrollbar(opts);
	},


	//获取url 参数
	GetRequest: function GetRequest() {
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
		initialize: function initialize(data) {
			this._userData = data;
		},
		render: function render() {
			var _tpl = _.template(this.template);
			this.$el.html(_tpl(this._userData));
			return this;
		},
		show: function show() {
			var _this = this;
			$('body').append(this.$el);
			this.$el.animate({
				top: '40px'
			}, 1000);
			setTimeout(function () {
				_this.$el.remove();
			}, _this._userData.timeout || 2000);
		}
	}),
	loadMessageCount: function loadMessageCount(param) {
		if (param != undefined) {
			var _ = $('#messageCount');
			_.text(Number(_.text()) + param);
			return;
		}
		App.Comm.ajax({
			URLtype: 'fetchIMBoxList',
			data: {
				status: 0
			}
		}, function (res) {
			$('#messageCount').html(res.data.totalItemCount);
		});
	},

	//检查是否是唯一的 模型
	setOnlyModel: function setOnlyModel() {
		var onlyCount = App.Comm.getCookie("onlyCount");
		if (!onlyCount) {
			App.Comm.setCookie("onlyCount", 1);
			App.Global.onlyCount = 1;
		} else {
			onlyCount++;
			App.Comm.setCookie("onlyCount", onlyCount);
			App.Global.onlyCount = onlyCount;
		}
	},

	//关闭窗口
	checkOnlyCloseWindow: function checkOnlyCloseWindow() {

		var onlyCount = App.Comm.getCookie("onlyCount");
		//没加载过模型
		if (!onlyCount || !App.Global.onlyCount) {
			return;
		}

		if (onlyCount != App.Global.onlyCount) {
			if (navigator.userAgent.indexOf("Firefox") != -1 || navigator.userAgent.indexOf("Chrome") != -1) {
				window.location.href = "about:blank";
				//window.close();
			} else {
					window.opener = null;
					window.open("", "_self");
					window.close();
				}
		}

		//重置 一直累加会溢出
		if (onlyCount == App.Global.onlyCount && App.Global.onlyCount > 100) {
			App.Comm.setCookie("onlyCount", 1);
			App.Global.onlyCount = 1;
		}
	},
	//獲取cook 和 localstore
	getCookAndStore: function getCookAndStore() {
		return JSON.stringify({
			cookie: document.cookie,
			user: localStorage.getItem("user")
		});
	},
	//发布ie的消息
	dispatchIE: function dispatchIE(url, callback) {

		if (navigator.userAgent.indexOf("QtWebEngine/5.7.0") > -1) {
			if (url) {
				window.open(url);
			}

			if ($.isFunction(callback)) {
				callback();
			}
		}
	},


	//获取用户信息
	getUserInfo: function getUserInfo() {
		$.ajax({
			url: '/platform/user/current?t=' + +new Date(),
			async: false
		}).done(function (data) {
			//失败
			if (data.code != 0) {
				return;
			}
			//ie
			App.Comm.dispatchIE('/?commType=loginIn');
			localStorage.setItem("user", JSON.stringify(data.data));
		});
	}
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
;/*!/comm/js/auth.config.es6*/
'use strict';

//权限配置
App.Comm.AuthConfig = {
	//项目
	Project: {
		//设计
		DesignTab: {
			tab: '<li data-type="design" class="item design">设计<i class="line"></i></li>',
			prop: ' <li data-type="poperties" class="item">属性</li>',
			collision: '<li data-type="collision" class="item selected">碰撞</li>',
			check: '<li data-type="verifi" class="item">设计检查</li>'
		},
		//计划
		PlanTab: {
			tab: '<li data-type="plan" class="item plan">计划<i class="line"></i></li>',
			modularization: '<li data-type="model" class="item selected">模块化</li>',
			simulation: '<li data-type="analog" class="item">模拟</li>',
			follow: '<li data-type="publicity" class="item">关注</li>',
			proof: ' <li data-type="inspection" class="item">校验</li>',
			prop: '<li data-type="poperties" class="item">属性</li>'
		},
		//成本
		CostTab: {
			tab: '<li data-type="cost" class="item cost">成本<i class="line"></i></li>',
			list: '<li data-type="reference" class="item selected">清单</li>',
			change: '<li data-type="change" class="item">变更</li>',
			proof: '<li data-type="verification" class="item">校验</li>',
			prop: '<li data-type="poperties" class="item">属性</li>'
		},
		//质量
		QualityTab: {
			tab: '<li data-type="quality" class="item quality">质量<i class="line"></i></li>',
			material: '<li data-type="materialequipment" class="item selected">材料设备</li>',
			processAcceptanc: '<li data-type="processacceptance" class="item">过程验收</li> ',
			openAcceptance: '<li data-type="openingacceptance" class="item">开业验收</li>',
			latentDanger: '<li data-type="concerns" class="item">隐患</li>',
			prop: '<li data-type="poperties" class="item">属性</li>'
		}

	},

	//服务
	Service: {
		//项目
		project: {
			//项目基本信息
			baseInfo: {
				tab: '<li data-type="base" class="item ">项目基本信息</li>'
			},
			//项目映射规则
			mappingRule: {
				tab: '<li data-type="mappingRule" class="item">项目映射规则</li>'
			},
			//设计信息
			designInfo: {
				tab: '<li data-type="floor" class="item">楼栋信息</li>' + '<li data-type="basehole" class="item">基坑</li>' + '<li data-type="section" class="item">剖面</li>' + '<li data-type="pile" class="item">桩</li>'
			}
		},
		//系统管理
		system: {
			//业务类别管理
			bizCategary: {
				tab: '<li data-type="category" class="item">业务类别管理</li>'
			},
			//业务流程管理
			workflow: {
				tab: '<li data-type="flow"     class="item ">业务流程管理</li>'

			},
			//扩展属性管理
			extendedAttribute: {
				tab: '<li data-type="extend"   class="item ">扩展属性管理</li>'

			}
		}
	},

	//映射规则 模块化/质量标准  管理
	resource: {
		mappingRule: {
			module: '<li class="sele modularization">模块化</li>',
			quality: '<li class="sele quality">质量标准</li>',
			mappingRuleTemplateEdit: '<span class="edit">编辑</span><span class="delete">删除</span>'
		}
	}

};
;/*!/comm/js/collections/treeView.js*/
/**
 * @require comm/js/comm.es6 
 */


App.Comm.TreeViews = function(data, el) {

	var model = new(Backbone.Model.extend({
		defaults: data
	}));

	var treeView = new this.TreeViewDetail({
		model: model
	});

	if (el) {
		$(el).html(treeView.render().el);
	}

	return treeView.render().el;

}

App.Comm.TreeViews.prototype.TreeViewDetail = Backbone.View.extend({

	tagName: 'div',

	className: 'treeView',

	//代办
	events: {
		'click .already': 'already', //已办
		'click .commission': 'commission' //代办
	},

	//template: doT.template(_.get('comm/js/tpls/treeView.html')),

	render: function(data) {

		this.$el.html(App.Comm.TreeViews.prototype.treeRoot(this.model.toJSON())).attr("cid", this.model.cid);

		return this;

	}

});



App.Comm.TreeViews.prototype.treeRoot = function(it) {
	var sb = new StringBuilder();
	var trees = it.data.trees,
		item,
		treeCount = trees.length;
	sb.Append('<ul class="tree-view">');
	for (var i = 0; i < treeCount; i++) {
		sb.Append('<li class="rootNode" > ');
		item = trees[i];
		item.deep = 0;
		item.last = i == treeCount - 1;
		sb.Append(this.treeNode(item));
		sb.Append('</li>');
	}
	sb.Append('</ul>');
	return sb.toString();


}

App.Comm.TreeViews.prototype.treeNode = function(item) {

	var sb = new StringBuilder();

	var left=item.deep == 1 ? 24 : item.deep * 28;

	if (!item.last && item.deep > 0) {
		sb.Append('<div class="tliLine" ng-if="!$last && item.deep>0" style="left:'+left+'px;"></div> ');
	};

	if (!item.last && item.deep == 0) {
		sb.Append('<div class="tliLine" ng-if="!$last && item.deep==0"></div> ');
	};



	//内容
	sb.Append('<div class="item-content" ng-click="itemClick(item,$event)"> ');
	//最后一个垂直 非最后一个是li的line
	if (item.deep != 0 && item.last) {
		sb.Append('<span ng-if="item.deep!=0 && $last" class="hsLine" style="margin-left:' + left + 'px;"></span> ');
	};

	if (!item.last && item.deep != 0) {
		sb.Append('<span ng-if="!$last && item.deep!=0" class="vsLine" style="margin-left:' + left + 'px;"></span>   ');

	};

	if (item.last && item.deep != 0) {
		sb.Append('<span ng-if="$last && item.deep!=0" class="vsLine" style="margin-left:0px;"></span>');
	};

	if (item.children) {
		sb.Append('<span class="nodeSwitch" ng-if="item.children" ng-click="itemExpended($event)">+</span> ');
	} else {
		sb.Append('<span class="nodeSwitch" ng-if="!item.children" >-</span> ');
	}
	sb.Append('<input type="checkbox" class="check-box"> ');
	sb.Append('<span class="text-field">' + item.title + '</span> ');

	sb.Append('</div>');


	//递归
	if (item.children && item.children.length > 0) {
		sb.Append('<ul class="tree-view-sub">');

		var treeSub = item.children,
			treeSubCount = treeSub.length,
			subItem;

		for (var j = 0; j < treeSubCount; j++) {

			sb.Append('<li class="itemNode" > ');

			subItem = treeSub[j];
			subItem.last=j==treeSubCount-1;
			subItem.deep = item.deep + 1;
			sb.Append(this.treeNode(subItem));

			sb.Append('</li>');
		}


		sb.Append('</ul>');
	}

	return sb.toString();

}
;/*!/comm/js/collections/treeViewMar.es6*/
'use strict';

App.Comm.TreeViewMar = function (settings) {

	this.settings = settings;

	var treeView = this.TreeViewBuild();

	if (settings.el) {
		$(settings.el).html(treeView.render().el);
	}

	return treeView.render().el;
};

App.Comm.TreeViewMar.prototype.TreeViewBuild = function () {

	var that = this,
	    settings = this.settings;

	// 放里面 解决作用域问题
	App.Comm.TreeViewMar.prototype.TreeViewDetail = Backbone.View.extend({

		tagName: 'div',

		className: 'treeViewMar',

		//代办
		events: {
			'click .nodeSwitch': 'nodeSwitch',
			'click .text-field': 'itemClick',
			"click .ckSelect": "ckSelect"
		},

		//template: doT.template(_.get('comm/js/tpls/treeView.html')),

		render: function render(data) {

			this.$el.html(that.treeRoot(this.model.toJSON())).attr("cid", this.model.cid);

			return this;
		},
		//收起展开
		nodeSwitch: function nodeSwitch(event) {
			var $el = $(event.target),
			    switchStatus = $el.data('status');
			if (switchStatus) {
				$el.data("status", 0).removeClass('on').closest("li").children("ul").hide();
			} else {
				$el.addClass('on').data("status", 1).closest("li").children("ul").show();
			}
		},
		//点击单个
		itemClick: function itemClick(event) {
			$(".treeViewMarUl .selected").removeClass("selected");

			var $el = $(event.target);
			$el.addClass("selected");

			if ($.isFunction(that.settings.click)) {
				that.settings.click.apply(this, arguments);
			}
		},
		//复选框
		ckSelect: function ckSelect() {
			var $el = $(event.target);
			$el.closest('li').find(".ckSelect").prop("checked", $el.prop("checked"));
		}
	});

	var model = new (Backbone.Model.extend({
		defaults: settings
	}))();

	var treeView = new this.TreeViewDetail({
		model: model
	});

	return treeView;
};

App.Comm.TreeViewMar.prototype.treeRoot = function (it) {

	var sb = new StringBuilder();
	if (!it.data) {
		return;
	}
	var trees = it.data,
	    item,
	    treeCount = trees.length;

	sb.Append('<ul class="treeViewMarUl">');

	for (var i = 0; i < treeCount; i++) {

		sb.Append('<li class="rootNode" > ');
		item = trees[i];
		sb.Append(this.treeNode(item));
		sb.Append('</li>');
	}
	sb.Append('</ul>');
	return sb.toString();
};

App.Comm.TreeViewMar.prototype.treeNode = function (item) {

	var sb = new StringBuilder(),
	    settings = this.settings,
	    isCk = false,
	    isIcon = false;

	//内容
	sb.Append('<div class="item-content"> ');

	if (item.children && item.children.length > 0) {
		sb.Append('<i class="nodeSwitch"></i> ');
	} else {
		sb.Append('<i class="noneSwitch"></i> ');
	}

	if (settings.iconType || item.iconType) {

		if (item.iconType) {
			sb.Append(App.Comm.TreeViewMar.treeNodeIcon(item.iconType));
		} else if (item.iconType != 0) {
			sb.Append(App.Comm.TreeViewMar.treeNodeIcon(settings.iconType));
		}
		isIcon = true;
	}

	if (settings.isCk || item.isCk) {
		if (item.isCk != 0) {
			isCk = true;
			sb.Append('<input type="checkbox" class="ckSelect" />');
		}
	}

	var dataItem = $.extend({}, item);
	delete dataItem.children;
	var itemString = JSON.stringify(dataItem);
	sb.Append('<span class="text-field overflowEllipsis" data-id="' + item.id + '" data-file=\'' + itemString + '\' title="' + item.name + '">' + item.name + '</span> ');

	sb.Append('</div>');

	//递归
	if (item.children && item.children.length > 0) {
		var mUl = "";
		if (isIcon && isCk) {
			mUl = "mIconAndCk";
		} else if (isIcon || isCk) {
			mUl = "mIconOrCk";
		} else {
			mUl = "noneIcon";
		}

		sb.Append('<ul class="treeViewSub ' + mUl + '">');

		var treeSub = item.children,
		    treeSubCount = treeSub.length,
		    subItem;

		for (var j = 0; j < treeSubCount; j++) {

			sb.Append('<li class="itemNode" > ');
			subItem = treeSub[j];
			subItem.iconType = item.iconType;
			subItem.isCk = item.isCk;
			sb.Append(this.treeNode(subItem));

			sb.Append('</li>');
		}

		sb.Append('</ul>');
	}

	return sb.toString();
};

App.Comm.TreeViewMar.treeNodeIcon = function (type) {
	var sb = "";
	if (type == 1) {
		sb = '<i class="folderIcon"></i>';
	} else if (sb == 2) {
		sb = '<i class="folderIcon photo"></i>';
	}
	return sb;
};
;/*!/comm/js/comm.extends.es6*/
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/**
 * @require comm/js/comm.es6 
 */

// underscore 扩展

App.Comm.templateCache = [];

//获取模板根据URL
_.templateUrl = function (url, notCompile) {

	if (url.substr(0, 1) == ".") {
		url = "/static/dist/tpls" + url.substr(1);
	} else if (url.substr(0, 1) == "/") {
		url = "/static/dist/tpls" + url;
	}

	if (App.Comm.templateCache[url]) {
		return App.Comm.templateCache[url];
	}

	var result;
	$.ajax({
		url: url,
		type: 'GET',
		async: false
	}).done(function (tpl) {
		if (notCompile) {
			result = tpl;
		} else {
			result = _.template(tpl);
		}
	});

	App.Comm.templateCache[url] = result;

	return result;
};

App.Comm.requireCache = [];

//按需加载
_.require = function (url) {

	var index = url.lastIndexOf(".");
	var type = url.substring(index + 1);

	url = App.pkg[url];

	//加载过不再加载
	if (App.Comm.requireCache.indexOf(url) == -1) {
		App.Comm.requireCache.push(url);
	} else {
		return;
	}

	if (type == "js") {
		$("head").append('<script type="text/javascript" src="' + url + '"></script>');
	} else if (type = "css") {
		$("head").append('<link rel="styleSheet" href="' + url + '" />');
	}
};

// 拼接字符串扩展
function StringBuilder() {
	this._buffers = [];
	this._length = 0;
	this._splitChar = arguments.length > 0 ? arguments[arguments.length - 1] : '';

	if (arguments.length > 0) {
		for (var i = 0, iLen = arguments.length - 1; i < iLen; i++) {
			this.Append(arguments[i]);
		}
	}
}

Array.prototype.removeByItem = function (item) {

	var index = this.indexOf(item);
	if (index >= 0) {
		this.splice(index, 1);
		return true;
	}
	return false;
};

//向对象中添加字符串
//参数：一个字符串值
StringBuilder.prototype.Append = function (str) {
	this._length += str.length;
	this._buffers[this._buffers.length] = str;
};
StringBuilder.prototype.Add = StringBuilder.prototype.append;
StringBuilder.prototype.IsEmpty = function () {
	return this._buffers.length <= 0;
};
//清空
StringBuilder.prototype.Clear = function () {
	this._buffers = [];
	this._length = 0;
};
StringBuilder.prototype.toString = function () {
	if (arguments.length == 1) {
		return this._buffers.join(arguments[1]);
	} else {
		return this._buffers.join(this._splitChar);
	}
};
//格式化
StringBuilder.prototype.AppendFormat = function () {
	if (arguments.length > 1) {
		var TString = arguments[0];
		if (arguments[1] instanceof Array) {
			for (var i = 0, iLen = arguments[1].length; i < iLen; i++) {
				var jIndex = i;
				var re = eval("/\\{" + jIndex + "\\}/g;");
				TString = TString.replace(re, arguments[1][i]);
			}
		} else {
			for (var i = 1, iLen = arguments.length; i < iLen; i++) {
				var jIndex = i - 1;
				var re = eval("/\\{" + jIndex + "\\}/g;");
				TString = TString.replace(re, arguments[i]);
			}
		}
		this.Append(TString);
	} else if (arguments.length == 1) {
		this.Append(arguments[0]);
	}
};

/** trim() method for String */
String.prototype.trim = function () {
	return this.replace(/(^\s*)|(\s*$)/g, '');
};

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.format = function (fmt) {
	//author: meizz 

	var o = {
		"M+": this.getMonth() + 1, //月份
		"d+": this.getDate(), //日
		"h+": this.getHours(), //小时
		"m+": this.getMinutes(), //分
		"s+": this.getSeconds(), //秒
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度
		"S": this.getMilliseconds() //毫秒
	};
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
	}return fmt;
};

Date.prototype.shortFormat = function () {

	var CapitalMonth = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'],
	    month = CapitalMonth[this.getMonth()];

	return this.getFullYear() + "年" + month + "月";
};

//格式化字符串
//两种调用方式
// var template1="我是{0}，今年{1}了";
// var template2="我是{name}，今年{age}了";
// var result1=template1.format("loogn",22);
// var result2=template2.format({name:"loogn",age:22});
String.prototype.format = function (args) {
	var result = this;
	if (arguments.length > 0) {
		if (arguments.length == 1 && (typeof args === "undefined" ? "undefined" : _typeof(args)) == "object") {
			for (var key in args) {
				if (args[key] != undefined) {
					var reg = new RegExp("({" + key + "})", "g");
					result = result.replace(reg, args[key]);
				}
			}
		} else {
			for (var i = 0; i < arguments.length; i++) {
				if (arguments[i] != undefined) {
					//var reg = new RegExp("({[" + i + "]})", "g");//这个在索引大于9时会有问题，谢谢何以笙箫的指出

					var reg = new RegExp("({)" + i + "(})", "g");
					result = result.replace(reg, arguments[i]);
				}
			}
		}
	}
	return result;
};

var BackboneSync = Backbone.sync;
//重写backbone 的 sync
Backbone.sync = function (method, model, options) {

	// 在没有url 的情况下 取 api 的值 以防有特别的处理
	//if (!model.url)
	//测试
	if (App.API.Settings.debug) {
		model.url = App.API.DEBUGURL[model.urlType];
	} else {
		model.url = App.API.Settings.hostname + App.API.URL[model.urlType];
	}

	//如果有srcUrl 不解析
	if (model.srcUrl) {
		model.url = model.srcUrl;
	}
	//}
	//url 是否有参数
	var urlPars = model.url.match(/\{([\s\S]+?(\}?)+)\}/g);
	if (urlPars) {
		for (var i = 0; i < urlPars.length; i++) {
			var rex = urlPars[i],
			    par = rex.replace(/[{|}]/g, ""),
			    val = model[par];
			if (val) {
				model.url = model.url.replace(rex, val);
			}
		}
	}

	//设置header
	options.headers = {
		ReturnUrl: location.href
	};

	//时间戳
	if (model.url.indexOf("?") > -1) {
		model.url += "&t=" + +new Date();
	} else {
		model.url += '?t=' + +new Date();
	}

	//调用backbone 原本的方法
	return BackboneSync.apply(this, arguments).done(function (data) {

		//cookie延长30分钟
		App.Comm.setCookieTime(120);

		if (data.code == 10004) {
			window.location.href = data.data;

			console.log("未登录");
		}

		if (data.code != 0) {
			console.log(data.message);
		}
	});
};
;/*!/comm/js/modules/comm.module.util.js*/
/**
 * author: baoym@grandsoft.com.cn
 * description: util module
 */
(function ($) {
    'use strict'

    var util = {

        postItems: function (params) {
            params.type = 'post'
            params.data = JSON.stringify(params.data)
            this.__excuteAction(params)
        },

        getItems: function (params) {
            params.type = 'get'
            this.__excuteAction(params)
        },

        deleteItems: function (params) {
            params.type = 'delete'
            params.data = JSON.stringify(params.data)
            this.__excuteAction(params)
        },

        updateItems: function (params) {
            params.type = 'put'
            params.data = JSON.stringify(params.data)
            this.__excuteAction(params)
        },

        __excuteAction: function (params) {
            $.ajax({
                type: params.type,
                url: params.url,
                data: params.data,
                dataType: 'json',
                contentType: 'application/json',
                global: typeof(params.global) === 'undefined' ? true : params.global,
                success: function (data) {
                    params.success && params.success(data)
                },
                error: function (event, xhr, err) {
                    params.error && params.error(event, xhr, err)
                }
            })
        },

        isEmail: function (v) {
            return /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/.test(v)
        },

        isMobile: function (v) {
            return /^\d{11}$/.test(v)
        },

        isGlodonAccount: function (v) {
            var self = this
            if (self.isEmail(v)) return true
            if (self.isMobile(v)) return true
            return false
        },

        __tip: null,

        __tipAnimationTimer: null,

        actionTip: function (text, tipClass, time) {
            var self = this
            if (!self.__tip) {
                self.__tip = $('#page-global-tip')
            }
            var tip = self.__tip.stop(true).removeClass('success info').addClass(tipClass)
            clearTimeout(self.__tipAnimationTimer)
            tip.text(text).animate({
                top: 0
            }, function () {
                self.__tipAnimationTimer = setTimeout(function () {
                    tip.animate({
                        top: -54
                    }, 200)
                }, time || 3000)
            })
        },

        showTip: function (text, tipClass) {
            var self = this
            if (!self.__tip) {
                self.__tip = $('#page-global-tip')
            }
            self.__tip.removeClass('success info').addClass(tipClass)
            var tip = self.__tip.animate({
                top: 0
            })
            text ? tip.text(text) : ''
        },

        hideTip: function (text, time) {
            var self = this
            text ? self.__tip.text(text) : ''
            clearTimeout(self.__tipAnimationTimer)
            self.__tipAnimationTimer = setTimeout(function () {
                self.__tip.animate({
                    top: -54
                }, 200)
            }, time || 700)
        },

        getLocaleDate: function (ms, shortDate, delimiter, onlyYearAndMonthAndDay, noSecond) {
            if (!ms) return
            var date = new Date(ms),
                y = date.getFullYear(),
                m = date.getMonth() + 1,
                d = date.getDate(),
                h = date.getHours(),
                mu = date.getMinutes(),
                s = date.getSeconds()

            function f(ff) {
                return ff < 10 ? '0' + ff : ff
            }

            m = f(m)
            h = f(h)
            d = f(d)
            mu = f(mu)
            s = f(s)
            if (shortDate) {
                return m + (delimiter || '月') + d
            } else if (onlyYearAndMonthAndDay) {
                return y + (delimiter || '年') + m + (delimiter || '月') + d
            } else if (noSecond) {
                return y + (delimiter || '年') + m + (delimiter || '月') + d + ' ' + h + ':' + mu
            } else {
                return y + (delimiter || '年') + m + (delimiter || '月') + d + ' ' + h + ':' + mu + ':' + s
            }
        },

        formatSize: function (size) {
            if (size === undefined || /\D/.test(size)) {
                return 'N/A'
            }
            if (size >= 1099511627776) {
                return parseInt((size / 1099511627776) * 100, 10) / 100 + 'TB'
            }
            if (size >= 1073741824) {
                return parseInt((size / 1073741824) * 100, 10) / 100 + 'GB'
            }
            if (size >= 1048576) {
                return parseInt((size / 1048576).toFixed(2) * 100, 10) / 100 + 'MB'
            } else if (size >= 6) {
                return parseInt((size / 1024).toFixed(2) * 100, 10) / 100 + 'KB'
            } else {
                return size + 'B'
            }
        },

        isOffice: function(extension){
            return !!{
                'doc': true,
                'docx': true,
                'dotx': true,
                'dot': true,
                'dotm': true,
                'xls': true,
                'xlsx': true,
                'xlsm': true,
                'xlm': true,
                'xlsb': true,
                'ppt': true,
                'pptx': true,
                'pps': true,
                'ppsx': true,
                'potx': true,
                'pot': true,
                'pptm': true,
                'potm': true,
                'ppsm': true
            }[extension]
        },

        setFileIcon: function (file) {
            var fileIcon
            var extension = (file.extension && file.extension.toLowerCase()) || ''
            if (file.folder) {
                // maybe appdata
                fileIcon = file.clientId === 'appdata' ? 'appdata' : 'folder'
            } else {
                var ext = extension.replace(/\d+$/g,'')
                switch (ext) {
                    /**********office document************/
                    case 'doc':
                    case 'docx':
                        fileIcon = 'word'
                        break
                    case 'ppt':
                    case 'pptx':
                        fileIcon = 'ppt'
                        break
                    case 'xls':
                    case 'xlsx':
                        fileIcon = 'excel'
                        break
                    case 'jpeg':
                        fileIcon = 'jpg'
                        break
                    case 'pdf':
                    case 'txt':
                    /**********视频图片************/
                    case 'jpg':
                    case 'png':
                    case 'gif':
                    case 'bmp':
                    case 'tga':
                    case 'psd':
                    /**********建筑图纸************/
                    case 'nwd':
                    case 'dxf':
                    case 'dgn':
                    case '3ds':
                    case 'dwf':
                    case 'skp':
                    case 'rvt':
                    /**********广联达计价************/
                    case 'gbq' :
                    case 'gbg' :
                    case 'gzb' :
                    case 'gtb' :
                    case 'gpb' :
                    case 'gpe' :
                    case 'ges' :
                    case 'gdzb' :
                    case 'gdtb' :
                    case 'gdys' :
                    case 'gdgs' :
                    case 'gbqcn' :
                    case 'gbgcn' :
                    case 'gzbcn' :
                    case 'gtbcn' :
                    case 'gpbcn' :
                    case 'gpecn' :
                    case 'gcazb' :
                    case 'gcatb' :
                    case 'gcays' :
                    case 'gcags' :
                    /**********广联达计量************/
                    case 'gbqpc' :
                    case 'gbgpc' :
                    case 'gzbpc' :
                    case 'gtbpc' :
                    case 'gpbpc' :
                    case 'gpepc' :
                    case 'gbqhc' :
                    case 'gbghc' :
                    case 'gzbhc' :
                    case 'gtbhc' :
                    case 'gpbhc' :
                    case 'gpehc' :
                    case 'gbqmt' :
                    case 'gbgmt' :
                    case 'gzbmt' :
                    case 'gtbmt' :
                    case 'gpbmt' :
                    case 'gpemt' :

                    case 'gwhzb' :
                    case 'gwhtb' :
                    case 'gwhys' :
                    case 'gwhgs' :
                    case 'glctb' :
                    case 'glczb' :
                    case 'glcys' :
                    case 'glcgs' :
                    /**********广联达设计BIM************/
                    case 'gcl' :
                    case 'gqi' :
                    case 'ggj' :
                    case 'gjgt' :
                    case 'gdq' :
                    case 'gma' :
                    case 'gst' :
                    case 'gsa' :
                    case 'gss' :
                    case 'gfy' :
                    case 'gbt' :
                    /**********行业工程文件************/
                    case 'dwg' :
                    case 'ifc' :
                    case 'gbv' :
                    case 'igms' :
                    case 'guc' :
                    case 'gfc' :
                    case 'gmsb' :
                    case 'abc' :
                    case 'gsm' :
                    /**********其他文件************/
                    case 'html' :
                    case 'xml' :
                    case 'rar' :
                    case 'zip' :
                    case '7zip' :
                    case 'jar' :
                        fileIcon = ext
                        break
                    case 'htm':
                        fileIcon = 'html'
                        break
                    default:
                        fileIcon = 'other'
                        break
                }
            }
            file.fileIcon = fileIcon
            return file
        },

        __localStoreKey: 'glodon_storage',

        getParaValue: function (param, str) {
            var hashs = (str ? str : location.hash.substr(2)).split('&')
            var findValue
            _.each(hashs, function (hash) {
                var h = hash.split('=')
                if (h[0] === param) {
                    findValue = h[1]
                    return false
                }
            })
            return findValue
        },

        getLocalStore: function (key) {
            var self = this
            var s = store.get(self.__localStoreKey) || {}
            var o = {}
            if (_.isObject(key)) {
                for (var p in key) {
                    o[p] = s[p] || key[p]
                    /*default value*/
                }
            } else {
                o = s[key]
            }
            return o
        },

        setLocalStore: function (key, value) {
            var self = this
            var s = store.get(self.__localStoreKey) || {}
            if (_.isObject(key)) {
                for (var p in key) {
                    s[p] = key[p]
                }
            } else {
                s[key] = value
            }
            store.set(self.__localStoreKey, s)
            return self
        },

        sortItems: function (items) {
            var self = this
            var sortType = self.getLocalStore('sortType') || 'updateTime'
            var sortOrder = self.getLocalStore('sortOrder') || 'descending'
            var descending = sortOrder === 'descending' ? true : false
            var folders = []
            var files = []
            var mergeItems
            for (var i = 0, l = items.length; i < l; i++) {
                if (items[i].folder) {
                    folders.push(items[i])
                } else {
                    files.push(items[i])
                }
            }
            var returnValue = function (v) {
                if (typeof(v) === 'number') {
                    return v
                }
                if (typeof(v) === 'string') {
                    return v.toLowerCase()
                }
            }
            var getValue = function (key, item) {
                key = key.split('.')
                var foundValue
                if (key.length === 1) {
                    foundValue = item[key]
                    return returnValue(foundValue)
                } else {
                    //e.g: owner.displayName
                    foundValue = item[key.shift()]
                    while (key.length) {
                        foundValue = foundValue[key.shift()]
                    }
                    return returnValue(foundValue)
                }
            }
            var sortFunc = function (itemA, itemB) {
                if (descending) {
                    return getValue(sortType, itemA) < getValue(sortType, itemB) ? 1 : -1
                } else {
                    return getValue(sortType, itemA) > getValue(sortType, itemB) ? 1 : -1
                }
            }
            folders.sort(sortFunc)
            files.sort(sortFunc)
            if (descending) {
                mergeItems = folders.concat(files)
            } else {
                mergeItems = files.concat(folders)
            }
            // because we use `prepend` method, so reverse it
            return mergeItems.reverse()
        }

    }

    // export public method

    App.Comm.modules.util = util;

})(jQuery)

;/*!/comm/js/modules/module.dialog.js*/
/**
 * author: zhangyy-g@grandsoft.com.cn
 * description: dialog
 */
(function ($) {
    var Dialog = function (options) {
        this.options = {
            width: 560,
            height: null,
            title: '提示',
            showTitle: true,
            cssClass: null,
            showClose: true,
            message: '你木有事做吗？你真的木有事做吗？缅怀青春吧~',
            limitHeight: true, //是否设置最大高度，如果设置则有滚动条
            isFixed: true,
            denyEsc: false,
            modal: true,
            minify: false,
            isAlert: false,
            isConfirm: true,
            okText: '确&nbsp;&nbsp;定',
            cancelText: '取&nbsp;&nbsp;消',
            okClass: 'button-action',
            okCallback: jQuery.noop,
            cancelClass: '',
            cancelCallback: jQuery.noop,
            readyFn:null,
            closeCallback: jQuery.noop
        }
        jQuery.extend(this.options, options)
        this.init()
    }
    Dialog.prototype = {
        init: function (message, options) {
            //获得渲染页面
            var element = this.element = this.__getElement()
            this.bindEvent()

            //保持单例
            DialogManager.keepSingle(this)

            // 添加到页面
            $(document.body).append(element)

            // 定位
            this.__offset()

            //拖动
            this.__dragable()

            //设置最大高度
            if (this.options.limitHeight) {
                this.find('.content').css({
                    'max-height': $(document).height() * 0.6,
                    'overflow-y': 'auto',
                    'overflow-x': 'hidden'
                })
            }

            //是否显示关闭图标
            if (!this.options.showClose) {
                this.find('.close').hide()
            }

            // 显示
            this.show()

            if ($.isFunction(this.options.readyFn)) {
                this.options.readyFn.call(this);
            }
        },

        //获得渲染页面
        __getElement: function () {
            var fragment = ['<div class="mod-dialog">', '<div class="wrapper">', '<div class="header">', '<h3 class="title">',
                this.options.title, '</h3>',
                this.options.minify ? '<a class="minify">最小</a>' : '', '<a class="close"></a>', '</div>', '<div class="content">',
                '</div>', '</div>', '</div>'].join('')
            var element = jQuery(fragment)

            if (typeof this.options.message == 'string') {
                element.find('.content').html(this.options.message)
            } else {
                $(this.options.message).appendTo(element.find('.content'))
            }

            if (this.options.isAlert) {
                element.find('.wrapper').append('<div class="footer clr"><button class="ok myBtn myBtn-primary ' + this.options.okClass + ' ">' + this.options.okText + '</button></div>')
            }
            if (this.options.isConfirm) {
                element.find('.wrapper').append('<div class="footer clr"><button class="ok myBtn myBtn-primary  ' + this.options.okClass + '">' + this.options.okText + '</button></div>')
                var cancelBtn = $('<button class="cancel myBtn myBtn-default"></button>').html(this.options.cancelText).addClass(this.options.cancelClass)
                element.find('.footer').append(cancelBtn)
            }
            //是否显示头部
            if (!this.options.showTitle) {
                element.find('.header').remove()
            }
            // 设置样式
            element.css({
                width: this.options.width
            })

            if (this.options.height !== null) {
                element.find('.content').css({
                    height: this.options.height
                })
            }
            if (this.options.isFixed !== true) {
                element.css({
                    position: 'absolute'
                })
            }

            this.options.cssClass && element.addClass(this.options.cssClass)

            return element
        },

        //重新定位
        reLocation: function () {
            // 定位
            this.__offset()
        },

        __dragable: function () {
            var element = this.element
            element.draggable && element.draggable({
                containment: 'window',
                handle: '.header'
            })
        },

        //居中
        __offset: function () {
            var element = this.element,
                top = this.options.top,
                left = this.options.left
            if (left == null) {
                left = (jQuery(window).width() - this.element.outerWidth()) / 2
                left = Math.max(0, left)
            }

            // 如果TOP没有指定 那么垂直居中
            if (top == null) {
                top = (jQuery(window).height() - this.element.outerHeight()) / 2
                top = Math.max(0, top)
            }

            // 如果元素不是fixed定位 那么加上滚动条距离
            if (this.element.css('position') != 'fixed') {
                left += jQuery(document).scrollLeft()
                top += jQuery(document).scrollTop()
            }

            element.css({left: left, top: top}).data('top', top)
        },

        //设置宽度
        setWith: function (width) {
            // 设置样式
            this.element.css({
                width: width
            })
            this.options.width = width
        },

        //获得头部
        getHeader: function () {
            return this.find('.wrapper > .header')
        },

        //获得尾部
        getFooter: function () {
            return this.find('.wrapper > .footer')
        },

        //获得遮罩
        getMaskLayer: function () {
            return MaskLayer.getElement()
        },

        //显示
        show: function () {
            var self = this
            if (self.options.modal === true) MaskLayer.show()
            self.__offset()
            var element = self.element
            var top = element.data('top')
            element.css('top', top - 20)
            element.animate({
                top: top,
                filter: 'alpha(opacity=100)',
                opacity: 1
            },300)
        },

        //关闭
        close: function (keepMask) {
            var self = this
            !keepMask && MaskLayer.hide()
            var element = self.element
            var top = element.data('top')
            element.animate({
                top: top - 20,
                filter: 'alpha(opacity=0)',
                opacity: 0
            },300, function(){
                element.remove()
            })
        },

        //最小化
        hide: function () {
            MaskLayer.hide()
            this.element.css('top', '-9999px')
        },

        //查找元素
        find: function (rule) {
            return this.element.find(rule)
        },

        //确认
        confirm: function () {
            var self = this
            self.element.find('.footer .ok').trigger('click')
        },


        bindEvent: function () {
            var self = this
            this.find('.header .close').click(function () {
                self.options.closeCallback.call(self)
                self.close()
                return false
            })
            this.find('.header .minify').click(function () {
                self.hide()
                return false
            })
            this.element.find('.footer .ok').click(function () {
                if (self.options.okCallback.call(self) !== false) {
                    self.close()
                }
                return false
            })
            this.element.find('.footer .cancel').click(function () {
                if (self.options.cancelCallback.call(self) !== false) {
                    self.close()
                }
                return false
            })

            var contextProxy = function () {
                // 防止销魂元素后导致内存泄露（因为RESIZE事件是注册在WINDOW对象上 而不是ELEMENT元素上）
                if (self.element.parent().size() === 0) {
                    jQuery(window).unbind('resize', contextProxy)
                }
                else if (self.element.is(':visible')) {
                    self.__offset()

                    if (self.options.limitHeight) {
                        self.find('.content').css({
                            'max-height': $(window).height() - 100
                        })
                    }
                }
            }
            jQuery(window).resize(contextProxy)
        },
        showError: function (text) {
            var self = this,
                error = self.find('.error')
            if (error.size() == 0) {
                error = $('<div class="error"><i class="dialog-error"></i><span class="error-info"></span></div>').prependTo(self.getFooter())
            }

            error.find('.error-info').html(text).show()
        },
        hideError: function () {
            this.find('.error').hide()
        }
    }

    //遮罩层
    var MaskLayer = {
        getElement: function () {
            if (!this.element) {
                this.element = jQuery('#mod-dialog-masklayer')
                if (this.element.size() == 0) {
                    this.element = jQuery('<div class="mod-dialog-masklayer" />').appendTo($(document.body))
                }
            }
            return this.element
        },
        show: function () {
            this.getElement().show()
        },
        hide: function () {
            this.getElement().hide()
        }
    }

    // 弹窗单例管理
    var DialogManager = {
        present: null,

        keepSingle: function (dialog) {
            if (this.present instanceof Dialog) {
                this.present.close()
                this.present = null
            }
            this.present = dialog
            this.bindEvent()
        },

        escCancel: function (e) {
            if (e.keyCode == 27 && DialogManager.present) {
                var dialog = DialogManager.present,
                    element = dialog.element

                dialog.hide()
            }
        },

        bindEvent: function () {
            jQuery(document).keydown(this.escCancel)
            this.bindEvent = jQuery.noop
        }
    }

    // export public method
  App.Comm.modules.Dialog = Dialog

})(jQuery)

;/*!/comm/pluging/at/js/at.es6*/
"use strict";

;
(function ($) {

  $.fn.at = function (opts) {

    $(this).each(function () {
      new at($(this), opts);
    });
  };

  function at($el, opts) {

    var defaults = {
      $el: $el, //当前元素
      ePos: 0, //光标位置
      getData: null,
      callback: null
    };

    this.Settings = $.extend(defaults, opts);

    this.Settings.id = $el.attr("id");

    //绑定过不用再次绑定   
    if ($el.parent().hasClass("atBox")) {
      return;
    }

    //初始化
    this.init();
  }

  //初始化
  at.prototype.init = function () {
    //构建html
    this.buildHtml();
    //初始化事件
    this.initEvent();
  };

  at.prototype.buildHtml = function () {

    //包裹           
    this.Settings.atBox = this.Settings.$el.wrap('<div class="atBox"></div>').parent();

    this.Settings.atDiv = $('<div  class="atDiv" contenteditable="true"></div>');

    this.Settings.atList = $('<ul class="atList"><li class="loadingUser item">加载中……</li></ul>');

    this.Settings.atBox.append(this.Settings.atDiv);
    this.Settings.atBox.append(this.Settings.atList);

    //样式设置
    this.Settings.atBox.css("display", this.Settings.$el.css("display"));
    this.Settings.atDiv.css({
      width: this.Settings.$el.width(),
      height: this.Settings.$el.height()
    });
  };

  at.prototype.initEvent = function () {

    var that = this;

    this.Settings.atList.on({

      mouseover: function mouseover() {
        if ($(this).hasClass("loadingUser")) {
          return;
        }
        $(this).addClass("selected").siblings().removeClass("selected");
      }

    }, ".item");
    //keyup
    this.Settings.$el.on("keyup", function () {

      var keyCode = event.keyCode;

      if (keyCode == 13) {
        //回车 空格
        that.Settings.atList.hide();
        return;
      } else if (keyCode == 8) {

        //回退
        var index = ePos = that.getCursortPosition(),
            val = that.Settings.$el.val().substring(0, index),
            lastAtIndex = that.hasAt(val);

        if (lastAtIndex == -1) {

          that.Settings.atList.hide();

          return;
        }
      }

      if (that.Settings.atList.is(":visible")) {
        if (keyCode == 38 || keyCode == 40) {
          return;
        }
      }

      //计算 at 的位置
      var index = that.Settings.ePos = that.getCursortPosition(),
          val = that.Settings.$el.val().substring(0, index),
          lastAtIndex = that.hasAt(val);
      //未找到
      if (lastAtIndex == -1) {
        return;
      }
      //计算位置
      that.beforeAtListPosition(val);
    });

    //按下
    this.Settings.$el.on("keydown", function (event) {

      if (that.Settings.atList.is(":visible")) {

        var keyCode = event.keyCode,
            index = that.Settings.atList.find(".item.selected").index(),
            count = that.Settings.atList.find(".item").length;

        //上
        if (keyCode == 38) {

          if (index == -1) {
            that.Settings.atList.find(".item:last").addClass("selected");
          } else {
            if (index == 0) {
              index = count;
            }
            that.Settings.atList.find(".item").eq(index - 1).addClass("selected").siblings().removeClass("selected");
            that.Settings.atList.scrollTop(that.Settings.atList.find(".selected").position().top);
          }

          return false;
        } else if (keyCode == 40) {
          //下
          if (index == -1) {

            that.Settings.atList.find(".item:first").addClass("selected");
          } else {

            if (index + 1 == count) {
              index = -1;
            }
            that.Settings.atList.find(".item").eq(index + 1).addClass("selected").siblings().removeClass("selected");
            that.Settings.atList.scrollTop(that.Settings.atList.find(".selected").position().top);
          }

          return false;
        } else if (keyCode == 13) {

          that.Settings.atList.find(".selected").click();

          return false;
        }
      }
    });

    this.Settings.$el.on("click", function () {

      var index = that.Settings.ePos = that.getCursortPosition(),
          val = that.Settings.$el.val().substring(0, index);

      if (!val) {
        return;
      }

      var lastAtIndex = that.hasAt(val);

      //未找到
      if (lastAtIndex == -1) {
        return;
      }

      lastAtIndex + 1;

      //点击了 at
      val = val.replace(/[\n\r]/gi, "<br/>").replace(/[ ]/g, "a");

      val += '<span class="at"></span>';

      that.Settings.atDiv.html(val);

      that.atListPosition();

      event.stopPropagation();
    });

    that.Settings.atList.on("click", ".item", function () {

      if ($(this).hasClass("loadingUser")) {
        return;
      }

      var text = $(this).find(".name").text() + " ",
          val = that.Settings.$el.val(),
          before = val.substring(0, that.Settings.ePos),
          beforeCount = before.length,
          lastIndex = val.substring(0, that.Settings.ePos).lastIndexOf('@'),
          after = val.substring(that.Settings.ePos);

      that.Settings.$el.val(before.substring(0, lastIndex + 1) + text + after);

      that.Settings.ePos += text.length;

      that.setCaretPosition(that.Settings.ePos);

      //回调
      if (that.Settings.callback) {
        that.Settings.callback($(this));
      }
    });

    $(document).on("click", function () {
      that.Settings.atList.hide();
    });
  };

  //定位前的计算
  at.prototype.beforeAtListPosition = function (val) {

    //替换空格 回车
    val = val.replace(/[\n\r]/gi, "<br/>").replace(/[ ]/g, "a");

    val += '<span class="at"></span>'; //标示列

    this.Settings.atDiv.html(val);

    this.atListPosition();
  };

  //是否存在 at
  at.prototype.hasAt = function (val) {

    var valArr = val.replace(/[\n\r]/gi, " ").split(' '),
        len = valArr.length,
        lastAt = valArr[len - 1],
        lastAtLen = lastAt.length,
        lastAtIndex = lastAt.indexOf('@');

    return lastAtIndex;
  };

  //at list 位置
  at.prototype.atListPosition = function () {

    //个人不可以
    if ($(".commentList .navBar .user").hasClass("selected")) {
      return;
    }

    this.rePosition();

    //获取数据
    this.getData();
  };

  //重新定位
  at.prototype.rePosition = function () {

    var $txt = this.Settings.$el,
        paddingWidth = parseInt($txt.css("padding-left")) + parseInt($txt.css("padding-right")),
        paddingHeight = parseInt($txt.css("padding-top")) + parseInt($txt.css("padding-bottom")),
        pos = this.Settings.atDiv.height($txt.height() + paddingHeight).width($txt.width() + paddingWidth).find(".at").position(),
        top = pos.top + this.Settings.atBox.offset().top - 60;

    if (top + this.Settings.atList.height() > $("body").height()) {
      top -= this.Settings.atList.height() + 30;
    }
    //在窗口中打开时加上窗口的LEFT TOP
    var imboxLeft = 0,
        self = this;
    if ($('.imboxNavWrap').length > 0) {

      var po = $('.commentRemark').offset(),
          top = pos.top > 75 ? $('.talkReMark').offset().top + 85 : $('.talkReMark').offset().top + pos.top + 20;
      imboxLeft += po.left + 18;
      console.log(pos.top, $('.talkReMark').offset().top);
    }
    this.Settings.atList.css({
      top: top,
      left: pos.left + 6 + imboxLeft
    }).show();
  };

  //获取数据
  at.prototype.getData = function () {
    var _this = this;

    var index = this.Settings.ePos,
        that = this,
        val = this.Settings.$el.val().substring(0, index);

    //没有参数
    if (!val) {
      return;
    }

    var valArr = val.replace(/[\n\r]/gi, " ").split(' '),
        len = valArr.length,
        lastAt = valArr[len - 1],
        lastAtLen = lastAt.length,
        lastAtIndex = lastAt.indexOf('@') + 1,
        name = lastAt.substring(lastAtIndex, lastAtLen).trim();

    if ($.isFunction(this.Settings.getData)) {

      var timer = setTimeout(function () {

        clearTimeout(timer);

        if (_this.Settings.Req) {
          _this.Settings.Req.abort();
        }

        _this.Settings.Req = _this.Settings.getData(name).done(function (data) {

          if (data.code == 0) {

            var lis = '',
                liTpl = '<li data-uid="{uid}" class="item"><span class="name">{name}</span>（<span class="dep">{dep}</span>）</li>';
            $.each(data.data, function () {
              lis += liTpl.replace('{name}', this.username).replace('{dep}', this.orgName).replace('{uid}', this.userId);
            });

            if (lis.length > 0) {
              that.Settings.atList.html(lis);
            } else {
              that.Settings.atList.html('<li class="loadingUser item">未找到用户</li></ul>');
            }

            //加载用户后 重新定位
            that.rePosition();
          }
        });
      }, 200);
    }
  };

  //获取光标位置
  at.prototype.getCursortPosition = function () {
    var ctrl = this.Settings.$el[0];
    //获取光标位置函数
    var CaretPos = 0; // IE Support
    if (document.selection) {
      ctrl.focus();
      var Sel = document.selection.createRange();
      Sel.moveStart('character', -ctrl.value.length);
      CaretPos = Sel.text.length;
    }
    // Firefox support
    else if (ctrl.selectionStart || ctrl.selectionStart == '0') CaretPos = ctrl.selectionStart;
    return CaretPos;
  };

  //设置光标位置
  at.prototype.setCaretPosition = function (pos) {
    var ctrl = this.Settings.$el[0];
    if (ctrl.setSelectionRange) {
      ctrl.focus();
      ctrl.setSelectionRange(pos, pos);
    } else if (ctrl.createTextRange) {
      varrange = ctrl.createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
  };
})(jQuery);
;/*!/comm/pluging/confirm/confirm.es6*/
"use strict";

;
(function ($) {

	$.confirm = function (text, enterCallback, canelCallback) {

		if ($(".confirm").length > 0) {
			return;
		}

		var tpl = _.templateUrl('/comm/pluging/confirm/confirm.html', true),
		    opts = {
			width: 284,
			showTitle: false,
			cssClass: "confirm",
			showClose: false,
			isAlert: false,
			limitHeight: false,
			isConfirm: false
		};

		opts.message = tpl.replace('{text}', text);;

		var confirmDialog = new App.Comm.modules.Dialog(opts);

		confirmDialog.element.find(".btnEnter").click(function () {

			if ($.isFunction(enterCallback)) {
				if (enterCallback() != false) {
					confirmDialog.close();
				}
			} else {
				confirmDialog.close();
			}
		});

		confirmDialog.element.find(".btnCanel").click(function () {

			if ($.isFunction(canelCallback)) {
				canelCallback();
			}
			confirmDialog.close();
			return false;
		});
	};
})(jQuery);
;/*!/comm/pluging/jcrop/js/jquery.Jcrop.min.js*/
/**
 * jquery.Jcrop.min.js v0.9.12 (build:20130202)
 * jQuery Image Cropping Plugin - released under MIT License
 * Copyright (c) 2008-2013 Tapmodo Interactive LLC
 * https://github.com/tapmodo/Jcrop
 */
(function(a){a.Jcrop=function(b,c){function i(a){return Math.round(a)+"px"}function j(a){return d.baseClass+"-"+a}function k(){return a.fx.step.hasOwnProperty("backgroundColor")}function l(b){var c=a(b).offset();return[c.left,c.top]}function m(a){return[a.pageX-e[0],a.pageY-e[1]]}function n(b){typeof b!="object"&&(b={}),d=a.extend(d,b),a.each(["onChange","onSelect","onRelease","onDblClick"],function(a,b){typeof d[b]!="function"&&(d[b]=function(){})})}function o(a,b,c){e=l(D),bc.setCursor(a==="move"?a:a+"-resize");if(a==="move")return bc.activateHandlers(q(b),v,c);var d=_.getFixed(),f=r(a),g=_.getCorner(r(f));_.setPressed(_.getCorner(f)),_.setCurrent(g),bc.activateHandlers(p(a,d),v,c)}function p(a,b){return function(c){if(!d.aspectRatio)switch(a){case"e":c[1]=b.y2;break;case"w":c[1]=b.y2;break;case"n":c[0]=b.x2;break;case"s":c[0]=b.x2}else switch(a){case"e":c[1]=b.y+1;break;case"w":c[1]=b.y+1;break;case"n":c[0]=b.x+1;break;case"s":c[0]=b.x+1}_.setCurrent(c),bb.update()}}function q(a){var b=a;return bd.watchKeys
(),function(a){_.moveOffset([a[0]-b[0],a[1]-b[1]]),b=a,bb.update()}}function r(a){switch(a){case"n":return"sw";case"s":return"nw";case"e":return"nw";case"w":return"ne";case"ne":return"sw";case"nw":return"se";case"se":return"nw";case"sw":return"ne"}}function s(a){return function(b){return d.disabled?!1:a==="move"&&!d.allowMove?!1:(e=l(D),W=!0,o(a,m(b)),b.stopPropagation(),b.preventDefault(),!1)}}function t(a,b,c){var d=a.width(),e=a.height();d>b&&b>0&&(d=b,e=b/a.width()*a.height()),e>c&&c>0&&(e=c,d=c/a.height()*a.width()),T=a.width()/d,U=a.height()/e,a.width(d).height(e)}function u(a){return{x:a.x*T,y:a.y*U,x2:a.x2*T,y2:a.y2*U,w:a.w*T,h:a.h*U}}function v(a){var b=_.getFixed();b.w>d.minSelect[0]&&b.h>d.minSelect[1]?(bb.enableHandles(),bb.done()):bb.release(),bc.setCursor(d.allowSelect?"crosshair":"default")}function w(a){if(d.disabled)return!1;if(!d.allowSelect)return!1;W=!0,e=l(D),bb.disableHandles(),bc.setCursor("crosshair");var b=m(a);return _.setPressed(b),bb.update(),bc.activateHandlers(x,v,a.type.substring
(0,5)==="touch"),bd.watchKeys(),a.stopPropagation(),a.preventDefault(),!1}function x(a){_.setCurrent(a),bb.update()}function y(){var b=a("<div></div>").addClass(j("tracker"));return g&&b.css({opacity:0,backgroundColor:"white"}),b}function be(a){G.removeClass().addClass(j("holder")).addClass(a)}function bf(a,b){function t(){window.setTimeout(u,l)}var c=a[0]/T,e=a[1]/U,f=a[2]/T,g=a[3]/U;if(X)return;var h=_.flipCoords(c,e,f,g),i=_.getFixed(),j=[i.x,i.y,i.x2,i.y2],k=j,l=d.animationDelay,m=h[0]-j[0],n=h[1]-j[1],o=h[2]-j[2],p=h[3]-j[3],q=0,r=d.swingSpeed;c=k[0],e=k[1],f=k[2],g=k[3],bb.animMode(!0);var s,u=function(){return function(){q+=(100-q)/r,k[0]=Math.round(c+q/100*m),k[1]=Math.round(e+q/100*n),k[2]=Math.round(f+q/100*o),k[3]=Math.round(g+q/100*p),q>=99.8&&(q=100),q<100?(bh(k),t()):(bb.done(),bb.animMode(!1),typeof b=="function"&&b.call(bs))}}();t()}function bg(a){bh([a[0]/T,a[1]/U,a[2]/T,a[3]/U]),d.onSelect.call(bs,u(_.getFixed())),bb.enableHandles()}function bh(a){_.setPressed([a[0],a[1]]),_.setCurrent([a[2],
a[3]]),bb.update()}function bi(){return u(_.getFixed())}function bj(){return _.getFixed()}function bk(a){n(a),br()}function bl(){d.disabled=!0,bb.disableHandles(),bb.setCursor("default"),bc.setCursor("default")}function bm(){d.disabled=!1,br()}function bn(){bb.done(),bc.activateHandlers(null,null)}function bo(){G.remove(),A.show(),A.css("visibility","visible"),a(b).removeData("Jcrop")}function bp(a,b){bb.release(),bl();var c=new Image;c.onload=function(){var e=c.width,f=c.height,g=d.boxWidth,h=d.boxHeight;D.width(e).height(f),D.attr("src",a),H.attr("src",a),t(D,g,h),E=D.width(),F=D.height(),H.width(E).height(F),M.width(E+L*2).height(F+L*2),G.width(E).height(F),ba.resize(E,F),bm(),typeof b=="function"&&b.call(bs)},c.src=a}function bq(a,b,c){var e=b||d.bgColor;d.bgFade&&k()&&d.fadeTime&&!c?a.animate({backgroundColor:e},{queue:!1,duration:d.fadeTime}):a.css("backgroundColor",e)}function br(a){d.allowResize?a?bb.enableOnly():bb.enableHandles():bb.disableHandles(),bc.setCursor(d.allowSelect?"crosshair":"default"),bb
.setCursor(d.allowMove?"move":"default"),d.hasOwnProperty("trueSize")&&(T=d.trueSize[0]/E,U=d.trueSize[1]/F),d.hasOwnProperty("setSelect")&&(bg(d.setSelect),bb.done(),delete d.setSelect),ba.refresh(),d.bgColor!=N&&(bq(d.shade?ba.getShades():G,d.shade?d.shadeColor||d.bgColor:d.bgColor),N=d.bgColor),O!=d.bgOpacity&&(O=d.bgOpacity,d.shade?ba.refresh():bb.setBgOpacity(O)),P=d.maxSize[0]||0,Q=d.maxSize[1]||0,R=d.minSize[0]||0,S=d.minSize[1]||0,d.hasOwnProperty("outerImage")&&(D.attr("src",d.outerImage),delete d.outerImage),bb.refresh()}var d=a.extend({},a.Jcrop.defaults),e,f=navigator.userAgent.toLowerCase(),g=/msie/.test(f),h=/msie [1-6]\./.test(f);typeof b!="object"&&(b=a(b)[0]),typeof c!="object"&&(c={}),n(c);var z={border:"none",visibility:"visible",margin:0,padding:0,position:"absolute",top:0,left:0},A=a(b),B=!0;if(b.tagName=="IMG"){if(A[0].width!=0&&A[0].height!=0)A.width(A[0].width),A.height(A[0].height);else{var C=new Image;C.src=A[0].src,A.width(C.width),A.height(C.height)}var D=A.clone().removeAttr("id").
css(z).show();D.width(A.width()),D.height(A.height()),A.after(D).hide()}else D=A.css(z).show(),B=!1,d.shade===null&&(d.shade=!0);t(D,d.boxWidth,d.boxHeight);var E=D.width(),F=D.height(),G=a("<div />").width(E).height(F).addClass(j("holder")).css({position:"relative",backgroundColor:d.bgColor}).insertAfter(A).append(D);d.addClass&&G.addClass(d.addClass);var H=a("<div />"),I=a("<div />").width("100%").height("100%").css({zIndex:310,position:"absolute",overflow:"hidden"}),J=a("<div />").width("100%").height("100%").css("zIndex",320),K=a("<div />").css({position:"absolute",zIndex:600}).dblclick(function(){var a=_.getFixed();d.onDblClick.call(bs,a)}).insertBefore(D).append(I,J);B&&(H=a("<img />").attr("src",D.attr("src")).css(z).width(E).height(F),I.append(H)),h&&K.css({overflowY:"hidden"});var L=d.boundary,M=y().width(E+L*2).height(F+L*2).css({position:"absolute",top:i(-L),left:i(-L),zIndex:290}).mousedown(w),N=d.bgColor,O=d.bgOpacity,P,Q,R,S,T,U,V=!0,W,X,Y;e=l(D);var Z=function(){function a(){var a={},b=["touchstart"
,"touchmove","touchend"],c=document.createElement("div"),d;try{for(d=0;d<b.length;d++){var e=b[d];e="on"+e;var f=e in c;f||(c.setAttribute(e,"return;"),f=typeof c[e]=="function"),a[b[d]]=f}return a.touchstart&&a.touchend&&a.touchmove}catch(g){return!1}}function b(){return d.touchSupport===!0||d.touchSupport===!1?d.touchSupport:a()}return{createDragger:function(a){return function(b){return d.disabled?!1:a==="move"&&!d.allowMove?!1:(e=l(D),W=!0,o(a,m(Z.cfilter(b)),!0),b.stopPropagation(),b.preventDefault(),!1)}},newSelection:function(a){return w(Z.cfilter(a))},cfilter:function(a){return a.pageX=a.originalEvent.changedTouches[0].pageX,a.pageY=a.originalEvent.changedTouches[0].pageY,a},isSupported:a,support:b()}}(),_=function(){function h(d){d=n(d),c=a=d[0],e=b=d[1]}function i(a){a=n(a),f=a[0]-c,g=a[1]-e,c=a[0],e=a[1]}function j(){return[f,g]}function k(d){var f=d[0],g=d[1];0>a+f&&(f-=f+a),0>b+g&&(g-=g+b),F<e+g&&(g+=F-(e+g)),E<c+f&&(f+=E-(c+f)),a+=f,c+=f,b+=g,e+=g}function l(a){var b=m();switch(a){case"ne":return[
b.x2,b.y];case"nw":return[b.x,b.y];case"se":return[b.x2,b.y2];case"sw":return[b.x,b.y2]}}function m(){if(!d.aspectRatio)return p();var f=d.aspectRatio,g=d.minSize[0]/T,h=d.maxSize[0]/T,i=d.maxSize[1]/U,j=c-a,k=e-b,l=Math.abs(j),m=Math.abs(k),n=l/m,r,s,t,u;return h===0&&(h=E*10),i===0&&(i=F*10),n<f?(s=e,t=m*f,r=j<0?a-t:t+a,r<0?(r=0,u=Math.abs((r-a)/f),s=k<0?b-u:u+b):r>E&&(r=E,u=Math.abs((r-a)/f),s=k<0?b-u:u+b)):(r=c,u=l/f,s=k<0?b-u:b+u,s<0?(s=0,t=Math.abs((s-b)*f),r=j<0?a-t:t+a):s>F&&(s=F,t=Math.abs(s-b)*f,r=j<0?a-t:t+a)),r>a?(r-a<g?r=a+g:r-a>h&&(r=a+h),s>b?s=b+(r-a)/f:s=b-(r-a)/f):r<a&&(a-r<g?r=a-g:a-r>h&&(r=a-h),s>b?s=b+(a-r)/f:s=b-(a-r)/f),r<0?(a-=r,r=0):r>E&&(a-=r-E,r=E),s<0?(b-=s,s=0):s>F&&(b-=s-F,s=F),q(o(a,b,r,s))}function n(a){return a[0]<0&&(a[0]=0),a[1]<0&&(a[1]=0),a[0]>E&&(a[0]=E),a[1]>F&&(a[1]=F),[Math.round(a[0]),Math.round(a[1])]}function o(a,b,c,d){var e=a,f=c,g=b,h=d;return c<a&&(e=c,f=a),d<b&&(g=d,h=b),[e,g,f,h]}function p(){var d=c-a,f=e-b,g;return P&&Math.abs(d)>P&&(c=d>0?a+P:a-P),Q&&Math.abs
(f)>Q&&(e=f>0?b+Q:b-Q),S/U&&Math.abs(f)<S/U&&(e=f>0?b+S/U:b-S/U),R/T&&Math.abs(d)<R/T&&(c=d>0?a+R/T:a-R/T),a<0&&(c-=a,a-=a),b<0&&(e-=b,b-=b),c<0&&(a-=c,c-=c),e<0&&(b-=e,e-=e),c>E&&(g=c-E,a-=g,c-=g),e>F&&(g=e-F,b-=g,e-=g),a>E&&(g=a-F,e-=g,b-=g),b>F&&(g=b-F,e-=g,b-=g),q(o(a,b,c,e))}function q(a){return{x:a[0],y:a[1],x2:a[2],y2:a[3],w:a[2]-a[0],h:a[3]-a[1]}}var a=0,b=0,c=0,e=0,f,g;return{flipCoords:o,setPressed:h,setCurrent:i,getOffset:j,moveOffset:k,getCorner:l,getFixed:m}}(),ba=function(){function f(a,b){e.left.css({height:i(b)}),e.right.css({height:i(b)})}function g(){return h(_.getFixed())}function h(a){e.top.css({left:i(a.x),width:i(a.w),height:i(a.y)}),e.bottom.css({top:i(a.y2),left:i(a.x),width:i(a.w),height:i(F-a.y2)}),e.right.css({left:i(a.x2),width:i(E-a.x2)}),e.left.css({width:i(a.x)})}function j(){return a("<div />").css({position:"absolute",backgroundColor:d.shadeColor||d.bgColor}).appendTo(c)}function k(){b||(b=!0,c.insertBefore(D),g(),bb.setBgOpacity(1,0,1),H.hide(),l(d.shadeColor||d.bgColor,1),bb.
isAwake()?n(d.bgOpacity,1):n(1,1))}function l(a,b){bq(p(),a,b)}function m(){b&&(c.remove(),H.show(),b=!1,bb.isAwake()?bb.setBgOpacity(d.bgOpacity,1,1):(bb.setBgOpacity(1,1,1),bb.disableHandles()),bq(G,0,1))}function n(a,e){b&&(d.bgFade&&!e?c.animate({opacity:1-a},{queue:!1,duration:d.fadeTime}):c.css({opacity:1-a}))}function o(){d.shade?k():m(),bb.isAwake()&&n(d.bgOpacity)}function p(){return c.children()}var b=!1,c=a("<div />").css({position:"absolute",zIndex:240,opacity:0}),e={top:j(),left:j().height(F),right:j().height(F),bottom:j()};return{update:g,updateRaw:h,getShades:p,setBgColor:l,enable:k,disable:m,resize:f,refresh:o,opacity:n}}(),bb=function(){function k(b){var c=a("<div />").css({position:"absolute",opacity:d.borderOpacity}).addClass(j(b));return I.append(c),c}function l(b,c){var d=a("<div />").mousedown(s(b)).css({cursor:b+"-resize",position:"absolute",zIndex:c}).addClass("ord-"+b);return Z.support&&d.bind("touchstart.jcrop",Z.createDragger(b)),J.append(d),d}function m(a){var b=d.handleSize,e=l(a,c++
).css({opacity:d.handleOpacity}).addClass(j("handle"));return b&&e.width(b).height(b),e}function n(a){return l(a,c++).addClass("jcrop-dragbar")}function o(a){var b;for(b=0;b<a.length;b++)g[a[b]]=n(a[b])}function p(a){var b,c;for(c=0;c<a.length;c++){switch(a[c]){case"n":b="hline";break;case"s":b="hline bottom";break;case"e":b="vline right";break;case"w":b="vline"}e[a[c]]=k(b)}}function q(a){var b;for(b=0;b<a.length;b++)f[a[b]]=m(a[b])}function r(a,b){d.shade||H.css({top:i(-b),left:i(-a)}),K.css({top:i(b),left:i(a)})}function t(a,b){K.width(Math.round(a)).height(Math.round(b))}function v(){var a=_.getFixed();_.setPressed([a.x,a.y]),_.setCurrent([a.x2,a.y2]),w()}function w(a){if(b)return x(a)}function x(a){var c=_.getFixed();t(c.w,c.h),r(c.x,c.y),d.shade&&ba.updateRaw(c),b||A(),a?d.onSelect.call(bs,u(c)):d.onChange.call(bs,u(c))}function z(a,c,e){if(!b&&!c)return;d.bgFade&&!e?D.animate({opacity:a},{queue:!1,duration:d.fadeTime}):D.css("opacity",a)}function A(){K.show(),d.shade?ba.opacity(O):z(O,!0),b=!0}function B
(){F(),K.hide(),d.shade?ba.opacity(1):z(1),b=!1,d.onRelease.call(bs)}function C(){h&&J.show()}function E(){h=!0;if(d.allowResize)return J.show(),!0}function F(){h=!1,J.hide()}function G(a){a?(X=!0,F()):(X=!1,E())}function L(){G(!1),v()}var b,c=370,e={},f={},g={},h=!1;d.dragEdges&&a.isArray(d.createDragbars)&&o(d.createDragbars),a.isArray(d.createHandles)&&q(d.createHandles),d.drawBorders&&a.isArray(d.createBorders)&&p(d.createBorders),a(document).bind("touchstart.jcrop-ios",function(b){a(b.currentTarget).hasClass("jcrop-tracker")&&b.stopPropagation()});var M=y().mousedown(s("move")).css({cursor:"move",position:"absolute",zIndex:360});return Z.support&&M.bind("touchstart.jcrop",Z.createDragger("move")),I.append(M),F(),{updateVisible:w,update:x,release:B,refresh:v,isAwake:function(){return b},setCursor:function(a){M.css("cursor",a)},enableHandles:E,enableOnly:function(){h=!0},showHandles:C,disableHandles:F,animMode:G,setBgOpacity:z,done:L}}(),bc=function(){function f(b){M.css({zIndex:450}),b?a(document).bind("touchmove.jcrop"
,k).bind("touchend.jcrop",l):e&&a(document).bind("mousemove.jcrop",h).bind("mouseup.jcrop",i)}function g(){M.css({zIndex:290}),a(document).unbind(".jcrop")}function h(a){return b(m(a)),!1}function i(a){return a.preventDefault(),a.stopPropagation(),W&&(W=!1,c(m(a)),bb.isAwake()&&d.onSelect.call(bs,u(_.getFixed())),g(),b=function(){},c=function(){}),!1}function j(a,d,e){return W=!0,b=a,c=d,f(e),!1}function k(a){return b(m(Z.cfilter(a))),!1}function l(a){return i(Z.cfilter(a))}function n(a){M.css("cursor",a)}var b=function(){},c=function(){},e=d.trackDocument;return e||M.mousemove(h).mouseup(i).mouseout(i),D.before(M),{activateHandlers:j,setCursor:n}}(),bd=function(){function e(){d.keySupport&&(b.show(),b.focus())}function f(a){b.hide()}function g(a,b,c){d.allowMove&&(_.moveOffset([b,c]),bb.updateVisible(!0)),a.preventDefault(),a.stopPropagation()}function i(a){if(a.ctrlKey||a.metaKey)return!0;Y=a.shiftKey?!0:!1;var b=Y?10:1;switch(a.keyCode){case 37:g(a,-b,0);break;case 39:g(a,b,0);break;case 38:g(a,0,-b);break;
case 40:g(a,0,b);break;case 27:d.allowSelect&&bb.release();break;case 9:return!0}return!1}var b=a('<input type="radio" />').css({position:"fixed",left:"-120px",width:"12px"}).addClass("jcrop-keymgr"),c=a("<div />").css({position:"absolute",overflow:"hidden"}).append(b);return d.keySupport&&(b.keydown(i).blur(f),h||!d.fixedSupport?(b.css({position:"absolute",left:"-20px"}),c.append(b).insertBefore(D)):b.insertBefore(D)),{watchKeys:e}}();Z.support&&M.bind("touchstart.jcrop",Z.newSelection),J.hide(),br(!0);var bs={setImage:bp,animateTo:bf,setSelect:bg,setOptions:bk,tellSelect:bi,tellScaled:bj,setClass:be,disable:bl,enable:bm,cancel:bn,release:bb.release,destroy:bo,focus:bd.watchKeys,getBounds:function(){return[E*T,F*U]},getWidgetSize:function(){return[E,F]},getScaleFactor:function(){return[T,U]},getOptions:function(){return d},ui:{holder:G,selection:K}};return g&&G.bind("selectstart",function(){return!1}),A.data("Jcrop",bs),bs},a.fn.Jcrop=function(b,c){var d;return this.each(function(){if(a(this).data("Jcrop")){if(
b==="api")return a(this).data("Jcrop");a(this).data("Jcrop").setOptions(b)}else this.tagName=="IMG"?a.Jcrop.Loader(this,function(){a(this).css({display:"block",visibility:"hidden"}),d=a.Jcrop(this,b),a.isFunction(c)&&c.call(d)}):(a(this).css({display:"block",visibility:"hidden"}),d=a.Jcrop(this,b),a.isFunction(c)&&c.call(d))}),this},a.Jcrop.Loader=function(b,c,d){function g(){f.complete?(e.unbind(".jcloader"),a.isFunction(c)&&c.call(f)):window.setTimeout(g,50)}var e=a(b),f=e[0];e.bind("load.jcloader",g).bind("error.jcloader",function(b){e.unbind(".jcloader"),a.isFunction(d)&&d.call(f)}),f.complete&&a.isFunction(c)&&(e.unbind(".jcloader"),c.call(f))},a.Jcrop.defaults={allowSelect:!0,allowMove:!0,allowResize:!0,trackDocument:!0,baseClass:"jcrop",addClass:null,bgColor:"black",bgOpacity:.6,bgFade:!1,borderOpacity:.4,handleOpacity:.5,handleSize:null,aspectRatio:0,keySupport:!0,createHandles:["n","s","e","w","nw","ne","se","sw"],createDragbars:["n","s","e","w"],createBorders:["n","s","e","w"],drawBorders:!0,dragEdges
:!0,fixedSupport:!0,touchSupport:null,shade:null,boxWidth:0,boxHeight:0,boundary:2,fadeTime:400,animationDelay:20,swingSpeed:3,minSelect:[0,0],maxSize:[0,0],minSize:[0,0],onChange:function(){},onSelect:function(){},onDblClick:function(){},onRelease:function(){}}})(jQuery);
;/*!/comm/pluging/jquery/jquery.contextMenu .js*/
/*
 * ContextMenu - jQuery plugin for right-click context menus
 *
 * Author: Chris Domigan
 * Contributors: Dan G. Switzer, II
 * Parts of this plugin are inspired by Joern Zaefferer's Tooltip plugin
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Version: r2
 * Date: 16 July 2007
 *
 * For documentation visit http://www.trendskitchens.co.nz/jquery/contextmenu/
 *
 */

(function($) {

	var menu, shadow, trigger, content, hash, currentTarget;
	var defaults = {
		theme: "",
		menuStyle: {
			listStyle: 'none',
			padding: '0px',
			margin: '0px',
			backgroundColor: '#fff',
			border: '1px solid #999',
			width: '100px'
		},
		itemStyle: {
			margin: '0px',
			color: '#666',
			display: 'block',
			cursor: 'default',
			padding: '6px 5px',
			//border: '1px solid #fff',
			backgroundColor: 'transparent'
		},
		itemHoverStyle: {
			//border: '1px solid #0a246a',
			backgroundColor: '#A8DBFD'
		},
		eventPosX: 'pageX',
		eventPosY: 'pageY',
		shadow: true,
		onContextMenu: null,
		onShowMenu: null,
		onShowMenuCallback: null
	};

	$.fn.contextMenu = function(id, options) {

		if (!menu) { // Create singleton menu
			menu = $('<div class="jqContextMenu"></div>')
				.hide()
				.appendTo('body')
				.bind('click', function(e) {
					e.stopPropagation();
				});
			menu.html($("#" + id));
			if (options.theme) {
				menu.addClass(options.theme);
			}
		}
		if (!shadow) {
			shadow = $('<div></div>')
				.css({
					backgroundColor: '#000',
					position: 'absolute',
					opacity: 0.2,
					zIndex: 499
				})
				.appendTo('body')
				.hide();
		}
		hash = hash || [];
		hash.push({
			id: id,
			menuStyle: $.extend({}, defaults.menuStyle, options.menuStyle || {}),
			itemStyle: $.extend({}, defaults.itemStyle, options.itemStyle || {}),
			itemHoverStyle: $.extend({}, defaults.itemHoverStyle, options.itemHoverStyle || {}),
			bindings: options.bindings || {},
			shadow: options.shadow || options.shadow === false ? options.shadow : defaults.shadow,
			onContextMenu: options.onContextMenu || defaults.onContextMenu,
			onShowMenu: options.onShowMenu || defaults.onShowMenu,
			onShowMenuCallback: options.onShowMenuCallback || null,
			eventPosX: options.eventPosX || defaults.eventPosX,
			eventPosY: options.eventPosY || defaults.eventPosY
		});

		var index = hash.length - 1;
		$(this).bind('contextmenu', function(e) {
			// Check if onContextMenu() defined
			var bShowContext = (!!hash[index].onContextMenu) ? hash[index].onContextMenu(e) : true;
			 
			if (bShowContext) display(index, this, e, options,id);
			if ($.isFunction(options.onShowMenuCallback)) {
				options.onShowMenuCallback(e);
			} 

			var top = e.pageY,
				meunHeight = menu.height();
			if (top + meunHeight > $("body").height()) {
				top = top - meunHeight;
			}

			menu.css("top",top);
			
			return false;
		});

		return this;
	}; 

	function display(index, trigger, e, options,id) {
		 
		if (menu.find("#"+id).length<=0) {
			$("body").append($(".jqContextMenu").children("div"));
			menu.html($("#" + id));
		} 

		menu.removeClass().addClass("jqContextMenu");

		if (options.theme) {
			menu.addClass(options.theme);
		}

		var cur = hash[index];
		//content = $('#' + cur.id).find('ul:first').clone(true);
		//禁用hover
		// content.css(cur.menuStyle).find('li').css(cur.itemStyle).hover(
		// 	function() {
		// 		$(this).css(cur.itemHoverStyle);
		// 	},
		// 	function() {
		// 		$(this).css(cur.itemStyle);
		// 	}
		// ).find('img').css({
		// 	verticalAlign: 'middle',
		// 	paddingRight: '2px'
		// });

		// Send the content to the menu
		//menu.html(content);

		// if there's an onShowMenu, run it now -- must run after content has been added
		// if you try to alter the content variable before the menu.html(), IE6 has issues
		// updating the content
		 
		if (!!cur.onShowMenu) menu = cur.onShowMenu(e, menu);

		$.each(cur.bindings, function(id, func) {
			$('#' + id, menu).unbind().bind('click', function(e) {
				hide();
				func(trigger, currentTarget);
			});
		});

		menu.css({
			'left': e[cur.eventPosX],
			'top': e[cur.eventPosY]
		}).show();

		if (cur.shadow) shadow.css({
			width: menu.width(),
			height: menu.height(),
			left: e.pageX + 2,
			top: e.pageY + 2
		}).show();
		$(document).one('click', hide);
	}

	function hide() {
		menu.hide();
		shadow.hide();
	}

	// Apply defaults
	$.contextMenu = {
		defaults: function(userDefaults) {
			$.each(userDefaults, function(i, val) {
				if (typeof val == 'object' && defaults[i]) {
					$.extend(defaults[i], val);
				} else defaults[i] = val;
			});
		}
	};

})(jQuery);

$(function() {
	$('div.contextMenu').hide();
});
;/*!/comm/pluging/jqueryPluploadQueue/comm.upload.js*/
/**
 * author: baoym@grandsoft.com.cn
 * description: general upload module
 * dependency:
 */
(function($) {

    var isUploading = false

    var userAgent = navigator.userAgent.toLowerCase()

    var isSafari = /webkit/.test(userAgent) && !/chrome/.test(userAgent)

    var supportDirectory = function() {
        var input = document.createElement('input')
            // todo: now is chrome only
        return ('webkitdirectory' in input)
    }

    var supportDragdrop = function() {
        var div = document.createElement('div')
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)
    }

    //默认配置
    var defaultOptions = {
        // plupload options
        url: '/document/id/file/?upload&returnFirst',
        runtimes: 'html5, flash',
        unique_names: true,
        flash_swf_url: '/libs/plupload/plupload.flash.swf',
        multipart: true,
        dragdrop: false,
        browse_button: 'file-upload-btn',
        // custom options
        directory: true,
        draggable: true,
        dragAndDropUpload: true,
        skipCheckSize: 78643200000000 // files below 7.5M not check size(get uploaded bytes) while upload
    }

    var upload = {
        init: function(container, options) {

            if (!container) return
            upload.container = container
            upload.options = options || {}
            upload.__initPlUpload($.extend({}, defaultOptions, upload.options))
        },

        //设置最大下载尺寸
        setMaxSize: function(size) {
            if (!upload.container) return false
            upload.container.pluploadQueue().settings.max_file_size = size
        },

        //初始化
        __initPlUpload: function(options) {

            var self = upload
            options.init = {
                FilesAdded: function(up, files) {
                    debugger
                    if (!options.canUploadFile()) {
                        //jquery.plupload.quere.js b绑定了 FilesAdded 这个时候文件已经存在了，所以 要删除
                        App.isUploading = false;
                        alert("请选择要上传的文件夹");
                        return;
                    } else {
                        App.isUploading = true;
                    } 
                    // quota info in the right bottom corner
                    if (options.getQuotaInfo) {
                        self.container.find('.quota-tip-info').text(options.getQuotaInfo())
                    }
                    self.__showUploadModal()
                    self.container.removeClass('uploaded-completed')
                    var parentId = options.getParentId() || ''
                    if (isSafari) {
                        //safari 5.1.7's File API not support slice method, so can not upload part of the file - 2012.11.28
                        $.each(files, function(idx, file) {
                            file.uploadedBytes = 0
                            file.parentId = parentId
                        })
                    } else {
                        $.each(files, function(idx, file) {
                            file.parentId = parentId
                        })
                    }
                    up.start()
                },
                BeforeUpload: function(up, file) {
                    if (options.getUploadedBytesUrl && (file.size > options.skipCheckSize && typeof file.uploadedBytes === 'undefined')) {
                       
                        up.stop()
                        $.getJSON(options.getUploadedBytesUrl(file.parentId), {
                            name: file.name,
                            size: file.size
                        }, function(data) {
                            file.uploadedBytes = 0
                            up.start()
                        })
                    } else {
                      
                        var fn =file.fullPath || file.name
                        up.settings.multipart_params = {
                            fileId: file.parentId,
                            fileName: fn,
                            size: file.size
                                // position: file.uploadedBytes || 0
                        }
                        up.settings.uploaded_bytes = file.uploadedBytes || 0
                        if (options.getUploadUrl) {
                            up.settings.url = options.getUploadUrl(file)
                        }
                    }
                },
                UploadFile: function(up, file) {
                    isUploading = true;
                },
                FileUploaded: function(up, file, response) {
                     
                    try {
                        options.fileUploaded(response, file)
                    } catch (e) {
                        //todo
                    }
                },
                UploadComplete: function(up, file) {
                     
                    isUploading = false
                    self.container.addClass('uploaded-completed')
                    if (options.fileUploadCompleted) {
                        options.fileUploadCompleted(up)
                    }
                },
                FilesRemoved: function(up, files) {
                    if (up.files.length === 0) {
                        isUploading = false
                        self.container.addClass('uploaded-completed')
                    }
                },
                Error: function(up, file) {

                    if (file.code === -500) {
                        //upload initialize error, todo
                        return
                    }
                    if (file.code === 4 || file.code === -200) {
                        options.uploadError && options.uploadError(file)
                    }
                },
                Init: function(up) {

                    if (options.draggable && !isSafari && up.features.dragdrop) {
                        //add dragdrop tip
                        var tip = '可以把文件直接拖到浏览器中进行上传'
                        self.container.append($('<div>', {
                            'class': 'plupload dragdrop-tip',
                            title: tip,
                            text: tip
                        }))
                    }
                    if (up.runtime === 'flash') {
                        up.settings.url += '&result=String'
                    }
                }
            }

            //是否可以上传文件夹
            if (supportDirectory() && options.directory && options.runtimes !== 'flash') {
                var buttonsIds = self.__initDirectoryUpload(options)
                options.directoryUpload = true
                options.browse_button = buttonsIds.browseButtonId
                options.browse_dir_button = buttonsIds.browseDirButtonId
            }

            self.container.pluploadQueue(options)
                //关闭弹出层
            self.container.append($('<div>', {
                'class': 'plupload plupload-icon-remove',
                title: '关闭',
                click: function(e) {
                    e.stopPropagation()
                    self.__hideUploadModal()
                    if (options.onHideUploadModal) {
                        options.onHideUploadModal()
                    }
                    return false
                }
            }))

            //最小化弹出层
            self.container.append($('<div>', {
                'class': 'plupload plupload-icon-minus',
                title: '最小化窗口',
                click: function(e) {
                    self.__toggleUploadModal()
                    return false
                }
            }))

            // 存在 容量
            if (options.getQuotaInfo) {
                self.container.append($('<div>', {
                    'class': 'plupload quota-tip-info'
                }))
            }

            //拖拽移动上传的弹出层
            if (options.draggable && self.container.draggable) {
                self.container.draggable({
                    axis: 'x',
                    containment: 'window',
                    handle: '.plupload_header'
                }); 

            }

            //双击头部收起展开
            self.container.find('.plupload_header').dblclick(function() {
                self.__toggleUploadModal()
            })


            // drag and drop upload 是否可以拖拽上传 仅仅 H5
            if (options.dragAndDropUpload && supportDragdrop) {
                $(document.body).append(drapAndDropPH)
                var dragArea = $(document.body)
                dragArea.bind('drop.upload', function(e) {
                    dragArea.removeClass('dragupload-drag-over')
                    if (!options.canUploadFile()) {
                        alert("请选择要上传的文件夹");
                        return false;
                    } 
                    App.isUploading = true;
                   
                    if (!e.originalEvent.dataTransfer) return
                    var files = e.originalEvent.dataTransfer.files,
                        items = e.originalEvent.dataTransfer.items 
                    if (items) {
                        var allFiles = []
                        for (var i = 0; i < items.length; i++) {
                            if (items[i].kind !== 'file') continue
                            self.__showUploadModal()
                            var entry = items[i].webkitGetAsEntry()
                            if (entry.isFile) {
                                self.__readFile(entry, function(file) {
                                    allFiles.push(file)
                                })
                            } else if (entry.isDirectory) {
                                self.__showUploadModal()
                                var a = 1
                                self.__traverseDirectory(entry, function(file) {
                                    allFiles.push(file)
                                })
                            }
                        }
                        var time = 500
                        var fileNum = 0
                        var fileTimer = setTimeout(function() {
                            if (allFiles.length > fileNum) {
                                fileNum = allFiles.length
                                fileTimer = setTimeout(arguments.callee, time)
                            } else {
                                clearTimeout(fileTimer)
                                self.__addFiles(allFiles)
                            }
                        }, time)
                    } else {
                        if (files.length > 0) {
                            self.__showUploadModal()
                            self.__addFiles(files)
                        }
                    }
                    return false
                })
                dragArea.bind('dragenter.upload dragover.upload', function(e) {

                    if (dragArea.find(e.target).length === 1) { //&& options.canUploadFile()
                        dragArea.addClass('dragupload-drag-over')
                        return false
                    }


                })
                dragArea.bind('dragleave.upload', function(e) {
                    dragArea.removeClass('dragupload-drag-over')
                })
                $(window).on('beforeunload.upload', function() {
                    if (isUploading) {
                        return '有文件还未上传完成，确定要离开吗？'
                    }
                })
            }
        },

        //显示上传谈层
        __showUploadModal: function() {
            upload.container.css({
                bottom: 0
            }).show()
            $(".plupload-icon-minus").css({
                "background-position-x": -14
            }).attr({
                "title": "最小化窗口"
            })
        },

        //隐藏上传弹出层
        __hideUploadModal: function() {
            upload.container.animate({
                bottom: -382
            }, function() {
                $(this).hide()
                upload.container.pluploadQueue().reset()
            })
        },

        // 切换 最大化 最小化
        __toggleUploadModal: function() {
            //设置top bottom 无效
            upload.container.css("top","auto");
            if (upload.container.css('bottom') === '-382px') {
                upload.container.animate({
                    bottom: 0
                })
                $(".plupload-icon-minus").css({
                    "background-position-x": -14
                }).attr({
                    "title": "最小化窗口"
                })
            } else {
                upload.container.animate({
                    bottom: -382
                })
                $(".plupload-icon-minus").css({
                    "background-position": 0
                }).attr({
                    "title": "最大化窗口"
                })
            }
        },

        //遍历文件夹目录
        __traverseDirectory: function(entry, callback) {  
            if (entry.isFile) {
                upload.__readFile(entry, callback)
            } else if (entry.isDirectory) {
                var dirReader = entry.createReader()
                dirReader.readEntries(function(entries) {
                    var el = entries.length
                    while (el--) {
                        upload.__traverseDirectory(entries[el], callback)
                    }
                })
            }
        },

        //读取文件
        __readFile: function(fileEntry, callback) {
             
            fileEntry.file(function(file) {
                file.fullPath = fileEntry.fullPath
                callback && callback(file)
            })
        },

        //将文件添加到队列
        __addFiles: function(files) {

            upload.container.pluploadQueue().addFiles(files)
        },

        //初始化文件夹上传
        __initDirectoryUpload: function(options) { 
            var uploadButton = $('#' + options.browse_button)
            var uploadButtons = $('<div class="upload-dropdown-buttons">' +
                '<ul>' +
                '   <li class="upload-file-btn" id="html5-uploadfile-btn"><em class="sicon-file"></em>&nbsp;&nbsp;文件</li>' +
                '   <li class="upload-dir-btn" id="html5-uploaddir-btn"><em class="sicon-sfolder"></em>&nbsp;&nbsp;文件夹</li>' +
                '</ul></div>')
            options.browse_button = 'html5-uploadfile-btn'
            options.browse_dir_button = 'html5-uploaddir-btn'
            $(uploadButtons).appendTo(document.body)
            uploadButton.click(function(e) {
                //灰色按钮点击无效
                if($(e.currentTarget).is('.disable')){
                    return
                }
                var p = $(this).offset()
                uploadButtons.css({
                    top: p.top + $(this).height() + 18,
                    left: p.left
                }).show()
                $(document).one('click.hideuploaddropdown', function() {
                    uploadButtons.hide()
                })
                return false
            })
            return {
                browseButtonId: 'html5-uploadfile-btn',
                browseDirButtonId: 'html5-uploaddir-btn'
            }
        }
    }

    //拖拽定义
    var drapAndDropPH = '' +
        '<div class="drag-helper-view-top"></div>' +
        '<div class="drag-helper-view-right"></div>' +
        '<div class="drag-helper-view-bottom"></div>' +
        '<div class="drag-helper-view-left"></div>'

    // export public method
    App.Comm.upload = {
        init: upload.init,
        setMaxSize: upload.setMaxSize,
        //获取上传实例
        getUploadInstance: function() {
            if (!upload.container) return {}
            return upload.container.pluploadQueue()
        },
        //设置配置信息 右下角
        setQuotaInfo: function(text) {
            if (!upload.container) return null
            upload.container.find('.quota-tip-info').text(text)
        },
        //销毁
        destroy: function() {

            if (!upload.container) return null;
            upload.container.pluploadQueue().trigger('Destroy');
            $(".mod-plupload,.plupload,.upload-dropdown-buttons,.drag-helper-view-top,.drag-helper-view-right,.drag-helper-view-bottom,.drag-helper-view-left").remove();
            $(document.body).unbind(".upload");
            upload.container = undefined;
        }
    }

})(jQuery);
;/*!/comm/pluging/jqueryPluploadQueue/jquery.plupload.queue.js*/
/**
 * jquery.plupload.queue.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

// JSLint defined globals
/*global plupload:false, jQuery:false, alert:false */

/**
 * @require /libs/jquery-1.12.0.min.js
 */


;
(function($) {
    var uploaders = {};

    var formatSize = function(size) {
        if (size === undefined || /\D/.test(size)) {
            return 'N/A';
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

    function _(str) {
        return plupload.translate(str) || str;
    }

    function renderUI(id, target) {
        // Remove all existing non plupload items
        target.contents().each(function(i, node) {
            node = $(node);
            if (!node.is('.plupload')) {
                node.remove();
            }
        });
        target.prepend(
            '<div class="plupload_wrapper plupload_scroll">' +
            '   <div id="' + id + '_container" class="plupload_container">' +
            '      <div class="plupload">' +
            '           <div class="plupload_header">' +
            '               <div class="plupload_header_content">' +
            '                   <em class="plupload-icon-arrow-up"></em>' +
            '                   <div class="plupload_header_title"><span class="plupload_status_title">' + _('Start upload') + '</span><span class="plupload_status_text"></span></div>' +
            '               </div>' +
            '           </div>' +
            '           <div class="plupload_content">' +
            '               <div class="plupload_filelist_header">' +
            '                   <div class="pl-na">' + _('Filename') + '</div>' +
            '                   <div class="pl-ac">&nbsp;</div>' +
            '                   <div class="pl-st"><span>' + _('Status') + '</span></div>' +
            '                   <div class="pl-si">' + _('Size') + '</div>' +
            '                   <div class="plupload_clearer">&nbsp;</div>' +
            '               </div>' +
            '               <ul id="' + id + '_filelist" class="plupload_filelist"></ul>' +
            '               <div class="plupload_filelist_footer"></div>' +
            '           </div>' +
            '       </div>' +
            '   </div>' +
            '   <input type="hidden" id="' + id + '_count" name="' + id + '_count" value="0" />' +
            '</div>'
        );
    }

    $.fn.pluploadQueue = function(settings) {
        if (settings) {
            this.each(function() {
                var uploader, target, id;
                target = $(this);
                id = target.attr('id');
                if (!id) {
                    id = plupload.guid();
                    target.attr('id', id);
                }
                uploader = new plupload.Uploader($.extend({
                    dragdrop: true
                }, settings));
                uploaders[id] = uploader;

                function handleStatus(file) {
                    var actionClass;
                    if (file.status == plupload.DONE) {
                        actionClass = 'plupload_done';
                    } else if (file.percent == 100) {
                        actionClass = 'plupload_complete_handling';
                    } else {
                        if (file.status == plupload.FAILED) {
                            actionClass = 'plupload_failed';
                        }
                        if (file.status == plupload.QUEUED) {
                            actionClass = 'plupload_delete';
                        }
                        if (file.status == plupload.UPLOADING) {
                            actionClass = 'pl_up';
                        }
                    }
                    actionClass += ' clr';
                    var icon = $('#' + file.id).attr('class', actionClass).find('a');
                    if (file.hint) {
                        icon.attr('title', file.hint);
                    }
                }

                function changeStatus() {
                    var statusTitle,
                        statusText;
                    if (uploader.total.uploaded === uploader.files.length) {
                        statusTitle = _("Upload Complete");
                        statusText = '';
                    } else {
                        statusTitle = _('Start upload');
                        if (uploader.files.length === 1) {
                            statusText = ' (' + uploader.total.percent + '%)';
                        } else {
                            statusText = _('Uploaded %d/%d files').replace(/%d\/%d/, uploader.total.uploaded + '/' + uploader.files.length) + ' (' + uploader.total.percent + '%)';
                        }
                    }
                    $('span.plupload_status_title', target).text(statusTitle);
                    $('span.plupload_status_text', target).text(statusText).show();
                }
                //exports for custom use
                uploader.reset = function() {
                    for (i = 0; i < uploader.files.length; i++) {
                        $('#' + uploader.files[i].id).remove();
                    }
                    uploader.splice();
                }

                function updateList(files) {
                    var fileList = $('ul.plupload_filelist', target);
                    var htmlStr = '';
                    $.each(files, function(i, file) {
                        htmlStr += '<li id="' + file.id + '" class="clr pl_up">' +
                            '<div class="pl-na">' + file.name + '</div>' +
                            '<div class="pl-ac"><a title="取消" href="javascript:;"></a></div>' +
                            '<div class="pl-st">0%</div>' +
                            '<div class="pl-si">' + formatSize(file.size) + '</div></li>';
                    });
                    fileList[0].innerHTML += htmlStr;
                    // scroll to end of file list
                    fileList[0].scrollTop = fileList[0].scrollHeight;
                    changeStatus();
                }

                function bindEvent() {
                    //delegate event
                    $('ul.plupload_filelist', target).delegate('.pl-ac a', 'click', function() {
                        var row = $(this).parent().parent();
                        if (row.is('.plupload_done') || row.is('.plupload_complete_handling')) {
                            return false;
                        }
                        var fileId = row.attr('id');
                        var file = uploader.getFile(fileId);
                        if (file.status === plupload.UPLOADING) {
                            uploader.stop();
                        }
                        if(file.status===plupload.FAILED){
                            $('#' + fileId).remove();
                            uploader.removeFile(file);
                            file.id=new Date().getTime();
                            uploader.addFiles([uploader.getNativeFiles()[fileId]]);
                            return false;
                        }
                        $('#' + fileId).remove();
                        uploader.removeFile(file);
                        changeStatus();
                        return false;
                    });
                }
                uploader.bind("UploadFile", function(up, file) {
                    $('#' + file.id).addClass('plupload_current_file');
                });
                uploader.bind("UploadComplete", function(up, file) {
                    if (up.runtime === 'flash') {
                        up.trigger('Refresh');
                    }
                    $('span.plupload_status_title', target).text(_("Upload Complete"));
                });
                uploader.bind('Init', function(up, res) {
                    renderUI(id, target);
                    bindEvent();
                });
                uploader.init();
                uploader.bind("Error", function(up, err) {
                    var file = err.file,
                        message;
                    if (file) {
                        message = err.message;
                        if (err.details) {
                            message += " (" + err.details + ")";
                        }
                        if (err.code == plupload.FILE_SIZE_ERROR) {
                            if (file.size > up.settings.max_file_size) {
                                alert(_("Error: File too large: ") + file.name);
                            } else {
                                alert(_("Quota exceed error"));
                            }
                        }
                        if (err.code == plupload.FILE_EXTENSION_ERROR) {
                            alert(_("Error: Invalid file extension: ") + file.name);
                        }
                        file.hint = message;
                        $('#' + file.id).attr('class', 'plupload_failed clr').find('a').css('display', 'block').attr('title', message)
                            .end().find('.pl-st').text('0%');
                        file.percent = 0;
                    }
                });
                uploader.bind('StateChanged', function() {
                    
                    if (uploader.state === plupload.STARTED) {
                        changeStatus();
                    }
                });
                uploader.bind('FilesAdded', function(up, files) {
                    //改参数在 com.upload.js 中
                    if (App.isUploading) {
                        var d = new Date();
                        updateList(files);
                    }else{
                        //删除最后一个
                        uploader.files.pop();
                    }

                });
                uploader.bind('FileUploaded', function(up, file) {
                    file.hint = _('Upload Success');
                    handleStatus(file);
                });
                uploader.bind("UploadProgress", function(up, file) {
                    // Set file specific progress
                    $('#' + file.id + ' div.pl-st', target).text(file.percent + '%');
                    if (file.percent === 100) {
                        file.hint = _('Upload Complete Handling');
                    }
                    handleStatus(file);
                    changeStatus();
                });
                // Call setup function
                if (settings.setup) {
                    settings.setup(uploader);
                }
            });
            return this;
        } else {
            // Get uploader instance for specified element
            return uploaders[$(this[0]).attr('id')];
        }
    };

})(jQuery);
;/*!/comm/pluging/lightbox/js/lightbox.js*/
/*!
 * Lightbox v2.8.2
 * by Lokesh Dhakar
 *
 * More info:
 * http://lokeshdhakar.com/projects/lightbox2/
 *
 * Copyright 2007, 2015 Lokesh Dhakar
 * Released under the MIT license
 * https://github.com/lokesh/lightbox2/blob/master/LICENSE
 */

// Uses Node, AMD or browser globals to create a module.
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals (root is window)
        root.lightbox = factory(root.jQuery);
    }
}(this, function ($) {

  function Lightbox(options) {
    this.album = [];
    this.currentImageIndex = void 0;
    this.init();

    // options
    this.options = $.extend({}, this.constructor.defaults);
    this.option(options);
  }

  // Descriptions of all options available on the demo site:
  // http://lokeshdhakar.com/projects/lightbox2/index.html#options
  Lightbox.defaults = {
    albumLabel: 'Image %1 of %2',
    alwaysShowNavOnTouchDevices: false,
    fadeDuration: 500,
    fitImagesInViewport: true,
    // maxWidth: 800,
    // maxHeight: 600,
    positionFromTop: 50,
    resizeDuration: 700,
    showImageNumberLabel: true,
    wrapAround: false,
    disableScrolling: false
  };

  Lightbox.prototype.option = function(options) {
    $.extend(this.options, options);
  };

  Lightbox.prototype.imageCountLabel = function(currentImageNum, totalImages) {
    return this.options.albumLabel.replace(/%1/g, currentImageNum).replace(/%2/g, totalImages);
  };

  Lightbox.prototype.init = function() {
    this.enable();
    this.build();
  };

  // Loop through anchors and areamaps looking for either data-lightbox attributes or rel attributes
  // that contain 'lightbox'. When these are clicked, start lightbox.
  Lightbox.prototype.enable = function() {
    var self = this;
    $('body').on('click', 'a[rel^=lightbox], area[rel^=lightbox], a[data-lightbox], area[data-lightbox]', function(event) {
      self.start($(event.currentTarget));
      return false;
    });
  };

  // Build html for the lightbox and the overlay.
  // Attach event handlers to the new DOM elements. click click click
  Lightbox.prototype.build = function() {
    var self = this;
    //$('<div id="lightboxOverlay" class="lightboxOverlay"></div><div id="lightbox" class="lightbox"><div class="lb-outerContainer"><div class="lb-container"><img class="lb-image" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" /><div class="lb-nav"><a class="lb-prev" href="" ></a><a class="lb-next" href="" ></a></div><div class="lb-loader"><a class="lb-cancel"></a></div></div></div><div class="lb-dataContainer"><div class="lb-data"><div class="lb-details"><span class="lb-caption"></span></div><div class="lb-closeContainer"><span class="downloadImg">下载</span> <a class="lb-close"></a></div></div></div></div>').appendTo($('body'));
    $('<div id="lightboxOverlay" class="lightboxOverlay"></div><div id="lightbox" class="lightbox"><div class="lb-outerContainer"><div class="lb-container"><img class="lb-image" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" /><div class="lb-nav"></div><div class="lb-loader"><a class="lb-cancel"></a></div></div></div><div class="lb-dataContainer"><div class="lb-data"><div class="lb-details"><span class="lb-caption"></span></div><div class="lb-closeContainer"><span class="downloadImg">下载</span> <a class="lb-close"></a></div></div></div></div>').appendTo($('body'));

    // Cache jQuery objects
    this.$lightbox       = $('#lightbox');
    this.$overlay        = $('#lightboxOverlay');
    this.$outerContainer = this.$lightbox.find('.lb-outerContainer');
    this.$container      = this.$lightbox.find('.lb-container');

    // Store css values for future lookup
    this.containerTopPadding = parseInt(this.$container.css('padding-top'), 10);
    this.containerRightPadding = parseInt(this.$container.css('padding-right'), 10);
    this.containerBottomPadding = parseInt(this.$container.css('padding-bottom'), 10);
    this.containerLeftPadding = parseInt(this.$container.css('padding-left'), 10);

    // Attach event handlers to the newly minted DOM elements
    this.$overlay.hide().on('click', function() {
      self.end();
      return false;
    });

    this.$lightbox.hide().on('click', function(event) {
      if ($(event.target).attr('id') === 'lightbox') {
        self.end();
      }
      return false;
    });

    this.$outerContainer.on('click', function(event) {
      if ($(event.target).attr('id') === 'lightbox') {
        self.end();
      }
      return false;
    });

    //this.$lightbox.find('.lb-prev').on('click', function() {
    //  if (self.currentImageIndex === 0) {
    //    self.changeImage(self.album.length - 1);
    //  } else {
    //    self.changeImage(self.currentImageIndex - 1);
    //  }
    //  return false;
    //});
    //
    //this.$lightbox.find('.lb-next').on('click', function() {
    //  if (self.currentImageIndex === self.album.length - 1) {
    //    self.changeImage(0);
    //  } else {
    //    self.changeImage(self.currentImageIndex + 1);
    //  }
    //  return false;
    //});

    this.$lightbox.find('.lb-loader, .lb-close').on('click', function() {
      self.end();
      return false;
    });

    this.$lightbox.find('.lb-loader, .downloadImg').on('click', function(event) {
          window.location.href=$(event.target).closest("#lightbox").find("img.lb-image").prop("src");
    }); 
  };

  // Show overlay and lightbox. If the image is part of a set, add siblings to album array.
  Lightbox.prototype.start = function($link) {
    var self    = this;
    var $window = $(window);

    $window.on('resize', $.proxy(this.sizeOverlay, this));

    $('select, object, embed').css({
      visibility: 'hidden'
    });

    this.sizeOverlay();

    this.album = [];
    var imageNumber = 0;

    function addToAlbum($link) {
      self.album.push({
        link: $link.attr('href'),
        title: $link.attr('data-title') || $link.attr('title')
      });
    }

    // Support both data-lightbox attribute and rel attribute implementations
    var dataLightboxValue = $link.attr('data-lightbox');
    var $links;

    if (dataLightboxValue) {
      $links = $($link.prop('tagName') + '[data-lightbox="' + dataLightboxValue + '"]');
      for (var i = 0; i < $links.length; i = ++i) {
        addToAlbum($($links[i]));
        if ($links[i] === $link[0]) {
          imageNumber = i;
        }
      }
    } else {
      if ($link.attr('rel') === 'lightbox') {
        // If image is not part of a set
        addToAlbum($link);
      } else {
        // If image is part of a set
        $links = $($link.prop('tagName') + '[rel="' + $link.attr('rel') + '"]');
        for (var j = 0; j < $links.length; j = ++j) {
          addToAlbum($($links[j]));
          if ($links[j] === $link[0]) {
            imageNumber = j;
          }
        }
      }
    }

    // Position Lightbox
    var top  = $window.scrollTop() + this.options.positionFromTop;
    var left = $window.scrollLeft();
    this.$lightbox.css({
      top: top + 'px',
      left: left + 'px'
    }).fadeIn(this.options.fadeDuration);

    // Disable scrolling of the page while open
    if (this.options.disableScrolling) {
      $('body').addClass('lb-disable-scrolling');
    }

    this.changeImage(imageNumber);
  };

  // Hide most UI elements in preparation for the animated resizing of the lightbox.
  Lightbox.prototype.changeImage = function(imageNumber) {
    var self = this;

    this.disableKeyboardNav();
    var $image = this.$lightbox.find('.lb-image');

    this.$overlay.fadeIn(this.options.fadeDuration);

    $('.lb-loader').fadeIn('slow');
    this.$lightbox.find('.lb-image, .lb-nav, .lb-prev, .lb-next, .lb-dataContainer, .lb-numbers, .lb-caption').hide();

    this.$outerContainer.addClass('animating');

    // When image to show is preloaded, we send the width and height to sizeContainer()
    var preloader = new Image();
    preloader.onload = function() {
      var $preloader;
      var imageHeight;
      var imageWidth;
      var maxImageHeight;
      var maxImageWidth;
      var windowHeight;
      var windowWidth;

      $image.attr('src', self.album[imageNumber].link);

      $preloader = $(preloader);

      $image.width(preloader.width);
      $image.height(preloader.height);

      if (self.options.fitImagesInViewport) {
        // Fit image inside the viewport.
        // Take into account the border around the image and an additional 10px gutter on each side.

        windowWidth    = $(window).width();
        windowHeight   = $(window).height();
        maxImageWidth  = windowWidth - self.containerLeftPadding - self.containerRightPadding - 20;
        maxImageHeight = windowHeight - self.containerTopPadding - self.containerBottomPadding - 120;

        // Check if image size is larger then maxWidth|maxHeight in settings
        if (self.options.maxWidth && self.options.maxWidth < maxImageWidth) {
          maxImageWidth = self.options.maxWidth;
        }
        if (self.options.maxHeight && self.options.maxHeight < maxImageWidth) {
          maxImageHeight = self.options.maxHeight;
        }

        // Is there a fitting issue?
        if ((preloader.width > maxImageWidth) || (preloader.height > maxImageHeight)) {
          if ((preloader.width / maxImageWidth) > (preloader.height / maxImageHeight)) {
            imageWidth  = maxImageWidth;
            imageHeight = parseInt(preloader.height / (preloader.width / imageWidth), 10);
            $image.width(imageWidth);
            $image.height(imageHeight);
          } else {
            imageHeight = maxImageHeight;
            imageWidth = parseInt(preloader.width / (preloader.height / imageHeight), 10);
            $image.width(imageWidth);
            $image.height(imageHeight);
          }
        }
      }
      self.sizeContainer($image.width(), $image.height());
    };

    preloader.src          = this.album[imageNumber].link;
    this.currentImageIndex = imageNumber;
  };

  // Stretch overlay to fit the viewport
  Lightbox.prototype.sizeOverlay = function() {
    this.$overlay
      .width($(document).width())
      .height($(document).height());
  };

  // Animate the size of the lightbox to fit the image we are showing
  Lightbox.prototype.sizeContainer = function(imageWidth, imageHeight) {
    var self = this;

    var oldWidth  = this.$outerContainer.outerWidth();
    var oldHeight = this.$outerContainer.outerHeight();
    var newWidth  = imageWidth + this.containerLeftPadding + this.containerRightPadding;
    var newHeight = imageHeight + this.containerTopPadding + this.containerBottomPadding;

    function postResize() {
      self.$lightbox.find('.lb-dataContainer').width(newWidth);
      self.$lightbox.find('.lb-prevLink').height(newHeight);
      self.$lightbox.find('.lb-nextLink').height(newHeight);
      self.showImage();
    }

    if (oldWidth !== newWidth || oldHeight !== newHeight) {
      this.$outerContainer.animate({
        width: newWidth,
        height: newHeight
      }, this.options.resizeDuration, 'swing', function() {
        postResize();
      });
    } else {
      postResize();
    }
  };

  // Display the image and its details and begin preload neighboring images.
  Lightbox.prototype.showImage = function() {
    this.$lightbox.find('.lb-loader').stop(true).hide();
    this.$lightbox.find('.lb-image').fadeIn('slow');

    this.updateNav();
    this.updateDetails();
    this.preloadNeighboringImages();
    this.enableKeyboardNav();
  };

  // Display previous and next navigation if appropriate.
  Lightbox.prototype.updateNav = function() {
    // Check to see if the browser supports touch events. If so, we take the conservative approach
    // and assume that mouse hover events are not supported and always show prev/next navigation
    // arrows in image sets.
    var alwaysShowNav = false;
    try {
      document.createEvent('TouchEvent');
      alwaysShowNav = (this.options.alwaysShowNavOnTouchDevices) ? true : false;
    } catch (e) {}

    this.$lightbox.find('.lb-nav').show();

    if (this.album.length > 1) {
      if (this.options.wrapAround) {
        if (alwaysShowNav) {
          this.$lightbox.find('.lb-prev, .lb-next').css('opacity', '1');
        }
        this.$lightbox.find('.lb-prev, .lb-next').show();
      } else {
        if (this.currentImageIndex > 0) {
          this.$lightbox.find('.lb-prev').show();
          if (alwaysShowNav) {
            this.$lightbox.find('.lb-prev').css('opacity', '1');
          }
        }
        if (this.currentImageIndex < this.album.length - 1) {
          this.$lightbox.find('.lb-next').show();
          if (alwaysShowNav) {
            this.$lightbox.find('.lb-next').css('opacity', '1');
          }
        }
      }
    }
  };

  // Display caption, image number, and closing button.
  Lightbox.prototype.updateDetails = function() {
    var self = this;

    // Enable anchor clicks in the injected caption html.
    // Thanks Nate Wright for the fix. @https://github.com/NateWr
    if (typeof this.album[this.currentImageIndex].title !== 'undefined' &&
      this.album[this.currentImageIndex].title !== '') {
      this.$lightbox.find('.lb-caption')
        .html(this.album[this.currentImageIndex].title)
        .fadeIn('fast')
        .find('a').on('click', function(event) {
          if ($(this).attr('target') !== undefined) {
            window.open($(this).attr('href'), $(this).attr('target'));
          } else {
            location.href = $(this).attr('href');
          }
        });
    }

    if (this.album.length > 1 && this.options.showImageNumberLabel) {
      var labelText = this.imageCountLabel(this.currentImageIndex + 1, this.album.length);
      this.$lightbox.find('.lb-number').text(labelText).fadeIn('fast');
    } else {
      this.$lightbox.find('.lb-number').hide();
    }

    this.$outerContainer.removeClass('animating');

    this.$lightbox.find('.lb-dataContainer').fadeIn(this.options.resizeDuration, function() {
      return self.sizeOverlay();
    });
  };

  // Preload previous and next images in set.
  Lightbox.prototype.preloadNeighboringImages = function() {
    if (this.album.length > this.currentImageIndex + 1) {
      var preloadNext = new Image();
      preloadNext.src = this.album[this.currentImageIndex + 1].link;
    }
    if (this.currentImageIndex > 0) {
      var preloadPrev = new Image();
      preloadPrev.src = this.album[this.currentImageIndex - 1].link;
    }
  };

  Lightbox.prototype.enableKeyboardNav = function() {
    $(document).on('keyup.keyboard', $.proxy(this.keyboardAction, this));
  };

  Lightbox.prototype.disableKeyboardNav = function() {
    $(document).off('.keyboard');
  };

  Lightbox.prototype.keyboardAction = function(event) {
    var KEYCODE_ESC        = 27;
    var KEYCODE_LEFTARROW  = 37;
    var KEYCODE_RIGHTARROW = 39;

    var keycode = event.keyCode;
    var key     = String.fromCharCode(keycode).toLowerCase();
    if (keycode === KEYCODE_ESC || key.match(/x|o|c/)) {
      this.end();
    } else if (key === 'p' || keycode === KEYCODE_LEFTARROW) {
      if (this.currentImageIndex !== 0) {
        this.changeImage(this.currentImageIndex - 1);
      } else if (this.options.wrapAround && this.album.length > 1) {
        this.changeImage(this.album.length - 1);
      }
    } else if (key === 'n' || keycode === KEYCODE_RIGHTARROW) {
      if (this.currentImageIndex !== this.album.length - 1) {
        this.changeImage(this.currentImageIndex + 1);
      } else if (this.options.wrapAround && this.album.length > 1) {
        this.changeImage(0);
      }
    }
  };

  // Closing time. :-(
  Lightbox.prototype.end = function() {
    this.disableKeyboardNav();
    $(window).off('resize', this.sizeOverlay);
    this.$lightbox.fadeOut(this.options.fadeDuration);
    this.$overlay.fadeOut(this.options.fadeDuration);
    $('select, object, embed').css({
      visibility: 'visible'
    });
    if (this.options.disableScrolling) {
      $('body').removeClass('lb-disable-scrolling');
    }
  };

  return new Lightbox();
}));

;/*!/comm/pluging/mmhMask/jquery.mmhmask.js*/
(function(win, $) {

	var _style = {
		background: '#FFF',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex:99999,
		filter:'alpha(opacity=80)',
		opacity:0.8
	}

	var _imgStyle = {
		position: 'absolute',
		top: '50%',
		left: '50%',
		marginLeft: '-12px',
		marginTop: '-12px'
	}
	var _mmhMask=null;
	$.fn.mmhMask = function() {
		var $this = $(this);
		_mmhMask =_mmhMask||createMask();
		$this.append(_mmhMask)
		return _mmhMask;
	}
	
	win.clearMask=function(){
		_mmhMask&&_mmhMask.remove();
	}

	function createMask() {
		var $div = $('<div/>'),
			$img = $('<img/>').attr('src', 'data:image/gif;base64,R0lGODlhGAAYAOZ/AMvY6P7+/8zZ6Ozx9/7+/vv8/eXs9P3+/urv9oew3vz9/sza6d7m8Njh7vb4+83Z6d/m8d/n8dbg7eTr84Wv3vr8/c/b6tzl7+Do8ePq8/j6/OTq89Xg7N/o8ePp8vr7/erv9env9tvk7/7//+/z+PP2+vf5/P39/oKt3f////L1+YGs3NLe6/z8/tnj79Dc6s/a6e7y+PD0+PD0+evv9vX4+9Hc6tLd69Hh8vH1+cDW7rDL6a7K6cvd8crc8Pv8/oOu3vb5/Z6/5H+r3PT4/Ju9473U7drn9fP3/Pj6/fv9/qXE57nR7Onx+fr8/oOu3fX4/Pn6/Pf6/bLM6rPN6rrR7O70+rvT7IGs3Yy04P3+/93p9pq944mx3+jw+ZC34Ymy36nH54204Nfl9M3e8fX5/N7p9ufv+NXk9PDz+KrH6L7U7aTD5uDr95m949jm9Mze8d7n8Iix3pC24evy+oav3oSu3dLh8+zy+vn7/fT2+uHr94Cs3M3a6c7a6f///yH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDplNTNiZDhmMC0zZDU3LTRiN2EtOWMzMy1kZjMyNDgxN2UwODQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NDlCRjVGRkEwRjVFMTFFNkFDRTdGQ0FGNTFENTAwMjIiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NDlCRjVGRjkwRjVFMTFFNkFDRTdGQ0FGNTFENTAwMjIiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MmMxMDY2MGEtYTcxNC04ZDRkLTgwMTctNTk3ZjJlNTA1YjlhIiBzdFJlZjpkb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6MWE5MmY2MjEtNTI2NS0xMTc5LTg1NWItODNmOWE0YWNmOWRmIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Af/+/fz7+vn49/b19PPy8fDv7u3s6+rp6Ofm5eTj4uHg397d3Nva2djX1tXU09LR0M/OzczLysnIx8bFxMPCwcC/vr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoGAf359fHt6eXh3dnV0c3JxcG9ubWxramloZ2ZlZGNiYWBfXl1cW1pZWFdWVVRTUlFQT05NTEtKSUhHRkVEQ0JBQD8+PTw7Ojk4NzY1NDMyMTAvLi0sKyopKCcmJSQjIiEgHx4dHBsaGRgXFhUUExIREA8ODQwLCgkIBwYFBAMCAQAAIfkEBQoAfwAsAAAAABgAGAAAB+iAf4KDgwUXMB0EhIuMhBt+fn00jY1QRIMSkH0Mgx8tlEZ2WDsBfwZ9fQsDfwciAH4hjFB8CQkreH8BIBCrfzkCkBaKhERDtStNjTLAkAeLATsrK2wKjQocAAATlHRNpZQEDhqU5OWCBRsNBt/mChnqpReaCOaCHvN/kJGc9Zn7fx1QqapnSuAqAgh4Ecy1q9dCggFUzDhBrgCJEo0CiBAggIMzRgVYcMTA6MMrPwBqNCLB7MHHQg8gARjnDt6fEsxsDCMU4oWFbX/uRaIXAIOfGzHAvfS3adCBneZOpXL4MBeCCFSrPgwEACH5BAUKAH8ALAIAAAAOAAgAAAdHgH+Cg39BanJTSoSLVwkJFGSEBRWDRY4UPIMTDwIRKX86FBRAOIIFAH5+ABp/Cj47pX8qFaiqDouDKREAAC4EuIQmDiPAgoEAIfkEBQoAfwAsBwAAAA4ACAAAB0qAf38FFzAdBIKJiht+fn00ipESjX1xiUhSgiN/Bn19CwN/P0tDCT5/Jn8BIBChf1soCQldCpGJR7EJdT+2glJuKytGvYkKXlaCgQAh+QQFCgB/ACwNAAIACgAOAAAHSoAMf4MfLYOHfwciAH4hiH85An5+FgSIMpKTB4gKHAAAE49/BA5RoqeiSVVCOgqPTAkJFD2PRbEUPI86FBRAd48KPjs4qKdpeoiBACH5BAUKAH8ALA8ABwAIAA4AAAdHgH+CGoKFhod/ChkNBgGFHn5+fQiFEpF9DIUGfX0LA4UBIBCfiIVlb3uGRF8oKFSFYygJCU8/gm2yCWIKgidUCXNoh068hYEAIfkEBQoAfwAsBwAPAA4ACAAAB0eAf4KDgwUkJYSJfxUsAgIYioMkAn5+DwdRf0lVQjoKfyWUfjYEgkwJCRQ9fwEYfjcxg0WoFDyDB6WDOhQUQDiRggo9O7+RgQAh+QQFCgB/ACwCAA8ADgAIAAAHSIB/J2ZHeX+HiIhaSygoXE6JiAVIQwkJK2eRiEFPlitWfwoZDQYBiD5ZYGuHHn5+fQiJCj+IEq59DJqIBn19CwO6hwEIEcCHgQAh+QQFCgB/ACwAAAcACAAOAAAHRoB/gn8ag4aGQVdCOgqDYQkJFD2DkJE8g1MUFEA4g0pwO52Ho4MBKjMnpSICAhwHgh8Afn4ANYIFD7MAhYIhLxYThwSvf4EAOw==');
		$div.css(_style).append($img.css(_imgStyle));
		return $div;
	}
}(window, jQuery))
;/*!/comm/pluging/mmhSlider/jquery.mmh.slider.js*/
(function($) {

	var tpl = "<li class='{class}' style='background-image:url({src})'><a href='/#projects/{projectId}/{versionId}' style='width:100%;height:100%;display:inline-block;'></a></li>",
		toolTpl = "<label class='{class}'>&bull;</label>",
		timer=null;

	$.fn.mmhSlider = function(name, options) {
		var _setting = null;
		if(timer){
			clearInterval(timer)
		}
		if (typeof name === 'string') {
			return $(this);
		} else {
			options = name;
			_setting = $.extend({},
				$.fn.mmhSlider.defaults, options);
			$.fn.mmhSlider.methods['init']($(this), _setting);
		}
		return $(this);
	}
	$.fn.mmhSlider.methods = {
		init: function($dom, setting) {
			var _def=$.fn.mmhSlider.defaults;
			var delay = setting.delay,
				_pause=_def._pause;
			$.fn.mmhSlider.defaults._index=0;
			if(setting.noData){
				setting.noData();
				return ;
			}
			this.cacheArray(setting.data.length);
			$.fn.mmhSlider.methods.render($dom, setting, function(data) {
				//定时器任务
				timer=setInterval(function() {
					if(_pause){
						return 
					}
					$.fn.mmhSlider.methods.next($dom,setting,data);
				}, delay)
				
				$dom.find("li").hover(function() {
					_pause = true;
				}, function() {
					_pause = false
				})
			})

		},
		cacheArray:function(size){
			var a=[];
			for(var i=1;i<size;i++){
				a.push(i);
			}
			a.push(0);
			$.fn.mmhSlider.methods.caches=a;
		},
		cache:function(i){
			var a=$.fn.mmhSlider.methods.caches;
			return a[i];
		},
		
		next:function($dom,setting,data){
			var _this=this;
			var _index=$.fn.mmhSlider.defaults._index;
			var $current = $dom.find("li.selected"),
				$currentLabel = $dom.find("label.flag"),

				$nextItem = $dom.find("li").eq(_this.cache(_index)),
				$nextLable=$dom.find("label").eq(_this.cache(_index));
			
			$current.removeClass('selected').addClass('remove');
			$nextItem.removeClass('remove').addClass('selected');

			$currentLabel.toggleClass('flag');
			$nextLable.toggleClass('flag');

			$.fn.mmhSlider.defaults._index=_this.cache(_index);
			setting.onChange(data[_this.cache(_index)]);
		},
		
		random:function($dom,setting,data){
			var $current = $dom.find("li.selected"),
				_index=$.fn.mmhSlider.defaults._index;
			$current.removeClass('selected').addClass('remove');
			$dom.find("label").eq($current.index()).toggleClass('flag');
			$dom.find("label").eq(_index).toggleClass('flag');
			$dom.find("li").eq(_index).removeClass('remove').addClass('selected');
			setting.onChange(data[_index]);
			$dom.find(".slideTitle").html(data[_index].title||data[_index].name)
		},

		render: function($dom, setting, callback) {
			var data = setting.data || [],
				result = ["<ul>"],
				tools = ["<div class='toolbar'>"];
			for (var i = 0, size = data.length; i < size; i++) {
				var _ = tpl,
					__ = toolTpl;
				_ = _.replace('{class}', i == 0 ? 'selected' : 'remove');
				_ = _.replace('{projectId}', data[i].projectId);
				_ = _.replace('{versionId}', data[i].versionId);
				__ = __.replace('{class}', i == 0 ? 'nonFlag flag' : 'nonFlag');
				_ = _.replace('{src}', data[i].image);
				result.push(_);
				tools.push(__);
			}
			tools.push("</div>");
			result.push("</ul>");
			result = result.concat(tools);
			result.push('<div class="slideTitle">' + (data[0].title)+ '</div>');
			$dom.empty().prepend(result.join(""));
			
			setting.onChange(data[0]);
			
			callback(data);
			$dom.find("label").on("click",function(){
				$.fn.mmhSlider.defaults._index=$(this).index();
				$.fn.mmhSlider.defaults._pause=true;
				setTimeout(function(){
					$.fn.mmhSlider.defaults._pause=false;
				},5000)
				$.fn.mmhSlider.methods.random($dom,setting,data);
			})
		},
		
		change:function($dom,index){}
	}
	$.fn.mmhSlider.defaults = {
		delay: 1000,
		_index:0,
		_pause:false,
		onChange: function() {

		}
	}
}(jQuery))
;/*!/comm/pluging/myDropDown/js/myDropDown.es6*/
"use strict";

;(function ($) {

  $.fn.myDropDown = function (opts) {

    var settings = {
      click: null, //点击事件
      zIndex: 9
    };

    this.settings = $.extend(settings, opts);

    //z-index
    $(this).css("z-index", this.settings.zIndex);

    this.init = function () {
      this.bindEvent();
    };

    this.bindEvent = function () {
      var $that = $(this),
          that = this;
      $that.on("click", ".myDropText", function () {
        //禁用
        if ($(this).hasClass("disabled")) {
          return;
        }

        //点击箭头切换方向
        if ($that.find('.down').length > 0) {
          $that.find(".myDropList").hide();
        } else {
          $that.find(".myDropList").show();
        }
        $that.find('.myDropArrorw').toggleClass('down');
      });

      $that.on("click", ".myDropList .myItem", function () {

        $(this).closest(".myDropDown").find(".myDropText .text").text($(this).text());

        $(this).closest(".myDropList").hide();

        if ($.isFunction(that.settings.click)) {
          that.settings.click.call(that, $(this));
        }
        //更改箭头方向
        $that.find('.myDropArrorw').toggleClass('down');

        return false;
        //$(document).trigger('click.myDropDown');
      });

      $(document).on("click.myDropDown", function (event) {

        var $target = $(event.target);
        if ($target.closest($that).length <= 0) {
          $that.find(".myDropList").hide().end().find(".myDropArrorw").removeClass('down');
        }
      });
    };

    this.init();
  };
})(jQuery);
;/*!/comm/pluging/myRadioCk/myRadioCk.js*/
  
;
(function($) {

	$.fn.myRadioCk = function(opts) {
		$(this).each(function() {
			new myRadioCk($(this), opts);
		});
	}

	// 单选，多选
	function myRadioCk($el, opts) {

		var settings = {
			click: null
		}

		this.settings = $.extend(settings, opts);


		//事件绑定
		this.bindEvent = function() {
			var that = this;
			$el.on("click", ".btnRadio,.btnCk", function() {
				//禁用不可选中
				if ($(this).hasClass("disable") || $el.hasClass("disable")) return;

				if ($(this).is(".btnCk")) {
					//选中样式
					$(this).toggleClass('selected');
				} else {
					//选中样式
					$(this).addClass('selected').siblings().removeClass('selected');
				}

				if ($.isFunction(that.settings.click)) { 
					that.settings.click.call($el,$(this).hasClass('selected'));
				}
			});
		}

		this.init = function() {
			this.bindEvent();
		}

		this.init();


	}

})(jQuery);
;/*!/comm/pluging/tip.js*/
$.tip=function(options){
	var defaults={
		type:'success',
		message:'hello',
		timeout:2000
	}
	options=$.extend({},defaults,options);
	var tpl='<div class="mmhTip"><div class="content '+options.type+'"><i></i>'+options.message+'</div></div>';
	var _self=$(tpl).appendTo($('body'));
	_self.animate({
		top:'40px'
	},1000)
	setTimeout(function(){
		_self.remove();
	},options.timeout)
}
;/*!/comm/pluging/ZeroClipboard/ZeroClipboard.js*/
/*!
 * zeroclipboard
 * The Zero Clipboard library provides an easy way to copy text to the clipboard using an invisible Adobe Flash movie, and a JavaScript interface.
 * Copyright 2012 Jon Rohan, James M. Greene, .
 * Released under the MIT license
 * http://jonrohan.github.com/ZeroClipboard/
 * v1.1.7
 */
(function() {
  "use strict";
  var _getStyle = function(el, prop) {
    var y = el.style[prop];
    if (el.currentStyle) y = el.currentStyle[prop];
    else if (window.getComputedStyle) y = document.defaultView.getComputedStyle(el, null).getPropertyValue(prop);
    if (y == "auto" && prop == "cursor") {
      var possiblePointers = ["a"];
      for (var i = 0; i < possiblePointers.length; i++) {
        if (el.tagName.toLowerCase() == possiblePointers[i]) {
          return "pointer";
        }
      }
    }
    return y;
  };
  var _elementMouseOver = function(event) {
    if (!ZeroClipboard.prototype._singleton) return;
    if (!event) {
      event = window.event;
    }
    var target;
    if (this !== window) {
      target = this;
    } else if (event.target) {
      target = event.target;
    } else if (event.srcElement) {
      target = event.srcElement;
    }
    ZeroClipboard.prototype._singleton.setCurrent(target);
  };
  var _addEventHandler = function(element, method, func) {
    if (element.addEventListener) {
      element.addEventListener(method, func, false);
    } else if (element.attachEvent) {
      element.attachEvent("on" + method, func);
    }
  };
  var _removeEventHandler = function(element, method, func) {
    if (element.removeEventListener) {
      element.removeEventListener(method, func, false);
    } else if (element.detachEvent) {
      element.detachEvent("on" + method, func);
    }
  };
  var _addClass = function(element, value) {
    if (element.addClass) {
      element.addClass(value);
      return element;
    }
    if (value && typeof value === "string") {
      var classNames = (value || "").split(/\s+/);
      if (element.nodeType === 1) {
        if (!element.className) {
          element.className = value;
        } else {
          var className = " " + element.className + " ",
            setClass = element.className;
          for (var c = 0, cl = classNames.length; c < cl; c++) {
            if (className.indexOf(" " + classNames[c] + " ") < 0) {
              setClass += " " + classNames[c];
            }
          }
          element.className = setClass.replace(/^\s+|\s+$/g, "");
        }
      }
    }
    return element;
  };
  var _removeClass = function(element, value) {
    if (element.removeClass) {
      element.removeClass(value);
      return element;
    }
    if (value && typeof value === "string" || value === undefined) {
      var classNames = (value || "").split(/\s+/);
      if (element.nodeType === 1 && element.className) {
        if (value) {
          var className = (" " + element.className + " ").replace(/[\n\t]/g, " ");
          for (var c = 0, cl = classNames.length; c < cl; c++) {
            className = className.replace(" " + classNames[c] + " ", " ");
          }
          element.className = className.replace(/^\s+|\s+$/g, "");
        } else {
          element.className = "";
        }
      }
    }
    return element;
  };
  var _getDOMObjectPosition = function(obj) {
    var info = {
      left: 0,
      top: 0,
      width: obj.width || obj.offsetWidth || 0,
      height: obj.height || obj.offsetHeight || 0,
      zIndex: 9999
    };
    var zi = _getStyle(obj, "zIndex");
    if (zi && zi != "auto") {
      info.zIndex = parseInt(zi, 10);
    }
    while (obj) {
      var borderLeftWidth = parseInt(_getStyle(obj, "borderLeftWidth"), 10);
      var borderTopWidth = parseInt(_getStyle(obj, "borderTopWidth"), 10);
      info.left += isNaN(obj.offsetLeft) ? 0 : obj.offsetLeft;
      info.left += isNaN(borderLeftWidth) ? 0 : borderLeftWidth;
      info.left -= isNaN(obj.scrollLeft) ? 0 : obj.scrollLeft;
      info.top += isNaN(obj.offsetTop) ? 0 : obj.offsetTop;
      info.top += isNaN(borderTopWidth) ? 0 : borderTopWidth;
      info.top -= isNaN(obj.scrollTop) ? 0 : obj.scrollTop;
      obj = obj.offsetParent;
    }
    return info;
  };
  var _noCache = function(path) {
    return (path.indexOf("?") >= 0 ? "&" : "?") + "nocache=" + (new Date).getTime();
  };
  var _vars = function(options) {
    var str = [];
    if (options.trustedDomains) {
      if (typeof options.trustedDomains === "string") {
        str.push("trustedDomain=" + options.trustedDomains);
      } else {
        str.push("trustedDomain=" + options.trustedDomains.join(","));
      }
    }
    return str.join("&");
  };
  var _inArray = function(elem, array) {
    if (array.indexOf) {
      return array.indexOf(elem);
    }
    for (var i = 0, length = array.length; i < length; i++) {
      if (array[i] === elem) {
        return i;
      }
    }
    return -1;
  };
  var _prepGlue = function(elements) {
    if (typeof elements === "string") throw new TypeError("ZeroClipboard doesn't accept query strings.");
    if (!elements.length) return [elements];
    return elements;
  };
  var ZeroClipboard = function(elements, options) {
    if (elements)(ZeroClipboard.prototype._singleton || this).glue(elements);
    if (ZeroClipboard.prototype._singleton) return ZeroClipboard.prototype._singleton;
    ZeroClipboard.prototype._singleton = this;
    this.options = {};
    for (var kd in _defaults) this.options[kd] = _defaults[kd];
    for (var ko in options) this.options[ko] = options[ko];
    this.handlers = {};
    if (ZeroClipboard.detectFlashSupport()) _bridge();
  };
  var currentElement, gluedElements = [];
  ZeroClipboard.prototype.setCurrent = function(element) {
    currentElement = element;
    this.reposition();
    if (element.getAttribute("title")) {
      this.setTitle(element.getAttribute("title"));
    }
    this.setHandCursor(_getStyle(element, "cursor") == "pointer");
  };
  ZeroClipboard.prototype.setText = function(newText) {
    if (newText && newText !== "") {
      this.options.text = newText;
      if (this.ready()) this.flashBridge.setText(newText);
    }
  };
  ZeroClipboard.prototype.setTitle = function(newTitle) {
    if (newTitle && newTitle !== "") this.htmlBridge.setAttribute("title", newTitle);
  };
  ZeroClipboard.prototype.setSize = function(width, height) {
    if (this.ready()) this.flashBridge.setSize(width, height);
  };
  ZeroClipboard.prototype.setHandCursor = function(enabled) {
    if (this.ready()) this.flashBridge.setHandCursor(enabled);
  };
  ZeroClipboard.version = "1.1.7";
  var _defaults = {
    moviePath: "/static/dist/swf/comm/pluging/ZeroClipboard/ZeroClipboard.swf",
    trustedDomains: null,
    text: null,
    hoverClass: "zeroclipboard-is-hover",
    activeClass: "zeroclipboard-is-active"
  };
  ZeroClipboard.setDefaults = function(options) {
    for (var ko in options) _defaults[ko] = options[ko];
  };
  ZeroClipboard.destroy = function() {
    ZeroClipboard.prototype._singleton.unglue(gluedElements);
    var bridge = ZeroClipboard.prototype._singleton.htmlBridge;
    bridge.parentNode.removeChild(bridge);
    delete ZeroClipboard.prototype._singleton;
  };
  ZeroClipboard.detectFlashSupport = function() {
    var hasFlash = false;
    try {
      if (new ActiveXObject("ShockwaveFlash.ShockwaveFlash")) {
        hasFlash = true;
      }
    } catch (error) {
      if (navigator.mimeTypes["application/x-shockwave-flash"]) {
        hasFlash = true;
      }
    }
    return hasFlash;
  };
  var _bridge = function() {
    var client = ZeroClipboard.prototype._singleton;
    client.htmlBridge = document.getElementById("global-zeroclipboard-html-bridge");
    if (client.htmlBridge) {
      client.flashBridge = document["global-zeroclipboard-flash-bridge"];
      return;
    }
    var html = '    <object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" id="global-zeroclipboard-flash-bridge" width="100%" height="100%">       <param name="movie" value="' + client.options.moviePath + _noCache(client.options.moviePath) + '"/>       <param name="allowScriptAccess" value="always" />       <param name="scale" value="exactfit">       <param name="loop" value="false" />       <param name="menu" value="false" />       <param name="quality" value="best" />       <param name="bgcolor" value="#ffffff" />       <param name="wmode" value="transparent"/>       <param name="flashvars" value="' + _vars(client.options) + '"/>       <embed src="' + client.options.moviePath + _noCache(client.options.moviePath) + '"         loop="false" menu="false"         quality="best" bgcolor="#ffffff"         width="100%" height="100%"         name="global-zeroclipboard-flash-bridge"         allowScriptAccess="always"         allowFullScreen="false"         type="application/x-shockwave-flash"         wmode="transparent"         pluginspage="http://www.macromedia.com/go/getflashplayer"         flashvars="' + _vars(client.options) + '"         scale="exactfit">       </embed>     </object>';
    client.htmlBridge = document.createElement("div");
    client.htmlBridge.id = "global-zeroclipboard-html-bridge";
    client.htmlBridge.setAttribute("class", "global-zeroclipboard-container");
    client.htmlBridge.setAttribute("data-clipboard-ready", false);
    client.htmlBridge.style.position = "absolute";
    client.htmlBridge.style.left = "-9999px";
    client.htmlBridge.style.top = "-9999px";
    client.htmlBridge.style.width = "15px";
    client.htmlBridge.style.height = "15px";
    client.htmlBridge.style.zIndex = "9999";
    client.htmlBridge.innerHTML = html;
    document.body.appendChild(client.htmlBridge);
    client.flashBridge = document["global-zeroclipboard-flash-bridge"];
  };
  ZeroClipboard.prototype.resetBridge = function() {
    this.htmlBridge.style.left = "-9999px";
    this.htmlBridge.style.top = "-9999px";
    this.htmlBridge.removeAttribute("title");
    this.htmlBridge.removeAttribute("data-clipboard-text");
    _removeClass(currentElement, this.options.activeClass);
    currentElement = null;
    this.options.text = null;
  };
  ZeroClipboard.prototype.ready = function() {
    var ready = this.htmlBridge.getAttribute("data-clipboard-ready");
    return ready === "true" || ready === true;
  };
  ZeroClipboard.prototype.reposition = function() {
    if (!currentElement) return false;
    var pos = _getDOMObjectPosition(currentElement);
    this.htmlBridge.style.top = pos.top + "px";
    this.htmlBridge.style.left = pos.left + "px";
    this.htmlBridge.style.width = pos.width + "px";
    this.htmlBridge.style.height = pos.height + "px";
    this.htmlBridge.style.zIndex = pos.zIndex + 1;
    this.setSize(pos.width, pos.height);
  };
  ZeroClipboard.dispatch = function(eventName, args) {
    ZeroClipboard.prototype._singleton.receiveEvent(eventName, args);
  };
  ZeroClipboard.prototype.on = function(eventName, func) {
    var events = eventName.toString().split(/\s/g);
    for (var i = 0; i < events.length; i++) {
      eventName = events[i].toLowerCase().replace(/^on/, "");
      if (!this.handlers[eventName]) this.handlers[eventName] = func;
    }
    if (this.handlers.noflash && !ZeroClipboard.detectFlashSupport()) {
      this.receiveEvent("onNoFlash", null);
    }
  };
  ZeroClipboard.prototype.addEventListener = ZeroClipboard.prototype.on;
  ZeroClipboard.prototype.off = function(eventName, func) {
    var events = eventName.toString().split(/\s/g);
    for (var i = 0; i < events.length; i++) {
      eventName = events[i].toLowerCase().replace(/^on/, "");
      for (var event in this.handlers) {
        if (event === eventName && this.handlers[event] === func) {
          delete this.handlers[event];
        }
      }
    }
  };
  ZeroClipboard.prototype.removeEventListener = ZeroClipboard.prototype.off;
  ZeroClipboard.prototype.receiveEvent = function(eventName, args) {
    eventName = eventName.toString().toLowerCase().replace(/^on/, "");
    var element = currentElement;
    switch (eventName) {
      case "load":
        if (args && parseFloat(args.flashVersion.replace(",", ".").replace(/[^0-9\.]/gi, "")) < 10) {
          this.receiveEvent("onWrongFlash", {
            flashVersion: args.flashVersion
          });
          return;
        }
        this.htmlBridge.setAttribute("data-clipboard-ready", true);
        break;
      case "mouseover":
        _addClass(element, this.options.hoverClass);
        break;
      case "mouseout":
        _removeClass(element, this.options.hoverClass);
        this.resetBridge();
        break;
      case "mousedown":
        _addClass(element, this.options.activeClass);
        break;
      case "mouseup":
        _removeClass(element, this.options.activeClass);
        break;
      case "datarequested":
        var targetId = element.getAttribute("data-clipboard-target"),
          targetEl = !targetId ? null : document.getElementById(targetId);
        if (targetEl) {
          var textContent = targetEl.value || targetEl.textContent || targetEl.innerText;
          if (textContent) this.setText(textContent);
        } else {
          var defaultText = element.getAttribute("data-clipboard-text");
          if (defaultText) this.setText(defaultText);
        }
        break;
      case "complete":
        this.options.text = null;
        break;
    }
    if (this.handlers[eventName]) {
      var func = this.handlers[eventName];
      if (typeof func == "function") {
        func.call(element, this, args);
      } else if (typeof func == "string") {
        window[func].call(element, this, args);
      }
    }
  };
  ZeroClipboard.prototype.glue = function(elements) {
    elements = _prepGlue(elements);
    for (var i = 0; i < elements.length; i++) {
      if (_inArray(elements[i], gluedElements) == -1) {
        gluedElements.push(elements[i]);
        _addEventHandler(elements[i], "mouseover", _elementMouseOver);
      }
    }
  };
  ZeroClipboard.prototype.unglue = function(elements) {
    elements = _prepGlue(elements);
    for (var i = 0; i < elements.length; i++) {
      _removeEventHandler(elements[i], "mouseover", _elementMouseOver);
      var arrayIndex = _inArray(elements[i], gluedElements);
      if (arrayIndex != -1) gluedElements.splice(arrayIndex, 1);
    }
  }; 

  if (typeof module !== "undefined") {
    module.exports = ZeroClipboard;
  } else {
    window.ZeroClipboard = ZeroClipboard;
  }
})();
;/*!/comm/pluging/ztree-3/js/jquery.ztree.core.min.js*/
/*
 * JQuery zTree core v3.5.23
 * http://zTree.me/
 *
 * Copyright (c) 2010 Hunter.z
 *
 * Licensed same as jquery - MIT License
 * http://www.opensource.org/licenses/mit-license.php
 *
 * email: hunter.z@263.net
 * Date: 2016-04-01
 */
(function(q){var I,J,K,L,M,N,v,s={},w={},x={},O={treeId:"",treeObj:null,view:{addDiyDom:null,autoCancelSelected:!0,dblClickExpand:!0,expandSpeed:"fast",fontCss:{},nameIsHTML:!1,selectedMulti:!0,showIcon:!0,showLine:!0,showTitle:!0,txtSelectedEnable:!1},data:{key:{children:"children",name:"name",title:"",url:"url",icon:"icon"},simpleData:{enable:!1,idKey:"id",pIdKey:"pId",rootPId:null},keep:{parent:!1,leaf:!1}},async:{enable:!1,contentType:"application/x-www-form-urlencoded",type:"post",dataType:"text",
url:"",autoParam:[],otherParam:[],dataFilter:null},callback:{beforeAsync:null,beforeClick:null,beforeDblClick:null,beforeRightClick:null,beforeMouseDown:null,beforeMouseUp:null,beforeExpand:null,beforeCollapse:null,beforeRemove:null,onAsyncError:null,onAsyncSuccess:null,onNodeCreated:null,onClick:null,onDblClick:null,onRightClick:null,onMouseDown:null,onMouseUp:null,onExpand:null,onCollapse:null,onRemove:null}},y=[function(b){var a=b.treeObj,c=f.event;a.bind(c.NODECREATED,function(a,c,g){j.apply(b.callback.onNodeCreated,
[a,c,g])});a.bind(c.CLICK,function(a,c,g,m,h){j.apply(b.callback.onClick,[c,g,m,h])});a.bind(c.EXPAND,function(a,c,g){j.apply(b.callback.onExpand,[a,c,g])});a.bind(c.COLLAPSE,function(a,c,g){j.apply(b.callback.onCollapse,[a,c,g])});a.bind(c.ASYNC_SUCCESS,function(a,c,g,h){j.apply(b.callback.onAsyncSuccess,[a,c,g,h])});a.bind(c.ASYNC_ERROR,function(a,c,g,h,f,i){j.apply(b.callback.onAsyncError,[a,c,g,h,f,i])});a.bind(c.REMOVE,function(a,c,g){j.apply(b.callback.onRemove,[a,c,g])});a.bind(c.SELECTED,
function(a,c,g){j.apply(b.callback.onSelected,[c,g])});a.bind(c.UNSELECTED,function(a,c,g){j.apply(b.callback.onUnSelected,[c,g])})}],z=[function(b){var a=f.event;b.treeObj.unbind(a.NODECREATED).unbind(a.CLICK).unbind(a.EXPAND).unbind(a.COLLAPSE).unbind(a.ASYNC_SUCCESS).unbind(a.ASYNC_ERROR).unbind(a.REMOVE).unbind(a.SELECTED).unbind(a.UNSELECTED)}],A=[function(b){var a=h.getCache(b);a||(a={},h.setCache(b,a));a.nodes=[];a.doms=[]}],B=[function(b,a,c,d,e,g){if(c){var m=h.getRoot(b),f=b.data.key.children;
c.level=a;c.tId=b.treeId+"_"+ ++m.zId;c.parentTId=d?d.tId:null;c.open=typeof c.open=="string"?j.eqs(c.open,"true"):!!c.open;c[f]&&c[f].length>0?(c.isParent=!0,c.zAsync=!0):(c.isParent=typeof c.isParent=="string"?j.eqs(c.isParent,"true"):!!c.isParent,c.open=c.isParent&&!b.async.enable?c.open:!1,c.zAsync=!c.isParent);c.isFirstNode=e;c.isLastNode=g;c.getParentNode=function(){return h.getNodeCache(b,c.parentTId)};c.getPreNode=function(){return h.getPreNode(b,c)};c.getNextNode=function(){return h.getNextNode(b,
c)};c.getIndex=function(){return h.getNodeIndex(b,c)};c.getPath=function(){return h.getNodePath(b,c)};c.isAjaxing=!1;h.fixPIdKeyValue(b,c)}}],u=[function(b){var a=b.target,c=h.getSetting(b.data.treeId),d="",e=null,g="",m="",i=null,n=null,k=null;if(j.eqs(b.type,"mousedown"))m="mousedown";else if(j.eqs(b.type,"mouseup"))m="mouseup";else if(j.eqs(b.type,"contextmenu"))m="contextmenu";else if(j.eqs(b.type,"click"))if(j.eqs(a.tagName,"span")&&a.getAttribute("treeNode"+f.id.SWITCH)!==null)d=j.getNodeMainDom(a).id,
g="switchNode";else{if(k=j.getMDom(c,a,[{tagName:"a",attrName:"treeNode"+f.id.A}]))d=j.getNodeMainDom(k).id,g="clickNode"}else if(j.eqs(b.type,"dblclick")&&(m="dblclick",k=j.getMDom(c,a,[{tagName:"a",attrName:"treeNode"+f.id.A}])))d=j.getNodeMainDom(k).id,g="switchNode";if(m.length>0&&d.length==0&&(k=j.getMDom(c,a,[{tagName:"a",attrName:"treeNode"+f.id.A}])))d=j.getNodeMainDom(k).id;if(d.length>0)switch(e=h.getNodeCache(c,d),g){case "switchNode":e.isParent?j.eqs(b.type,"click")||j.eqs(b.type,"dblclick")&&
j.apply(c.view.dblClickExpand,[c.treeId,e],c.view.dblClickExpand)?i=I:g="":g="";break;case "clickNode":i=J}switch(m){case "mousedown":n=K;break;case "mouseup":n=L;break;case "dblclick":n=M;break;case "contextmenu":n=N}return{stop:!1,node:e,nodeEventType:g,nodeEventCallback:i,treeEventType:m,treeEventCallback:n}}],C=[function(b){var a=h.getRoot(b);a||(a={},h.setRoot(b,a));a[b.data.key.children]=[];a.expandTriggerFlag=!1;a.curSelectedList=[];a.noSelection=!0;a.createdNodes=[];a.zId=0;a._ver=(new Date).getTime()}],
D=[],E=[],F=[],G=[],H=[],h={addNodeCache:function(b,a){h.getCache(b).nodes[h.getNodeCacheId(a.tId)]=a},getNodeCacheId:function(b){return b.substring(b.lastIndexOf("_")+1)},addAfterA:function(b){E.push(b)},addBeforeA:function(b){D.push(b)},addInnerAfterA:function(b){G.push(b)},addInnerBeforeA:function(b){F.push(b)},addInitBind:function(b){y.push(b)},addInitUnBind:function(b){z.push(b)},addInitCache:function(b){A.push(b)},addInitNode:function(b){B.push(b)},addInitProxy:function(b,a){a?u.splice(0,0,
b):u.push(b)},addInitRoot:function(b){C.push(b)},addNodesData:function(b,a,c,d){var e=b.data.key.children;a[e]?c>=a[e].length&&(c=-1):(a[e]=[],c=-1);if(a[e].length>0&&c===0)a[e][0].isFirstNode=!1,i.setNodeLineIcos(b,a[e][0]);else if(a[e].length>0&&c<0)a[e][a[e].length-1].isLastNode=!1,i.setNodeLineIcos(b,a[e][a[e].length-1]);a.isParent=!0;c<0?a[e]=a[e].concat(d):(b=[c,0].concat(d),a[e].splice.apply(a[e],b))},addSelectedNode:function(b,a){var c=h.getRoot(b);h.isSelectedNode(b,a)||c.curSelectedList.push(a)},
addCreatedNode:function(b,a){(b.callback.onNodeCreated||b.view.addDiyDom)&&h.getRoot(b).createdNodes.push(a)},addZTreeTools:function(b){H.push(b)},exSetting:function(b){q.extend(!0,O,b)},fixPIdKeyValue:function(b,a){b.data.simpleData.enable&&(a[b.data.simpleData.pIdKey]=a.parentTId?a.getParentNode()[b.data.simpleData.idKey]:b.data.simpleData.rootPId)},getAfterA:function(b,a,c){for(var d=0,e=E.length;d<e;d++)E[d].apply(this,arguments)},getBeforeA:function(b,a,c){for(var d=0,e=D.length;d<e;d++)D[d].apply(this,
arguments)},getInnerAfterA:function(b,a,c){for(var d=0,e=G.length;d<e;d++)G[d].apply(this,arguments)},getInnerBeforeA:function(b,a,c){for(var d=0,e=F.length;d<e;d++)F[d].apply(this,arguments)},getCache:function(b){return x[b.treeId]},getNodeIndex:function(b,a){if(!a)return null;for(var c=b.data.key.children,d=a.parentTId?a.getParentNode():h.getRoot(b),e=0,g=d[c].length-1;e<=g;e++)if(d[c][e]===a)return e;return-1},getNextNode:function(b,a){if(!a)return null;for(var c=b.data.key.children,d=a.parentTId?
a.getParentNode():h.getRoot(b),e=0,g=d[c].length-1;e<=g;e++)if(d[c][e]===a)return e==g?null:d[c][e+1];return null},getNodeByParam:function(b,a,c,d){if(!a||!c)return null;for(var e=b.data.key.children,g=0,f=a.length;g<f;g++){if(a[g][c]==d)return a[g];var i=h.getNodeByParam(b,a[g][e],c,d);if(i)return i}return null},getNodeCache:function(b,a){if(!a)return null;var c=x[b.treeId].nodes[h.getNodeCacheId(a)];return c?c:null},getNodeName:function(b,a){return""+a[b.data.key.name]},getNodePath:function(b,a){if(!a)return null;
var c;(c=a.parentTId?a.getParentNode().getPath():[])&&c.push(a);return c},getNodeTitle:function(b,a){return""+a[b.data.key.title===""?b.data.key.name:b.data.key.title]},getNodes:function(b){return h.getRoot(b)[b.data.key.children]},getNodesByParam:function(b,a,c,d){if(!a||!c)return[];for(var e=b.data.key.children,g=[],f=0,i=a.length;f<i;f++)a[f][c]==d&&g.push(a[f]),g=g.concat(h.getNodesByParam(b,a[f][e],c,d));return g},getNodesByParamFuzzy:function(b,a,c,d){if(!a||!c)return[];for(var e=b.data.key.children,
g=[],d=d.toLowerCase(),f=0,i=a.length;f<i;f++)typeof a[f][c]=="string"&&a[f][c].toLowerCase().indexOf(d)>-1&&g.push(a[f]),g=g.concat(h.getNodesByParamFuzzy(b,a[f][e],c,d));return g},getNodesByFilter:function(b,a,c,d,e){if(!a)return d?null:[];for(var g=b.data.key.children,f=d?null:[],i=0,n=a.length;i<n;i++){if(j.apply(c,[a[i],e],!1)){if(d)return a[i];f.push(a[i])}var k=h.getNodesByFilter(b,a[i][g],c,d,e);if(d&&k)return k;f=d?k:f.concat(k)}return f},getPreNode:function(b,a){if(!a)return null;for(var c=
b.data.key.children,d=a.parentTId?a.getParentNode():h.getRoot(b),e=0,g=d[c].length;e<g;e++)if(d[c][e]===a)return e==0?null:d[c][e-1];return null},getRoot:function(b){return b?w[b.treeId]:null},getRoots:function(){return w},getSetting:function(b){return s[b]},getSettings:function(){return s},getZTreeTools:function(b){return(b=this.getRoot(this.getSetting(b)))?b.treeTools:null},initCache:function(b){for(var a=0,c=A.length;a<c;a++)A[a].apply(this,arguments)},initNode:function(b,a,c,d,e,g){for(var f=
0,h=B.length;f<h;f++)B[f].apply(this,arguments)},initRoot:function(b){for(var a=0,c=C.length;a<c;a++)C[a].apply(this,arguments)},isSelectedNode:function(b,a){for(var c=h.getRoot(b),d=0,e=c.curSelectedList.length;d<e;d++)if(a===c.curSelectedList[d])return!0;return!1},removeNodeCache:function(b,a){var c=b.data.key.children;if(a[c])for(var d=0,e=a[c].length;d<e;d++)h.removeNodeCache(b,a[c][d]);h.getCache(b).nodes[h.getNodeCacheId(a.tId)]=null},removeSelectedNode:function(b,a){for(var c=h.getRoot(b),
d=0,e=c.curSelectedList.length;d<e;d++)if(a===c.curSelectedList[d]||!h.getNodeCache(b,c.curSelectedList[d].tId))c.curSelectedList.splice(d,1),b.treeObj.trigger(f.event.UNSELECTED,[b.treeId,a]),d--,e--},setCache:function(b,a){x[b.treeId]=a},setRoot:function(b,a){w[b.treeId]=a},setZTreeTools:function(b,a){for(var c=0,d=H.length;c<d;c++)H[c].apply(this,arguments)},transformToArrayFormat:function(b,a){if(!a)return[];var c=b.data.key.children,d=[];if(j.isArray(a))for(var e=0,g=a.length;e<g;e++)d.push(a[e]),
a[e][c]&&(d=d.concat(h.transformToArrayFormat(b,a[e][c])));else d.push(a),a[c]&&(d=d.concat(h.transformToArrayFormat(b,a[c])));return d},transformTozTreeFormat:function(b,a){var c,d,e=b.data.simpleData.idKey,g=b.data.simpleData.pIdKey,f=b.data.key.children;if(!e||e==""||!a)return[];if(j.isArray(a)){var h=[],i=[];for(c=0,d=a.length;c<d;c++)i[a[c][e]]=a[c];for(c=0,d=a.length;c<d;c++)i[a[c][g]]&&a[c][e]!=a[c][g]?(i[a[c][g]][f]||(i[a[c][g]][f]=[]),i[a[c][g]][f].push(a[c])):h.push(a[c]);return h}else return[a]}},
l={bindEvent:function(b){for(var a=0,c=y.length;a<c;a++)y[a].apply(this,arguments)},unbindEvent:function(b){for(var a=0,c=z.length;a<c;a++)z[a].apply(this,arguments)},bindTree:function(b){var a={treeId:b.treeId},c=b.treeObj;b.view.txtSelectedEnable||c.bind("selectstart",v).css({"-moz-user-select":"-moz-none"});c.bind("click",a,l.proxy);c.bind("dblclick",a,l.proxy);c.bind("mouseover",a,l.proxy);c.bind("mouseout",a,l.proxy);c.bind("mousedown",a,l.proxy);c.bind("mouseup",a,l.proxy);c.bind("contextmenu",
a,l.proxy)},unbindTree:function(b){b.treeObj.unbind("selectstart",v).unbind("click",l.proxy).unbind("dblclick",l.proxy).unbind("mouseover",l.proxy).unbind("mouseout",l.proxy).unbind("mousedown",l.proxy).unbind("mouseup",l.proxy).unbind("contextmenu",l.proxy)},doProxy:function(b){for(var a=[],c=0,d=u.length;c<d;c++){var e=u[c].apply(this,arguments);a.push(e);if(e.stop)break}return a},proxy:function(b){var a=h.getSetting(b.data.treeId);if(!j.uCanDo(a,b))return!0;for(var a=l.doProxy(b),c=!0,d=0,e=a.length;d<
e;d++){var g=a[d];g.nodeEventCallback&&(c=g.nodeEventCallback.apply(g,[b,g.node])&&c);g.treeEventCallback&&(c=g.treeEventCallback.apply(g,[b,g.node])&&c)}return c}};I=function(b,a){var c=h.getSetting(b.data.treeId);if(a.open){if(j.apply(c.callback.beforeCollapse,[c.treeId,a],!0)==!1)return!0}else if(j.apply(c.callback.beforeExpand,[c.treeId,a],!0)==!1)return!0;h.getRoot(c).expandTriggerFlag=!0;i.switchNode(c,a);return!0};J=function(b,a){var c=h.getSetting(b.data.treeId),d=c.view.autoCancelSelected&&
(b.ctrlKey||b.metaKey)&&h.isSelectedNode(c,a)?0:c.view.autoCancelSelected&&(b.ctrlKey||b.metaKey)&&c.view.selectedMulti?2:1;if(j.apply(c.callback.beforeClick,[c.treeId,a,d],!0)==!1)return!0;d===0?i.cancelPreSelectedNode(c,a):i.selectNode(c,a,d===2);c.treeObj.trigger(f.event.CLICK,[b,c.treeId,a,d]);return!0};K=function(b,a){var c=h.getSetting(b.data.treeId);j.apply(c.callback.beforeMouseDown,[c.treeId,a],!0)&&j.apply(c.callback.onMouseDown,[b,c.treeId,a]);return!0};L=function(b,a){var c=h.getSetting(b.data.treeId);
j.apply(c.callback.beforeMouseUp,[c.treeId,a],!0)&&j.apply(c.callback.onMouseUp,[b,c.treeId,a]);return!0};M=function(b,a){var c=h.getSetting(b.data.treeId);j.apply(c.callback.beforeDblClick,[c.treeId,a],!0)&&j.apply(c.callback.onDblClick,[b,c.treeId,a]);return!0};N=function(b,a){var c=h.getSetting(b.data.treeId);j.apply(c.callback.beforeRightClick,[c.treeId,a],!0)&&j.apply(c.callback.onRightClick,[b,c.treeId,a]);return typeof c.callback.onRightClick!="function"};v=function(b){b=b.originalEvent.srcElement.nodeName.toLowerCase();
return b==="input"||b==="textarea"};var j={apply:function(b,a,c){return typeof b=="function"?b.apply(P,a?a:[]):c},canAsync:function(b,a){var c=b.data.key.children;return b.async.enable&&a&&a.isParent&&!(a.zAsync||a[c]&&a[c].length>0)},clone:function(b){if(b===null)return null;var a=j.isArray(b)?[]:{},c;for(c in b)a[c]=b[c]instanceof Date?new Date(b[c].getTime()):typeof b[c]==="object"?j.clone(b[c]):b[c];return a},eqs:function(b,a){return b.toLowerCase()===a.toLowerCase()},isArray:function(b){return Object.prototype.toString.apply(b)===
"[object Array]"},$:function(b,a,c){a&&typeof a!="string"&&(c=a,a="");return typeof b=="string"?q(b,c?c.treeObj.get(0).ownerDocument:null):q("#"+b.tId+a,c?c.treeObj:null)},getMDom:function(b,a,c){if(!a)return null;for(;a&&a.id!==b.treeId;){for(var d=0,e=c.length;a.tagName&&d<e;d++)if(j.eqs(a.tagName,c[d].tagName)&&a.getAttribute(c[d].attrName)!==null)return a;a=a.parentNode}return null},getNodeMainDom:function(b){return q(b).parent("li").get(0)||q(b).parentsUntil("li").parent().get(0)},isChildOrSelf:function(b,
a){return q(b).closest("#"+a).length>0},uCanDo:function(){return!0}},i={addNodes:function(b,a,c,d,e){if(!b.data.keep.leaf||!a||a.isParent)if(j.isArray(d)||(d=[d]),b.data.simpleData.enable&&(d=h.transformTozTreeFormat(b,d)),a){var g=k(a,f.id.SWITCH,b),m=k(a,f.id.ICON,b),o=k(a,f.id.UL,b);if(!a.open)i.replaceSwitchClass(a,g,f.folder.CLOSE),i.replaceIcoClass(a,m,f.folder.CLOSE),a.open=!1,o.css({display:"none"});h.addNodesData(b,a,c,d);i.createNodes(b,a.level+1,d,a,c);e||i.expandCollapseParentNode(b,a,
!0)}else h.addNodesData(b,h.getRoot(b),c,d),i.createNodes(b,0,d,null,c)},appendNodes:function(b,a,c,d,e,g,f){if(!c)return[];var j=[],k=b.data.key.children,l=(d?d:h.getRoot(b))[k],r,Q;if(!l||e>=l.length)e=-1;for(var t=0,q=c.length;t<q;t++){var p=c[t];g&&(r=(e===0||l.length==c.length)&&t==0,Q=e<0&&t==c.length-1,h.initNode(b,a,p,d,r,Q,f),h.addNodeCache(b,p));r=[];p[k]&&p[k].length>0&&(r=i.appendNodes(b,a+1,p[k],p,-1,g,f&&p.open));f&&(i.makeDOMNodeMainBefore(j,b,p),i.makeDOMNodeLine(j,b,p),h.getBeforeA(b,
p,j),i.makeDOMNodeNameBefore(j,b,p),h.getInnerBeforeA(b,p,j),i.makeDOMNodeIcon(j,b,p),h.getInnerAfterA(b,p,j),i.makeDOMNodeNameAfter(j,b,p),h.getAfterA(b,p,j),p.isParent&&p.open&&i.makeUlHtml(b,p,j,r.join("")),i.makeDOMNodeMainAfter(j,b,p),h.addCreatedNode(b,p))}return j},appendParentULDom:function(b,a){var c=[],d=k(a,b);!d.get(0)&&a.parentTId&&(i.appendParentULDom(b,a.getParentNode()),d=k(a,b));var e=k(a,f.id.UL,b);e.get(0)&&e.remove();e=i.appendNodes(b,a.level+1,a[b.data.key.children],a,-1,!1,!0);
i.makeUlHtml(b,a,c,e.join(""));d.append(c.join(""))},asyncNode:function(b,a,c,d){var e,g;if(a&&!a.isParent)return j.apply(d),!1;else if(a&&a.isAjaxing)return!1;else if(j.apply(b.callback.beforeAsync,[b.treeId,a],!0)==!1)return j.apply(d),!1;if(a)a.isAjaxing=!0,k(a,f.id.ICON,b).attr({style:"","class":f.className.BUTTON+" "+f.className.ICO_LOADING});var m={};for(e=0,g=b.async.autoParam.length;a&&e<g;e++){var o=b.async.autoParam[e].split("="),n=o;o.length>1&&(n=o[1],o=o[0]);m[n]=a[o]}if(j.isArray(b.async.otherParam))for(e=
0,g=b.async.otherParam.length;e<g;e+=2)m[b.async.otherParam[e]]=b.async.otherParam[e+1];else for(var l in b.async.otherParam)m[l]=b.async.otherParam[l];var r=h.getRoot(b)._ver;q.ajax({contentType:b.async.contentType,cache:!1,type:b.async.type,url:j.apply(b.async.url,[b.treeId,a],b.async.url),data:m,dataType:b.async.dataType,success:function(e){if(r==h.getRoot(b)._ver){var g=[];try{g=!e||e.length==0?[]:typeof e=="string"?eval("("+e+")"):e}catch(m){g=e}if(a)a.isAjaxing=null,a.zAsync=!0;i.setNodeLineIcos(b,
a);g&&g!==""?(g=j.apply(b.async.dataFilter,[b.treeId,a,g],g),i.addNodes(b,a,-1,g?j.clone(g):[],!!c)):i.addNodes(b,a,-1,[],!!c);b.treeObj.trigger(f.event.ASYNC_SUCCESS,[b.treeId,a,e]);j.apply(d)}},error:function(c,d,e){if(r==h.getRoot(b)._ver){if(a)a.isAjaxing=null;i.setNodeLineIcos(b,a);b.treeObj.trigger(f.event.ASYNC_ERROR,[b.treeId,a,c,d,e])}}});return!0},cancelPreSelectedNode:function(b,a,c){var d=h.getRoot(b).curSelectedList,e,g;for(e=d.length-1;e>=0;e--)if(g=d[e],a===g||!a&&(!c||c!==g))if(k(g,
f.id.A,b).removeClass(f.node.CURSELECTED),a){h.removeSelectedNode(b,a);break}else d.splice(e,1),b.treeObj.trigger(f.event.UNSELECTED,[b.treeId,g])},createNodeCallback:function(b){if(b.callback.onNodeCreated||b.view.addDiyDom)for(var a=h.getRoot(b);a.createdNodes.length>0;){var c=a.createdNodes.shift();j.apply(b.view.addDiyDom,[b.treeId,c]);b.callback.onNodeCreated&&b.treeObj.trigger(f.event.NODECREATED,[b.treeId,c])}},createNodes:function(b,a,c,d,e){if(c&&c.length!=0){var g=h.getRoot(b),j=b.data.key.children,
j=!d||d.open||!!k(d[j][0],b).get(0);g.createdNodes=[];var a=i.appendNodes(b,a,c,d,e,!0,j),o,n;d?(d=k(d,f.id.UL,b),d.get(0)&&(o=d)):o=b.treeObj;o&&(e>=0&&(n=o.children()[e]),e>=0&&n?q(n).before(a.join("")):o.append(a.join("")));i.createNodeCallback(b)}},destroy:function(b){b&&(h.initCache(b),h.initRoot(b),l.unbindTree(b),l.unbindEvent(b),b.treeObj.empty(),delete s[b.treeId])},expandCollapseNode:function(b,a,c,d,e){var g=h.getRoot(b),m=b.data.key.children,o;if(a){if(g.expandTriggerFlag)o=e,e=function(){o&&
o();a.open?b.treeObj.trigger(f.event.EXPAND,[b.treeId,a]):b.treeObj.trigger(f.event.COLLAPSE,[b.treeId,a])},g.expandTriggerFlag=!1;if(!a.open&&a.isParent&&(!k(a,f.id.UL,b).get(0)||a[m]&&a[m].length>0&&!k(a[m][0],b).get(0)))i.appendParentULDom(b,a),i.createNodeCallback(b);if(a.open==c)j.apply(e,[]);else{var c=k(a,f.id.UL,b),g=k(a,f.id.SWITCH,b),n=k(a,f.id.ICON,b);a.isParent?(a.open=!a.open,a.iconOpen&&a.iconClose&&n.attr("style",i.makeNodeIcoStyle(b,a)),a.open?(i.replaceSwitchClass(a,g,f.folder.OPEN),
i.replaceIcoClass(a,n,f.folder.OPEN),d==!1||b.view.expandSpeed==""?(c.show(),j.apply(e,[])):a[m]&&a[m].length>0?c.slideDown(b.view.expandSpeed,e):(c.show(),j.apply(e,[]))):(i.replaceSwitchClass(a,g,f.folder.CLOSE),i.replaceIcoClass(a,n,f.folder.CLOSE),d==!1||b.view.expandSpeed==""||!(a[m]&&a[m].length>0)?(c.hide(),j.apply(e,[])):c.slideUp(b.view.expandSpeed,e))):j.apply(e,[])}}else j.apply(e,[])},expandCollapseParentNode:function(b,a,c,d,e){a&&(a.parentTId?(i.expandCollapseNode(b,a,c,d),a.parentTId&&
i.expandCollapseParentNode(b,a.getParentNode(),c,d,e)):i.expandCollapseNode(b,a,c,d,e))},expandCollapseSonNode:function(b,a,c,d,e){var g=h.getRoot(b),f=b.data.key.children,g=a?a[f]:g[f],f=a?!1:d,j=h.getRoot(b).expandTriggerFlag;h.getRoot(b).expandTriggerFlag=!1;if(g)for(var k=0,l=g.length;k<l;k++)g[k]&&i.expandCollapseSonNode(b,g[k],c,f);h.getRoot(b).expandTriggerFlag=j;i.expandCollapseNode(b,a,c,d,e)},isSelectedNode:function(b,a){if(!a)return!1;var c=h.getRoot(b).curSelectedList,d;for(d=c.length-
1;d>=0;d--)if(a===c[d])return!0;return!1},makeDOMNodeIcon:function(b,a,c){var d=h.getNodeName(a,c),d=a.view.nameIsHTML?d:d.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");b.push("<span id='",c.tId,f.id.ICON,"' title='' treeNode",f.id.ICON," class='",i.makeNodeIcoClass(a,c),"' style='",i.makeNodeIcoStyle(a,c),"'></span><span id='",c.tId,f.id.SPAN,"' class='",f.className.NAME,"'>",d,"</span>")},makeDOMNodeLine:function(b,a,c){b.push("<span id='",c.tId,f.id.SWITCH,"' title='' class='",
i.makeNodeLineClass(a,c),"' treeNode",f.id.SWITCH,"></span>")},makeDOMNodeMainAfter:function(b){b.push("</li>")},makeDOMNodeMainBefore:function(b,a,c){b.push("<li id='",c.tId,"' class='",f.className.LEVEL,c.level,"' tabindex='0' hidefocus='true' treenode>")},makeDOMNodeNameAfter:function(b){b.push("</a>")},makeDOMNodeNameBefore:function(b,a,c){var d=h.getNodeTitle(a,c),e=i.makeNodeUrl(a,c),g=i.makeNodeFontCss(a,c),m=[],k;for(k in g)m.push(k,":",g[k],";");b.push("<a id='",c.tId,f.id.A,"' class='",
f.className.LEVEL,c.level,"' treeNode",f.id.A,' onclick="',c.click||"",'" ',e!=null&&e.length>0?"href='"+e+"'":""," target='",i.makeNodeTarget(c),"' style='",m.join(""),"'");j.apply(a.view.showTitle,[a.treeId,c],a.view.showTitle)&&d&&b.push("title='",d.replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),"'");b.push(">")},makeNodeFontCss:function(b,a){var c=j.apply(b.view.fontCss,[b.treeId,a],b.view.fontCss);return c&&typeof c!="function"?c:{}},makeNodeIcoClass:function(b,a){var c=["ico"];
a.isAjaxing||(c[0]=(a.iconSkin?a.iconSkin+"_":"")+c[0],a.isParent?c.push(a.open?f.folder.OPEN:f.folder.CLOSE):c.push(f.folder.DOCU));return f.className.BUTTON+" "+c.join("_")},makeNodeIcoStyle:function(b,a){var c=[];if(!a.isAjaxing){var d=a.isParent&&a.iconOpen&&a.iconClose?a.open?a.iconOpen:a.iconClose:a[b.data.key.icon];d&&c.push("background:url(",d,") 0 0 no-repeat;");(b.view.showIcon==!1||!j.apply(b.view.showIcon,[b.treeId,a],!0))&&c.push("width:0px;height:0px;")}return c.join("")},makeNodeLineClass:function(b,
a){var c=[];b.view.showLine?a.level==0&&a.isFirstNode&&a.isLastNode?c.push(f.line.ROOT):a.level==0&&a.isFirstNode?c.push(f.line.ROOTS):a.isLastNode?c.push(f.line.BOTTOM):c.push(f.line.CENTER):c.push(f.line.NOLINE);a.isParent?c.push(a.open?f.folder.OPEN:f.folder.CLOSE):c.push(f.folder.DOCU);return i.makeNodeLineClassEx(a)+c.join("_")},makeNodeLineClassEx:function(b){return f.className.BUTTON+" "+f.className.LEVEL+b.level+" "+f.className.SWITCH+" "},makeNodeTarget:function(b){return b.target||"_blank"},
makeNodeUrl:function(b,a){var c=b.data.key.url;return a[c]?a[c]:null},makeUlHtml:function(b,a,c,d){c.push("<ul id='",a.tId,f.id.UL,"' class='",f.className.LEVEL,a.level," ",i.makeUlLineClass(b,a),"' style='display:",a.open?"block":"none","'>");c.push(d);c.push("</ul>")},makeUlLineClass:function(b,a){return b.view.showLine&&!a.isLastNode?f.line.LINE:""},removeChildNodes:function(b,a){if(a){var c=b.data.key.children,d=a[c];if(d){for(var e=0,g=d.length;e<g;e++)h.removeNodeCache(b,d[e]);h.removeSelectedNode(b);
delete a[c];b.data.keep.parent?k(a,f.id.UL,b).empty():(a.isParent=!1,a.open=!1,c=k(a,f.id.SWITCH,b),d=k(a,f.id.ICON,b),i.replaceSwitchClass(a,c,f.folder.DOCU),i.replaceIcoClass(a,d,f.folder.DOCU),k(a,f.id.UL,b).remove())}}},scrollIntoView:function(b){if(b)if(b.scrollIntoViewIfNeeded)b.scrollIntoViewIfNeeded();else if(b.scrollIntoView)b.scrollIntoView(!1);else try{b.focus().blur()}catch(a){}},setFirstNode:function(b,a){var c=b.data.key.children;if(a[c].length>0)a[c][0].isFirstNode=!0},setLastNode:function(b,
a){var c=b.data.key.children,d=a[c].length;if(d>0)a[c][d-1].isLastNode=!0},removeNode:function(b,a){var c=h.getRoot(b),d=b.data.key.children,e=a.parentTId?a.getParentNode():c;a.isFirstNode=!1;a.isLastNode=!1;a.getPreNode=function(){return null};a.getNextNode=function(){return null};if(h.getNodeCache(b,a.tId)){k(a,b).remove();h.removeNodeCache(b,a);h.removeSelectedNode(b,a);for(var g=0,j=e[d].length;g<j;g++)if(e[d][g].tId==a.tId){e[d].splice(g,1);break}i.setFirstNode(b,e);i.setLastNode(b,e);var o,
g=e[d].length;if(!b.data.keep.parent&&g==0)e.isParent=!1,e.open=!1,g=k(e,f.id.UL,b),j=k(e,f.id.SWITCH,b),o=k(e,f.id.ICON,b),i.replaceSwitchClass(e,j,f.folder.DOCU),i.replaceIcoClass(e,o,f.folder.DOCU),g.css("display","none");else if(b.view.showLine&&g>0){var n=e[d][g-1],g=k(n,f.id.UL,b),j=k(n,f.id.SWITCH,b);o=k(n,f.id.ICON,b);e==c?e[d].length==1?i.replaceSwitchClass(n,j,f.line.ROOT):(c=k(e[d][0],f.id.SWITCH,b),i.replaceSwitchClass(e[d][0],c,f.line.ROOTS),i.replaceSwitchClass(n,j,f.line.BOTTOM)):i.replaceSwitchClass(n,
j,f.line.BOTTOM);g.removeClass(f.line.LINE)}}},replaceIcoClass:function(b,a,c){if(a&&!b.isAjaxing&&(b=a.attr("class"),b!=void 0)){b=b.split("_");switch(c){case f.folder.OPEN:case f.folder.CLOSE:case f.folder.DOCU:b[b.length-1]=c}a.attr("class",b.join("_"))}},replaceSwitchClass:function(b,a,c){if(a){var d=a.attr("class");if(d!=void 0){d=d.split("_");switch(c){case f.line.ROOT:case f.line.ROOTS:case f.line.CENTER:case f.line.BOTTOM:case f.line.NOLINE:d[0]=i.makeNodeLineClassEx(b)+c;break;case f.folder.OPEN:case f.folder.CLOSE:case f.folder.DOCU:d[1]=
c}a.attr("class",d.join("_"));c!==f.folder.DOCU?a.removeAttr("disabled"):a.attr("disabled","disabled")}}},selectNode:function(b,a,c){c||i.cancelPreSelectedNode(b,null,a);k(a,f.id.A,b).addClass(f.node.CURSELECTED);h.addSelectedNode(b,a);b.treeObj.trigger(f.event.SELECTED,[b.treeId,a])},setNodeFontCss:function(b,a){var c=k(a,f.id.A,b),d=i.makeNodeFontCss(b,a);d&&c.css(d)},setNodeLineIcos:function(b,a){if(a){var c=k(a,f.id.SWITCH,b),d=k(a,f.id.UL,b),e=k(a,f.id.ICON,b),g=i.makeUlLineClass(b,a);g.length==
0?d.removeClass(f.line.LINE):d.addClass(g);c.attr("class",i.makeNodeLineClass(b,a));a.isParent?c.removeAttr("disabled"):c.attr("disabled","disabled");e.removeAttr("style");e.attr("style",i.makeNodeIcoStyle(b,a));e.attr("class",i.makeNodeIcoClass(b,a))}},setNodeName:function(b,a){var c=h.getNodeTitle(b,a),d=k(a,f.id.SPAN,b);d.empty();b.view.nameIsHTML?d.html(h.getNodeName(b,a)):d.text(h.getNodeName(b,a));j.apply(b.view.showTitle,[b.treeId,a],b.view.showTitle)&&k(a,f.id.A,b).attr("title",!c?"":c)},
setNodeTarget:function(b,a){k(a,f.id.A,b).attr("target",i.makeNodeTarget(a))},setNodeUrl:function(b,a){var c=k(a,f.id.A,b),d=i.makeNodeUrl(b,a);d==null||d.length==0?c.removeAttr("href"):c.attr("href",d)},switchNode:function(b,a){a.open||!j.canAsync(b,a)?i.expandCollapseNode(b,a,!a.open):b.async.enable?i.asyncNode(b,a)||i.expandCollapseNode(b,a,!a.open):a&&i.expandCollapseNode(b,a,!a.open)}};q.fn.zTree={consts:{className:{BUTTON:"button",LEVEL:"level",ICO_LOADING:"ico_loading",SWITCH:"switch",NAME:"node_name"},
event:{NODECREATED:"ztree_nodeCreated",CLICK:"ztree_click",EXPAND:"ztree_expand",COLLAPSE:"ztree_collapse",ASYNC_SUCCESS:"ztree_async_success",ASYNC_ERROR:"ztree_async_error",REMOVE:"ztree_remove",SELECTED:"ztree_selected",UNSELECTED:"ztree_unselected"},id:{A:"_a",ICON:"_ico",SPAN:"_span",SWITCH:"_switch",UL:"_ul"},line:{ROOT:"root",ROOTS:"roots",CENTER:"center",BOTTOM:"bottom",NOLINE:"noline",LINE:"line"},folder:{OPEN:"open",CLOSE:"close",DOCU:"docu"},node:{CURSELECTED:"curSelectedNode"}},_z:{tools:j,
view:i,event:l,data:h},getZTreeObj:function(b){return(b=h.getZTreeTools(b))?b:null},destroy:function(b){if(b&&b.length>0)i.destroy(h.getSetting(b));else for(var a in s)i.destroy(s[a])},init:function(b,a,c){var d=j.clone(O);q.extend(!0,d,a);d.treeId=b.attr("id");d.treeObj=b;d.treeObj.empty();s[d.treeId]=d;if(typeof document.body.style.maxHeight==="undefined")d.view.expandSpeed="";h.initRoot(d);b=h.getRoot(d);a=d.data.key.children;c=c?j.clone(j.isArray(c)?c:[c]):[];b[a]=d.data.simpleData.enable?h.transformTozTreeFormat(d,
c):c;h.initCache(d);l.unbindTree(d);l.bindTree(d);l.unbindEvent(d);l.bindEvent(d);c={setting:d,addNodes:function(a,b,c,f){function h(){i.addNodes(d,a,b,l,f==!0)}a||(a=null);if(a&&!a.isParent&&d.data.keep.leaf)return null;var k=parseInt(b,10);isNaN(k)?(f=!!c,c=b,b=-1):b=k;if(!c)return null;var l=j.clone(j.isArray(c)?c:[c]);j.canAsync(d,a)?i.asyncNode(d,a,f,h):h();return l},cancelSelectedNode:function(a){i.cancelPreSelectedNode(d,a)},destroy:function(){i.destroy(d)},expandAll:function(a){a=!!a;i.expandCollapseSonNode(d,
null,a,!0);return a},expandNode:function(a,b,c,f,n){function l(){var b=k(a,d).get(0);b&&f!==!1&&i.scrollIntoView(b)}if(!a||!a.isParent)return null;b!==!0&&b!==!1&&(b=!a.open);if((n=!!n)&&b&&j.apply(d.callback.beforeExpand,[d.treeId,a],!0)==!1)return null;else if(n&&!b&&j.apply(d.callback.beforeCollapse,[d.treeId,a],!0)==!1)return null;b&&a.parentTId&&i.expandCollapseParentNode(d,a.getParentNode(),b,!1);if(b===a.open&&!c)return null;h.getRoot(d).expandTriggerFlag=n;!j.canAsync(d,a)&&c?i.expandCollapseSonNode(d,
a,b,!0,l):(a.open=!b,i.switchNode(this.setting,a),l());return b},getNodes:function(){return h.getNodes(d)},getNodeByParam:function(a,b,c){return!a?null:h.getNodeByParam(d,c?c[d.data.key.children]:h.getNodes(d),a,b)},getNodeByTId:function(a){return h.getNodeCache(d,a)},getNodesByParam:function(a,b,c){return!a?null:h.getNodesByParam(d,c?c[d.data.key.children]:h.getNodes(d),a,b)},getNodesByParamFuzzy:function(a,b,c){return!a?null:h.getNodesByParamFuzzy(d,c?c[d.data.key.children]:h.getNodes(d),a,b)},
getNodesByFilter:function(a,b,c,f){b=!!b;return!a||typeof a!="function"?b?null:[]:h.getNodesByFilter(d,c?c[d.data.key.children]:h.getNodes(d),a,b,f)},getNodeIndex:function(a){if(!a)return null;for(var b=d.data.key.children,c=a.parentTId?a.getParentNode():h.getRoot(d),f=0,i=c[b].length;f<i;f++)if(c[b][f]==a)return f;return-1},getSelectedNodes:function(){for(var a=[],b=h.getRoot(d).curSelectedList,c=0,f=b.length;c<f;c++)a.push(b[c]);return a},isSelectedNode:function(a){return h.isSelectedNode(d,a)},
reAsyncChildNodes:function(a,b,c){if(this.setting.async.enable){var j=!a;j&&(a=h.getRoot(d));if(b=="refresh"){for(var b=this.setting.data.key.children,l=0,q=a[b]?a[b].length:0;l<q;l++)h.removeNodeCache(d,a[b][l]);h.removeSelectedNode(d);a[b]=[];j?this.setting.treeObj.empty():k(a,f.id.UL,d).empty()}i.asyncNode(this.setting,j?null:a,!!c)}},refresh:function(){this.setting.treeObj.empty();var a=h.getRoot(d),b=a[d.data.key.children];h.initRoot(d);a[d.data.key.children]=b;h.initCache(d);i.createNodes(d,
0,a[d.data.key.children],null,-1)},removeChildNodes:function(a){if(!a)return null;var b=a[d.data.key.children];i.removeChildNodes(d,a);return b?b:null},removeNode:function(a,b){a&&(b=!!b,b&&j.apply(d.callback.beforeRemove,[d.treeId,a],!0)==!1||(i.removeNode(d,a),b&&this.setting.treeObj.trigger(f.event.REMOVE,[d.treeId,a])))},selectNode:function(a,b,c){function f(){if(!c){var b=k(a,d).get(0);i.scrollIntoView(b)}}if(a&&j.uCanDo(d)){b=d.view.selectedMulti&&b;if(a.parentTId)i.expandCollapseParentNode(d,
a.getParentNode(),!0,!1,f);else try{k(a,d).focus().blur()}catch(h){}i.selectNode(d,a,b)}},transformTozTreeNodes:function(a){return h.transformTozTreeFormat(d,a)},transformToArray:function(a){return h.transformToArrayFormat(d,a)},updateNode:function(a){a&&k(a,d).get(0)&&j.uCanDo(d)&&(i.setNodeName(d,a),i.setNodeTarget(d,a),i.setNodeUrl(d,a),i.setNodeLineIcos(d,a),i.setNodeFontCss(d,a))}};b.treeTools=c;h.setZTreeTools(d,c);b[a]&&b[a].length>0?i.createNodes(d,0,b[a],null,-1):d.async.enable&&d.async.url&&
d.async.url!==""&&i.asyncNode(d);return c}};var P=q.fn.zTree,k=j.$,f=P.consts})(jQuery);
