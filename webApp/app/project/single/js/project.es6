App.Project = {

	Settings: {
		projectId: "",
		projectVersionId: "",
		modelId: ""
	},

	GetRequest() {
		var url = location.search; //获取url中"?"符后的字串 
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

	//获取模型id
	getModelId: function() {
		var Request = App.Project.GetRequest();
		App.Project.Settings.projectId = Request.projectId;
		App.Project.Settings.projectVersionId = Request.projectVersionId;
		var data = {
			URLtype: "fetchFileModelIdByFileVersionId",
			data: {
				projectId: Request.projectId,
				projectVersionId: Request.projectVersionId
			}
		}

		var url = App.Project.getUrlByType(data).url;

		$.ajax({
			url: url,
			data: {
				fileVersionId: Request.id
			}
		}).done(function(data) {

			if (_.isString(data)) {
				// to json
				if (JSON && JSON.parse) {
					data = JSON.parse(data);
				} else {
					data = $.parseJSON(data);
				}
			}
			if (data.message == "success") {

				$(".header .name").text(data.data.name);

				document.title = data.data.name + "模型预览";

				App.Project.Settings.Model = data;

				if (data.data.modelId) {

					if (data.data.modelStatus == 1) {
						alert("模型转换中");
						return;
					} else if (data.data.modelStatus == 3) {
						alert("转换失败");
						return;
					}

					App.Project.Settings.Viewer = new BIM({
						single: true,
						element: $("#modelBox")[0],
						etag: data.data.modelId,
						tools: true
					});

					App.Project.Settings.modelId = data.data.modelId;
					App.Project.Settings.Viewer.on("click", function(model) {
						if (!model.intersect) {
							return;
						}

						//渲染属性
						App.Project.renderAttr(model.intersect.userId, model.intersect.object.userData.sceneId);

					});


				} else {
					if (data.data.modelStatus == null) {
						alert("模型未上传");
					} else {
						alert("模型转换中");
					}

				}
			} else {
				alert(data.message);
			}
		});
	},

	templateCache: [],

	//获取模板根据URL
	templateUrl: function(url, notCompile) {

		if (url.substr(0, 1) == ".") {
			url = "/static/dist/tpls" + url.substr(1);
		} else if (url.substr(0, 1) == "/") {
			url = "/static/dist/tpls" + url;
		}

		if (App.Project.templateCache[url]) {
			return App.Project.templateCache[url];
		}

		var result;
		$.ajax({
			url: url,
			type: 'GET',
			async: false
		}).done(function(tpl) {
			if (notCompile) {
				result = tpl;

			} else {
				result = _.template(tpl);
			}

		});

		App.Project.templateCache[url] = result;

		return result;
	},

	renderAttr(elementId) {


		var url = "/sixD/" + App.Project.Settings.projectId + "/" + App.Project.Settings.projectVersionId + "/property";
		$.ajax({
			url: url,
			data: {
				elementId: elementId,
				sceneId: App.Project.Settings.modelId
			}
		}).done(function(data) {
			var template = App.Project.templateUrl("/projects/tpls/project/design/project.design.property.properties.html");
			$("#projectContainer .designProperties").html(template(data.data));
		});

	},

	//渲染模型
	renderModel: function() {

		var Request = App.Project.GetRequest();
		App.Project.getModelId();
	},

	//下载
	downLoad() {

		var Request = App.Project.GetRequest();

		// //请求数据
		var data = {
			URLtype: "downLoad",
			data: {
				projectId: Request.projectId,
				projectVersionId: Request.projectVersionId
			}
		};

		var data = App.Project.getUrlByType(data);
		var url = data.url + "?fileVersionId=" + App.Project.Settings.Model.data.fileVersionId;
		window.location.href = url;

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

	bindEvent() {
		var that = this;
		//下载
		$(".header .downLoad").on("click", function() {
			App.Project.downLoad();
		});

		var $projectContainer = $("#projectContainer");
		//收起 暂开 属性内容
		$projectContainer.on("click", ".modleShowHide", function() {
			$(this).toggleClass("down");
			var $modleList = $(this).parent().find(".modleList");
			$modleList.slideToggle();
		});
		//收起 暂开 属性
		$projectContainer.on("click", ".slideBar", function() {

			that.navBarToggle($("#projectContainer .rightProperty"), $("#modelBox"), "right", App.Project.Settings.Viewer);
		});
		//拖拽 属性内容
		$projectContainer.on("mousedown", ".dragSize", function(event) {
			that.dragSize(event, $("#projectContainer .rightProperty"), $("#modelBox"), "right", App.Project.Settings.Viewer);
		});



	},

	init() {

		//渲染模型
		App.Project.renderModel();

		this.bindEvent();


	}
}