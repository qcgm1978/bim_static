;/*!/app/project/single/js/project.es6*/
"use strict";

App.Project = {

	Settings: {
		projectId: "",
		projectVersionId: "",
		fileId: "",
		fileVersionId: "",
		suffix: "",
		famHtml: "",
		axisHtm: "",
		modelId: ""
	},
	isIEModel: function isIEModel() {
		if ("ActiveXObject" in window || window.ActiveXObject) {
			window.location.href = '/ie.html?path=' + window.location.href;
			return true;
		}
	},
	GetRequest: function GetRequest() {
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
	getModelId: function getModelId() {
		var Request = App.Project.GetRequest();
		App.Project.Settings.projectId = Request.projectId;
		App.Project.Settings.projectVersionId = Request.projectVersionId;
		App.Project.Settings.fileVersionId = Request.id;
		var data = {
			URLtype: "fetchFileModelIdByFileVersionId",
			data: {
				projectId: Request.projectId,
				projectVersionId: Request.projectVersionId
			}
		};

		var url = App.Project.getUrlByType(data).url;

		$.ajax({
			url: url,
			data: {
				fileVersionId: Request.id
			}
		}).done(function (data) {
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
				App.Project.Settings.fileId = data.data.id;
				App.Project.Settings.fileVersionId = data.data.fileVersionId;
				App.Project.Settings.suffix = data.data.suffix;

				if (data.data.modelId) {

					if (data.data.modelStatus == 1) {
						alert("模型转换中");
						return;
					} else if (data.data.modelStatus == 3) {
						alert("转换失败");
						return;
					}

					//dwg 格式
					if (data.data.suffix == "dwg") {
						App.Project.renderDwg(data.data.modelId);
					} else {
						App.Project.renderOther(data.data.modelId, data.data.suffix);
					}
				} else {
					alert("模型转换中");
				}
			} else {
				alert(data.message);
			}
		});
	},

	// 除 dwg以外的格式
	renderOther: function renderOther(modelId, type) {
		var _this = this;
		var typeMap = {
			rte: 'singleModel',
			rvt: 'singleModel',
			rfa: 'familyModel'
		};
		$(".rightProperty").show();
		App.Project.Settings.Viewer = new bimView({
			element: $("#modelBox"),
			etag: modelId,
			type: typeMap[type],
			isComment: type == "rvt" && true || false,
			callback: function callback(id) {
				App.Project.renderAttr(id, 1);
			}
		});

		// 获取familyType
		App.Project.Settings.Viewer.on("changType", function (id) {
			if (id) {
				App.Project.Settings.typeId = id;
				App.Project.renderAttr(id, 2);
			}
		});

		App.Project.Settings.modelId = modelId;
		App.Project.Settings.Viewer.on("click", function (model) {
			if (!model.intersect) {
				App.Project.renderAttr(App.Project.Settings.typeId, 2);
				return;
			}
			//渲染属性
			App.Project.renderAttr(model.intersect.userId);
		});

		App.Project.Settings.Viewer.on('empty', function () {
			$('.tips span').html('无法三维预览，请<a href="javascript:;" onclick="App.Project.downLoad();" style="font-size:20px;text-decoration:underline;color:#CFCFCF;">下载</a>查看');
		});
	},


	//渲染dwg 文件
	renderDwg: function renderDwg(modelId) {

		$("#modelBox").addClass("dwg");

		App.Project.Settings.Viewer = new dwgViewer({
			element: $("#modelBox"),
			isComment: true,
			sourceId: modelId
		});
	},


	//模型属性 dwg 图纸
	attrDwg: function attrDwg() {

		var that = this,
		    url = '/doc/' + App.Project.Settings.projectId + '/' + App.Project.Settings.projectVersionId + '/file/tag',
		    liTpl = '<li class="modleItem"><a data-id="<%=id%>" href="/static/dist/app/project/single/filePreview.html?id={id}&projectId=' + App.Project.Settings.projectId + '&projectVersionId=' + App.Project.Settings.projectVersionId + '" target="_blank" ><div class="modleNameText overflowEllipsis modleName2">varName</div></a></li>';

		that = this;

		$.ajax({
			url: url,
			data: {
				modelId: App.Project.Settings.modelId
			}
		}).done(function (data) {

			if (data.code == 0) {
				if (data.data.length > 0) {
					var lis = '';
					$.each(data.data, function (i, item) {
						lis += liTpl.replace("varName", item.name).replace('{id}', item.id);
					});
					$("#projectContainer .attrDwgBox").show().find(".modleList").html(lis);
				}
			}
		});
	},

	templateCache: [],

	//获取模板根据URL
	templateUrl: function templateUrl(url, notCompile) {

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
		}).done(function (tpl) {
			if (notCompile) {
				result = tpl;
			} else {
				result = _.template(tpl);
			}
		});

		App.Project.templateCache[url] = result;

		return result;
	},

	//type 1 轴 其他属性 2 changeType
	renderAttr: function renderAttr(elementId, type) {

		var url = "/sixD/" + App.Project.Settings.projectId + "/" + App.Project.Settings.projectVersionId + "/property",
		    that = this;

		$.ajax({
			url: url,
			data: {
				elementId: elementId,
				sceneId: App.Project.Settings.modelId
			}
		}).done(function (data) {
			var template = App.Project.templateUrl("/projects/tpls/project/design/project.design.property.properties.html"),
			    html = template(data.data);

			that.attrDwg(elementId);

			if (type == 1) {
				App.Project.Settings.famHtml = html;
			} else {
				if (type == 2) {

					if (App.Project.Settings.famHtml) {
						$("#projectContainer .designProperties").html(App.Project.Settings.famHtml);
						$("#projectContainer .designProperties").append(html);
					} else {
						App.Project.Settings.axisHtm = html;
						App.Project.renderAxisComm();
					}
				} else {
					$("#projectContainer .designProperties").html(html);
				}
			}
		});
	},


	//渲染轴公共
	renderAxisComm: function renderAxisComm() {

		//定时监听 是否返回
		App.Project.Settings.timer = setTimeout(function () {

			clearTimeout(App.Project.Settings.timer);
			if (App.Project.Settings.famHtml) {
				//公共信息
				$("#projectContainer .designProperties").html(App.Project.Settings.famHtml);
				//本身信息
				$("#projectContainer .designProperties").append(App.Project.Settings.axisHtm);
			} else {
				App.Project.renderAxisComm();
			}
		}, 200);
	},


	//渲染模型
	renderModel: function renderModel() {

		var Request = App.Project.GetRequest();
		App.Project.getModelId();
	},

	//下载
	downLoad: function downLoad() {

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
	navBarToggle: function navBarToggle($el, $content, dirc, Viewer) {

		var dircWidth, mDirc;
		if (dirc == "left") {
			mDirc = "margin-left";
		} else {
			mDirc = "margin-right";
		}

		dircWidth = parseInt($el.css(mDirc));

		if (dircWidth < 0) {

			var ani = {};
			ani[mDirc] = "0px";

			$el.animate(ani, 500, function () {
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
			$el.animate(ani, 500, function () {
				$el.find(".dragSize").hide().end().find(".slideBar i").toggleClass('icon-caret-left icon-caret-right');
				$content.css(mDirc, 0);
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

	bindEvent: function bindEvent() {
		var that = this;
		//下载
		$(".header .downLoad").on("click", function () {
			App.Project.downLoad();
		});

		var $projectContainer = $("#projectContainer");
		//收起 暂开 属性内容
		$projectContainer.on("click", ".modleShowHide", function () {
			$(this).toggleClass("down");
			var $modleList = $(this).parent().parent().find(".modleList");
			$modleList.slideToggle();
		});
		//收起 暂开 属性
		$projectContainer.on("click", ".slideBar", function () {

			that.navBarToggle($("#projectContainer .rightProperty"), $("#modelBox"), "right", App.Project.Settings.Viewer);
		});
		//拖拽 属性内容
		$projectContainer.on("mousedown", ".dragSize", function (event) {
			that.dragSize(event, $("#projectContainer .rightProperty"), $("#modelBox"), "right", App.Project.Settings.Viewer);
		});
	},
	init: function init() {

		if (this.isIEModel()) {
			return;
		}

		//渲染模型
		App.Project.renderModel();

		this.bindEvent();
	}
};
(function () {

	if (typeof bimView == "undefined") {
		bimView = {
			sidebar: {}
		};
	}

	//重写批注方法
	bimView.sidebar.comment = function () {
		//隐藏工具条
		$(".bim .modelBar").hide();
		//开始批注
		App.Project.Settings.Viewer.comment();

		//禁止 二次 点击
		if ($("#topSaveTip").length > 0) {
			return;
		}

		var topSaveHtml = App.Project.templateUrl('/libsH5/tpls/comment/bimview.top.save.tip.html', true);

		$(".bim .commentBar").append(topSaveHtml);

		//事件初始化
		SingleComment.initEvent();
	};

	if (typeof dwgViewer == "undefined") {
		dwgViewer = {
			prototype: {}
		};
	}

	dwgViewer.prototype.comment = function () {

		this.dwgView.commentInit();
		//隐藏工具条
		$(".bim .modelBar").hide();
	};

	//取消批注
	dwgViewer.prototype.canelComment = function () {
		$(".bim .modelBar").show();
	};

	//保存批注
	dwgViewer.prototype.saveCommentDwg = function () {
		var that = this;
		this.dwgView.getCommentData(function (data) {

			data.image = data.image.replace('data:image/png;base64,', '');
			that.data = data;
			SingleComment.saveCommentDialog();
		});
	};

	dwgViewer.prototype.getData = function () {
		return this.data;
	};

	var SingleComment = {

		initEvent: function initEvent() {

			var $topSaveTip = $("#topSaveTip"),
			    that = this;

			//取消
			$topSaveTip.on("click", ".btnCanel", function () {
				App.Project.Settings.Viewer.commentEnd();
				//显示
				$(".bim .modelBar").show();
			});

			//保存
			$topSaveTip.on("click", ".btnSave", function () {
				that.saveCommentDialog();
			});
		},

		//保存批注
		saveCommentDialog: function saveCommentDialog() {
			//批注信息
			var data = App.Project.Settings.Viewer.saveComment && App.Project.Settings.Viewer.saveComment() || App.Project.Settings.Viewer.getData(),
			    pars = {
				cate: "viewPoint",
				img: data.image
			},
			    that = this;

			var dialogHtml = App.Project.templateUrl('/libsH5/tpls/comment/bimview.save.dialog.html')(pars),
			    opts = {
				title: "保存快照",
				width: 500,
				height: 250,
				cssClass: "saveViewPoint",
				okClass: "btnWhite",
				cancelClass: "btnWhite",
				okText: "保存",
				closeCallback: function closeCallback() {

					App.Project.Settings.Viewer.commentEnd();
					//显示
					$(".bim .modelBar").show();
				},

				cancelText: "保存并分享",

				message: dialogHtml,

				okCallback: function okCallback() {

					that.saveComment("save", dialog, data);
					return false;
				},
				cancelCallback: function cancelCallback() {
					//保存并分享
					that.saveComment("share", dialog, data, SingleComment.shareViewPoint);
					return false;
				}
			},
			    dialog = new App.Dialog(opts),
			    $viewPointType = dialog.element.find(".viewPointType");

			dialog.type = 1;
			//视点类型
			$viewPointType.myDropDown({
				click: function click($item) {
					var type = $item.data("type");
					if (type == 0) {
						$viewPointType.find(".modelicon").removeClass('m-unlock').addClass('m-lock');
					} else {
						$viewPointType.find(".modelicon").removeClass('m-lock').addClass('m-unlock');
					}

					dialog.type = type;
				}
			});
		},

		//保存批注
		saveComment: function saveComment(type, dialog, commentData, callback) {
			var _this2 = this;

			if (dialog.isSubmit) {
				return;
			}
			var $element = dialog.element,
			    pars = {
				projectId: App.Project.Settings.projectId,
				name: dialog.element.find(".name").val().trim(),
				type: dialog.type,
				viewPoint: commentData.camera
			};

			if (!pars.name) {
				$.tip({
					message: "请输入快照描述",
					timeout: 3000,
					type: "alarm"
				});
				return false;
			}

			var url = '/sixD/{projectId}/viewPoint?fileId=' + App.Project.Settings.fileId + "&fileVersionId=" + App.Project.Settings.fileVersionId + "&suffix=" + App.Project.Settings.suffix,
			    data = {
				url: url,
				data: JSON.stringify(pars),
				type: "POST",
				contentType: "application/json"
			};

			if (type == "save") {
				dialog.element.find(".ok").text("保存中");
			} else {
				dialog.element.find(".cancel").text("保存中");
			}
			//保存中
			dialog.isSubmit = true;

			//创建
			App.ajax(data, function (data) {

				if (data.code == 0) {

					data = data.data;
					//赋值id
					commentData.id = data.id;
					//保存 图片 canvas filter
					$.when(_this2.saveImage({
						id: data.id,
						img: commentData.image
					}), _this2.saveAnnotation(commentData)).done(function (imgData, annotationData) {

						imgData = imgData[0];

						annotationData = annotationData[0];
						//成功
						if (imgData.code == 0 && annotationData.code == 0) {

							//关闭弹出层 取消编辑状态
							dialog.close();
							//显示
							App.Project.Settings.Viewer.commentEnd();
							//显示
							$(".bim .modelBar").show();

							$("#topSaveTip .btnCanel").click();

							if ($.isFunction(callback)) {
								callback(imgData.data);
							}
						}
					});
				} else {
					//失败
					alert(data.message);
					if (type == "save") {
						dialog.element.find(".ok").text("保存");
					} else {
						dialog.element.find(".cancel").text("保存并分享");
					}
					dialog.isSubmit = false;
				}
			});
		},


		//保存图片
		saveImage: function saveImage(data) {
			//数据
			var formdata = new FormData();
			formdata.append("fileName", +new Date() + ".png");
			formdata.append("size", data.img.length);
			formdata.append("file", data.img);
			var url = '/sixD/' + App.Project.Settings.projectId + '/viewPoint/' + data.id + '/pic';
			return $.ajax({
				url: url,
				type: "post",
				data: formdata,
				processData: false,
				contentType: false
			});
		},

		//保存批注数据
		saveAnnotation: function saveAnnotation(commentData) {

			var pars = {
				projectId: App.Project.Settings.projectId,
				viewPointId: commentData.id,
				annotations: commentData.list
			},
			    data = {
				url: "/sixD/{projectId}/viewPoint/{viewPointId}/annotation",
				type: "POST",
				contentType: 'application/json',
				data: JSON.stringify(pars)
			};

			return App.ajax(data);
		},


		//分享视点
		shareViewPoint: function shareViewPoint(obj) {

			obj.pic = "/" + obj.pic;
			var data = {
				url: '/sixD/sharedViewpoint',
				type: "POST",
				contentType: 'application/json',
				data: JSON.stringify({
					projectId: App.Project.Settings.projectId,
					projectVersionId: App.Project.Settings.projectVersionId,
					viewpointId: obj.id
				})
			};

			App.ajax(data, function (data) {

				if (data.code == 0) {
					obj.url = data.data.url;
					var dialogHtml = App.Project.templateUrl('/libsH5/tpls/comment/bimview.share.dialog.html')(obj),
					    opts = {
						title: "分享快照",
						width: 500,
						height: 250,
						cssClass: "saveViewPoint",
						isConfirm: false,
						message: dialogHtml
					},
					    dialog = new App.Dialog(opts),
					    $btnCopy = dialog.element.find(".btnCopy");

					//h5 复制
					var clipboard = new Clipboard(".saveViewPoint .btnCopy");
					clipboard.on('success', function (e) {
						$.tip({
							message: "您已经复制了链接地址",
							timeout: 3000
						});
						//alert("您已经复制了链接地址");
						e.clearSelection();
					});
				}
			});
		}
	};
})();
;/*!/app/project/single/js/comm.js*/
/**
 * author: zhangyy-g@grandsoft.com.cn
 * description: dialog
 */
;(function($) {
    var Dialog = function(options) {
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
            readyFn: null,
            closeCallback: jQuery.noop
        }
        jQuery.extend(this.options, options)
        this.init()
    }
    Dialog.prototype = {
        init: function(message, options) {
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
        __getElement: function() {
            var fragment = ['<div class="mod-dialog">', '<div class="wrapper">', '<div class="header">', '<h3 class="title">',
                this.options.title, '</h3>',
                this.options.minify ? '<a class="minify">最小</a>' : '', '<a class="close"></a>', '</div>', '<div class="content">',
                '</div>', '</div>', '</div>'
            ].join('')
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
        reLocation: function() {
            // 定位
            this.__offset()
        },

        __dragable: function() {
            var element = this.element
            element.draggable && element.draggable({
                containment: 'window',
                handle: '.header'
            })
        },

        //居中
        __offset: function() {
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

            element.css({
                left: left,
                top: top
            }).data('top', top)
        },

        //设置宽度
        setWith: function(width) {
            // 设置样式
            this.element.css({
                width: width
            })
            this.options.width = width
        },

        //获得头部
        getHeader: function() {
            return this.find('.wrapper > .header')
        },

        //获得尾部
        getFooter: function() {
            return this.find('.wrapper > .footer')
        },

        //获得遮罩
        getMaskLayer: function() {
            return MaskLayer.getElement()
        },

        //显示
        show: function() {
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
            }, 300)
        },

        //关闭
        close: function(keepMask) {
            var self = this;
            !keepMask && MaskLayer.hide()
            var element = self.element
            var top = element.data('top')
            element.animate({
                top: top - 20,
                filter: 'alpha(opacity=0)',
                opacity: 0
            }, 300, function() {
                element.remove()
            })
        },

        //最小化
        hide: function() {
            MaskLayer.hide()
            this.element.css('top', '-9999px')
        },

        //查找元素
        find: function(rule) {
            return this.element.find(rule)
        },

        //确认
        confirm: function() {
            var self = this
            self.element.find('.footer .ok').trigger('click')
        },


        bindEvent: function() {
            var self = this
            this.find('.header .close').click(function() {
                self.options.closeCallback.call(self)
                self.close()
                return false
            })
            this.find('.header .minify').click(function() {
                self.hide()
                return false
            })
            this.element.find('.footer .ok').click(function() {
                if (self.options.okCallback.call(self) !== false) {
                    self.close()
                }
                return false
            })
            this.element.find('.footer .cancel').click(function() {
                if (self.options.cancelCallback.call(self) !== false) {
                    self.close()
                }
                return false
            })

            var contextProxy = function() {
                // 防止销魂元素后导致内存泄露（因为RESIZE事件是注册在WINDOW对象上 而不是ELEMENT元素上）
                if (self.element.parent().size() === 0) {
                    jQuery(window).unbind('resize', contextProxy)
                } else if (self.element.is(':visible')) {
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
        showError: function(text) {
            var self = this,
                error = self.find('.error')
            if (error.size() == 0) {
                error = $('<div class="error"><i class="dialog-error"></i><span class="error-info"></span></div>').prependTo(self.getFooter())
            }

            error.find('.error-info').html(text).show()
        },
        hideError: function() {
            this.find('.error').hide()
        }
    }

    //遮罩层
    var MaskLayer = {
        getElement: function() {
            if (!this.element) {
                this.element = jQuery('#mod-dialog-masklayer')
                if (this.element.size() == 0) {
                    this.element = jQuery('<div class="mod-dialog-masklayer" />').appendTo($(document.body))
                }
            }
            return this.element
        },
        show: function() {
            this.getElement().show()
        },
        hide: function() {
            this.getElement().hide()
        }
    }

    // 弹窗单例管理
    var DialogManager = {
        present: null,

        keepSingle: function(dialog) {
            if (this.present instanceof Dialog) {
                this.present.close()
                this.present = null
            }
            this.present = dialog
            this.bindEvent()
        },

        escCancel: function(e) {
            if (e.keyCode == 27 && DialogManager.present) {
                var dialog = DialogManager.present,
                    element = dialog.element
                if ($.isFunction(dialog.options.closeCallback)) {
                    dialog.options.closeCallback();
                }
                dialog.hide()
            }
        },

        bindEvent: function() {
            jQuery(document).keydown(this.escCancel)
            this.bindEvent = jQuery.noop
        }
    }

    // export public method
    App.Dialog = Dialog

})(jQuery)


;
(function($) {



    $.fn.myDropDown = function(opts) {

        var settings = {
            click: null, //点击事件
            zIndex: 9
        }

        this.settings = $.extend(settings, opts);

        //z-index
        $(this).css("z-index", this.settings.zIndex);


        this.init = function() {
            this.bindEvent();
        }

        this.bindEvent = function() {
            var $that = $(this),
                that = this;
            $that.on("click", ".myDropText", function() {
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


            $that.on("click", ".myDropList .myItem", function() {

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


            $(document).on("click.myDropDown", function(event) {

                var $target = $(event.target);
                if ($target.closest($that).length <= 0) {
                    $that.find(".myDropList").hide().end().find(".myDropArrorw").removeClass('down');
                }
            });

        }

        this.init();
    }


})(jQuery);


$.tip = function(options) {
    var defaults = {
        type: 'success',
        message: 'hello',
        timeout: 2000
    }
    options = $.extend({}, defaults, options);
    var tpl = '<div class="mmhTip"><div class="content ' + options.type + '"><i></i>' + options.message + '</div></div>';
    var _self = $(tpl).appendTo($('body'));
    _self.animate({
        top: '40px'
    }, 1000)
    setTimeout(function() {
        _self.remove();
    }, options.timeout)
}



//封装ajax
App.ajax = function(data, callback) {

    if (!data) {
        return;
    }

    data = App.getUrlByType(data);


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

}

App.getUrlByType = function(data) {

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

    if (data.url.indexOf("?") > -1) {
        data.url += "&t=" + (+new Date);
    } else {
        data.url += '?t=' + (+new Date);
    }

    return data;

}

Date.prototype.format = function(fmt) { //author: meizz  

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
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
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