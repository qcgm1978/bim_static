;/*!/imbox/collections/index.es6*/
'use strict';

App.INBox = {
	init: function init() {
		$('#pageLoading').hide();
		$('#dataLoading').hide();
		$("#topBar li").hide();
		$("#topBar li.imbox").show();
		$("#topBar li.user").show();
		$("#contains").html(new App.INBox.NavView().render().$el);
		$("#contains").append(new App.INBox.imboxContainerView().render().$el);
		this.loadData('un');
		App.Comm.loadMessageCount();
		// this.messageCollection.fetch({
		// 	reset:true,
		// 	data:{
		// 		status:0
		// 	},
		// 	success:function(collection, response, options){
		// 		collection.relData=response;
		// 	}
		// });
	},
	read: function read(id, _this, projectId, version, shareId) {
		//window.open(App.API.Settings.hostname+"platform/message/read?id="+id);
		if ($(_this).data('status') == 0) {
			App.Comm.loadMessageCount(-1);
			$(_this).closest('li').remove();
		}
		this.id = id;
		//	this.loadData('un');
		//location.reload();
		//发送已读状态
		$.ajax({
			url: App.API.Settings.hostname + "platform/message/read?flag=1&id=" + id
		}).done(function (data) {
			//console.log(data)

		});
		//弹窗显示详情
		$('#comment').show();
		App.INBox.comment.init(id, projectId, version, shareId, _this);
	},


	messageCollection: new (Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ''
				};
			}
		}),
		urlType: "fetchIMBoxList",
		parse: function parse(response) {
			return response.data;
		}
	}))(),

	messageAllCollection: new (Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ''
				};
			}
		}),
		urlType: "fetchIMBoxList",
		parse: function parse(response) {
			return response.data;
		}
	}))(),

	loadData: function loadData(type, index, size) {
		if (type == 'all') {
			this.messageAllCollection.fetch({
				reset: true,
				data: {
					pageIndex: index || 1,
					pageItemCount: size || 10
				}
			});
		} else {
			this.messageCollection.fetch({
				reset: true,
				data: {
					pageIndex: index || 1,
					pageItemCount: size || 10,
					status: 0
				}
			});
		}
	}
};

App.INBox.comment = {
	init: function init(id, projectId, version, shareId, _this) {
		var AppView = new this.CommentView.App().render();
		App.Project = {
			Settings: {
				projectId: projectId
			}
		};
		$comment = $('<div id="comment"></div>');

		//生成
		$comment.html(AppView.$el);

		this.maskWindow = new App.Comm.modules.Dialog({ title: '', width: 600, height: 500, isConfirm: false });
		$('.mod-dialog .wrapper').html($comment);

		CommentCollections.ViewComments.reset();
		CommentCollections.ViewComments.projectId = projectId;
		CommentCollections.ViewComments.viewPointId = shareId;
		viewPointId = shareId;

		CommentCollections.ViewComments.fetch({
			success: function success(model, data) {
				$(".commentRemark .remarkBox .count").text(data.data.length);
				this.$(".reMarkListBox").css("bottom", this.$(".talkReMark").height() + 10);
				$comment.find(".fullLoading").hide();
			}
		});
		$('.wrapper .title').text($(_this).text());
		//获取头部信息
		$.ajax({
			url: "/sixD/" + projectId + '/viewPoint/' + viewPointId
		}).done(function (data) {
			console.log(data);
			var html = _.templateUrl('./imbox/tpls/comment.remark.list.html')(data.data);
			$('.viewPointInfo').html(html);
		});
	},
	CommentView: {

		//入口
		App: Backbone.View.extend({

			tagName: "div",

			className: "commentListBox",

			events: {
				"click .navBar .item": "itemClick"
			},

			template: _.templateUrl('./imbox/tpls/comment.html'),

			//渲染
			render: function render() {
				//模板
				this.$el.html(this.template({}));

				//评论
				this.$(".commentRemark").html(new App.INBox.comment.CommentView.ReMark().render().$el);

				return this;
			},


			//导航
			itemClick: function itemClick(event) {

				var $el = $(event.target).closest(".item"),
				    type = $el.data("type");

				//项目视点
				if (type == "project") {

					this.$(".projectListBox").fadeIn("fast");
					//this.$(".projectListScroll").animate({left:"0px" },300);
					if (App.Project && App.Project.Settings.isShare) {
						//获取数据
						CommentCollections.Share.token = App.Project.Settings.token;
						CommentCollections.Share.reset();
						CommentCollections.Share.fetch({
							success: function success() {

								$(".projectList .item:first").click();
							}
						});
					} else {
						//获取数据
						CommentCollections.Project.projectId = App.Project.Settings.projectId;
						CommentCollections.Project.reset();
						CommentCollections.Project.fetch({
							success: function success() {

								//存在viewpintid 调到评论
								if (App.Project.Settings.viewPintId && isFirst) {
									isFirst = false;
									var $remark = $comment.find(".remarkCount_" + App.Project.Settings.viewPintId);
									$remark.closest(".item").click();
									$remark.click();
								}
							}
						});
					}

					$el.addClass("selected").siblings().removeClass("selected");

					//绑定滚动条
					App.Comm.initScroll(this.$(".projectListScroll"), "y");
				} else if (type == "user") {
					//个人视点
					this.$(".projectListBox").fadeOut("fast");
					//this.$(".projectListScroll").animate({left:"-406px" },300);
					//获取数据
					CommentCollections.User.projectId = App.Project.Settings.projectId;
					CommentCollections.User.reset();
					CommentCollections.User.fetch();

					$el.addClass("selected").siblings().removeClass("selected");
					//绑定滚动条
					App.Comm.initScroll(this.$(".userListScroll"), "y");
				} else if (type == "save") {
					//禁止 二次 点击
					if ($("#topSaveTip").length > 0) {
						return;
					}
					//保存
					CommentApi.saveCommentStart(null, 'viewPoint', null);
				}
			}
		}),

		//评论
		ReMark: Backbone.View.extend({

			tagName: "div",

			className: "reMarkBox",

			events: {
				"click .btnUploadImg": "triggerUpload", //上传图片
				"change .uploadImg": "uploadImg", //开始上传
				"click .goList": "goList",
				"click .btnEnter": "sendComment",
				"click .delUploadImg": "removeImg", //移除图片
				"focus .txtReMark": "inputReMark", //输入评论
				"blur .txtReMark": "outReMark", //失去焦点
				"click .iconShare": "share", //分享
				"click .operators": "close", //关闭
				"click .iconEdit": "reNameViewPoint", //编辑视点
				"click .btnAdress": "address", //地址
				"click .btnCommViewPoint": "commentViewPoint",
				"click .viewPointInfo .info": "viewPointShow",
				"click .btnLogin": "login", //登陆,
				"click .remarkCount": "go" //跳转,
			},

			initialize: function initialize() {
				this.listenTo(CommentCollections.ViewComments, "add", this.addOne);
				this.listenTo(CommentCollections.ViewComments, "reset", this.reLoading);
				this.listenTo(CommentCollections.ViewComments, "dataNull", this.dataNull);
			},


			template: _.templateUrl('./imbox/tpls/comment.remark.html')(),

			//渲染
			render: function render() {
				//模板
				this.$el.html(this.template);

				this.$(".txtReMark").at({

					getData: function getData(name) {

						//返回数据源
						var data = {
							URLtype: "autoComplateUser",
							data: {
								projectId: App.Project.Settings.projectId,
								name: name
							}
						};
						return App.Comm.ajax(data);
					},

					callback: function callback($item) {
						//点击单个用户回调
						atUserArr.push({
							userId: $item.data("uid") + "",
							userName: $item.find(".name").text().trim()
						});
					}
				});
				return this;
			},


			//跳转
			go: function go() {
				window.open(App.API.Settings.hostname + "platform/message/read?id=" + App.INBox.id);
				this.close();
			},


			//显示视点
			viewPointShow: function viewPointShow(event) {

				var $item = $(event.target).closest(".viewPointInfo");
				//项目模型
				if ($comment.find(".remarkCount.current").closest(".item").data("hosttype") == 0) {
					//移除选中
					$comment.find(".reMarkBox .selected").removeClass("selected");
					//显示批注
					CommentApi.showComment($item);
				} else {
					//事件会重复冒泡
					if (!$item.data("isClick")) {
						//阻止冒泡 之后 需要恢复
						$item.data("isClick", true);
						$item.find(".linkImg").click();
						//恢复
						var timer = setTimeout(function () {
							clearTimeout(timer);
							$item.data("isClick", false);
						}, 10);
					}
				}
			},


			//评论视点
			commentViewPoint: function commentViewPoint() {
				var _this2 = this;

				CommentApi.saveCommentStart(null, "commentViewPoint", function (data) {

					//上传地址或者评论视点后
					CommentApi.afterUploadAddressViewPoint.call(_this2, {
						pictureUrl: data.pic,
						description: data.name,
						id: data.id
					});

					//显示
					$(".modelSidebar").addClass("show open");
				});
			},


			//保存位置
			address: function address() {
				var _this3 = this;

				//直接保存
				CommentApi.saveCommentStart(null, "address", function (data) {
					//上传地址或者评论视点后
					CommentApi.afterUploadAddressViewPoint.call(_this3, data);
					//显示
					$(".modelSidebar").addClass("show open");
				});
				$("#topSaveTip .btnSave").click();
			},


			//编辑批注
			reNameViewPoint: function reNameViewPoint() {
				var $data = $(event.target).closest(".reMarkBox").find(".viewPointInfo");
				CommentApi.reName($data);
			},


			//分享
			share: function share(event) {
				var $data = $(event.target).closest(".reMarkBox").find(".viewPointInfo");
				CommentApi.shareViewPointData($data);
			},
			login: function login() {
				//初始化登陆
				App.Project.Share.initLogin();
			},


			//上传图片
			triggerUpload: function triggerUpload() {

				var url = "sixD/" + App.Project.Settings.projectId + "/viewPoint/" + viewPointId + "/comment/pic";

				if (App.Project && App.Project.Settings.isShare) {

					url = App.Comm.getUrlByType({
						URLtype: "uploadPicByToken",
						data: {
							auth: App.Project.Settings.token
						}
					}).url;
				}

				$("#viewPointUploadImageForm").prop("action", url);
				//上传完成
				if (!this.bindUpload) {
					this.uploadSuccess();
					this.bindUpload = true;
				}

				return this.$(".uploadImg").click();
			},
			uploadImg: function uploadImg() {

				//提交
				$("#viewPointUploadImageForm").submit();

				var imgLoadHTML = _.templateUrl('/libsH5/tpls/comment/upload.img.html', true);

				this.$(".uploadImgs").append(imgLoadHTML);

				this.listHeight();
			},
			close: function close() {
				setTimeout(function () {
					$('.mod-dialog.ui-draggable,.mod-dialog-masklayer,#lightboxOverlay,#lightbox').hide();
				}, 100);
			},


			//图片上传成功
			uploadSuccess: function uploadSuccess(event) {

				var that = this;

				$("#viewPintUploadIframe").on("load", function (event) {

					var data = JSON.parse(this.contentDocument.body.innerText);
					if (data.code == 0) {

						data = data.data;

						that.$(".uploading:first").find(".talkImg").prop("src", "/" + data.pictureUrl).show().end().find(".imgName").text(data.description).addClass("upload").end().find(".delUploadImg").show().end().data("id", data.id).removeClass("uploading");
						$('.uploadImg').val('');
					}
				});
			},


			//删除图片
			removeImg: function removeImg(event) {
				$(event.target).closest(".singleImg").remove();
				$('.uppic').empty();
			},


			//新增数据
			addOne: function addOne(model) {

				//模板数据
				var $list = new App.INBox.comment.CommentView.ReMarkListDetail({
					model: model
				}).render().$el,
				    $reMarkList = this.$(".reMarkList");

				$reMarkList.append($list);
				//移除加载
				$reMarkList.find(".loading").remove();
				//滚动条
				App.Comm.initScroll(this.$(".reMarkListScroll"), "y");
			},


			//加载数据
			reLoading: function reLoading() {
				this.$(".reMarkList").html('<li class="loading">正在加载，请稍候……</li>');
			},


			//无数据
			dataNull: function dataNull() {
				this.$(".reMarkList").html('<li class="loading">暂无评论</li>');
			},


			//返回列表
			goList: function goList() {

				$(".remarkCount.current").removeClass("current").find(".count").text($(".commentRemark .remarkBox .count").text());

				// $comment.find(".commentList").animate({
				// 	left: "0px"
				// }, 500);
				// $comment.find(".commentRemark").show().animate({
				// 	left: "330px"
				// }, 500);

				$comment.find(".commentList").css("left", "0px");
				$comment.find(".commentRemark").show().css("left", "330px");
			},


			//获取到焦点
			inputReMark: function inputReMark(event) {
				$(event.target).addClass("input");
				//列表高度
				this.listHeight();
			},


			//失去焦点
			outReMark: function outReMark(event) {
				var _this4 = this;

				var timer = setTimeout(function () {
					if (!$(event.target).is(":focus")) {
						$(event.target).removeClass("input");
						//列表高度
						_this4.listHeight();
					}
				}, 500);
			},


			//计算列表高度
			listHeight: function listHeight() {
				this.$(".reMarkListBox").css("bottom", this.$(".talkReMark").height() + 10);
			},


			//发表评论
			sendComment: function sendComment(event) {
				var _this5 = this;

				var $btnEnter = $(event.target);

				if ($btnEnter.data("isSubmit")) {
					return;
				}

				if (this.$(".uploading").length > 0) {
					$.tip({
						message: "图片上传中",
						timeout: 3000,
						type: "alarm"
					});
					//alert('图片上传中');
					return;
				}
				//图片
				var pictures = [];

				this.$(".singleImg").each(function () {
					pictures.push($(this).data("id"));
				});
				var texts = this.$(".txtReMark").val().trim().split('@'),
				    textsUniq = [],
				    atUserArrs = [];
				for (var i = 1; i < texts.length; i++) {
					_.contains(textsUniq, texts[i].split(' ')[0]) ? '' : textsUniq.push(texts[i].split(' ')[0]);
				}

				for (var j = 0; j < textsUniq.length; j++) {
					for (var k = 0; k < atUserArr.length; k++) {
						if (atUserArr[k]['userName'] == textsUniq[j]) {
							//if(atUserArr[k]['userName'].indexOf(textsUniq[j])>-1){
							atUserArrs.push(atUserArr[k]);
							break;
						}
					}
				}

				//其余参数
				var pars = {
					projectId: App.Project.Settings.projectId,
					viewPointId: viewPointId,
					text: this.$(".txtReMark").val().trim(),
					projectVersionId: +App.Project.Settings.versionId,
					attachments: pictures,
					receivers: atUserArrs,
					auth: App.Project.Settings.token
				},
				    data = {
					URLtype: "createComment",
					data: JSON.stringify(pars),
					type: "POST",
					contentType: "application/json"
				};

				//没有文字 且没有附件
				if (!pars.text && pictures.length <= 0) {
					$.tip({
						message: "请输入评论内容",
						timeout: 3000,
						type: "alarm"
					});
					return;
				}

				$btnEnter.val("保存中").data("isSubmit", true);

				if (App.Project && App.Project.Settings.isShare) {
					data.URLtype = "createCommentByToken";
				}

				App.Comm.ajax(data, function (data) {

					if (data.code == 0) {
						atUserArr = [];
						CommentCollections.ViewComments.push(data.data);
						//清空数据
						$btnEnter.val("评论").data("isSubmit", false);
						_this5.$(".uploadImgs").empty();
						_this5.$(".txtReMark").val('');
						//评论的数量
						var $count = $(".commentRemark .remarkBox .count");
						$count.text(+$count.text() + 1);
						setTimeout(function () {
							console.log('scrolltop');
							$('.mCustomScrollBox').scrollTop($('.mCSB_container').height());
						}, 1000);
					}
				});
			}
		}),

		//讨论列表
		ReMarkListDetail: Backbone.View.extend({

			tagName: "li",

			className: "item",

			events: {
				"click .delTalk": "delTalk",
				"click .showPosition": "showPosition",
				"click .showCommentPoint": "showCommentPoint"
			},

			initialize: function initialize() {
				this.listenTo(this.model, "destroy", this.remove);
			},


			template: _.templateUrl("/libsH5/tpls/comment/bimview.remark.list.detail.html"),

			render: function render() {

				var data = this.model.toJSON();

				this.$el.html(this.template(data));

				return this;
			},


			//显示位置
			showPosition: function showPosition(event) {

				//退出批注
				App.Project.Settings.Viewer.commentEnd();
				$comment.find(".reMarkBox .selected").removeClass("selected");
				//显示相机
				var camera = $(event.target).closest(".showPosition").addClass("selected").data("camera");
				App.Project.Settings.Viewer.setCamera(camera);
			},


			//评论批注显示
			showCommentPoint: function showCommentPoint() {

				//移除所有选中
				$comment.find(".reMarkBox .selected").removeClass("selected");

				var $showCommentPoint = $(event.target).closest(".showCommentPoint"),
				    camera = $showCommentPoint.addClass("selected").data("camera");

				viewPointId = $showCommentPoint.data("viewpointid");

				//显示相机
				App.Project.Settings.Viewer.setCamera(camera);
				//获取显示视点的数据
				CommentApi.getShowCommentData();
			},


			//删除评论
			delTalk: function delTalk(event) {
				var _this6 = this;

				$.confirm('确认删除该评论么？', function () {
					var $el = $(event.target),
					    id = $el.data("id");

					_this6.model.projectId = App.Project.Settings.projectId;
					_this6.model.viewPointId = viewPointId;
					_this6.model.commentId = id;

					if (App.Project && App.Project.Settings.isShare) {
						_this6.model.urlType = "delCommentByToken";
						_this6.model.auth = App.Project.Settings.token;
					} else {
						_this6.model.urlType = "delComment";
					}

					_this6.model.destroy();
				});

				// if (!confirm('确认删除该评论么？')) {
				// 	return;
				// }
			},


			//删除后
			remove: function remove() {

				var $count = $(".commentRemark .remarkBox .count");
				$count.text(+$count.text() - 1);

				this.$el.slideUp(function () {

					var $this = $(this),
					    $parent = $this.parent();

					$this.remove();

					if ($parent.find("li").length <= 0) {
						$parent.html('<li class="loading">暂无评论</li>');
					}
				});
			}
		})

	}
};

//集合
var CommentCollections = {
	//项目
	Project: new (Backbone.Collection.extend({

		model: Backbone.Model.extend({

			urlType: "delViewPoint",
			defualt: {
				title: ""
			}
		}),

		urlType: "projectPhoto",

		parse: function parse(response, options) {
			if (response.code == 0 && response.data.length > 0) {
				return response.data;
			} else {
				this.trigger("dataNull");
			}
		}
	}))(),

	//项目
	Share: new (Backbone.Collection.extend({

		model: Backbone.Model.extend({

			urlType: "delViewPoint",
			defualt: {
				title: ""
			}
		}),

		urlType: "getSharePhoto",

		parse: function parse(response, options) {

			if (response.code == 0 && response.data) {
				return response.data;
			} else {
				this.trigger("dataNull");
			}
		}
	}))(),

	//用户
	User: new (Backbone.Collection.extend({

		model: Backbone.Model.extend({

			urlType: "delViewPoint",

			defaults: {
				title: ""
			}
		}),

		urlType: "userPhoto",

		parse: function parse(response, options) {
			if (response.code == 0 && response.data.length > 0) {
				return response.data;
			} else {
				this.trigger("dataNull");
			}
		}
	}))(),

	//讨论
	ViewComments: new (Backbone.Collection.extend({

		model: Backbone.Model.extend({

			urlType: "delComment",

			defaults: {
				title: ""
			}
		}),

		urlType: "viewComments",

		parse: function parse(response, options) {
			if (response.code == 0) {

				if (response.data.length > 0) {
					return response.data;
				} else {
					this.trigger("dataNull");
				}
			}
		}
	}))()
},
    CommentApi = {

	//开始保存批注

	saveCommentStart: function saveCommentStart(viewPointId, cate, callback) {

		//收起导航
		$(".modelSidebar").removeClass("show open");
		//保存
		App.Project.Settings.Viewer.comment();

		var topSaveHtml = _.templateUrl('/libsH5/tpls/comment/bimview.top.save.tip.html', true);

		$(".commentBar").append(topSaveHtml);
		//保存事件
		CommentApi.saveCommEvent(viewPointId, cate, callback);
	},


	//绑定保存 批注事件
	saveCommEvent: function saveCommEvent(viewPointId, cate, callback) {

		var $topSaveTip = $("#topSaveTip"),
		    that = this;

		//保存
		$topSaveTip.on("click", ".btnSave", function () {

			var data = App.Project.Settings.Viewer.saveComment(),
			    pars = {
				cate: cate,
				img: data.image
			};

			if (viewPointId) {

				var $li = $comment.find(".remarkCount_" + viewPointId).closest(".item");

				pars = {
					cate: cate,
					id: $li.find(".remarkCount").data("id"),
					type: $li.find(".thumbnailImg").data("type"),
					img: $li.find(".thumbnailImg").prop('src'),
					name: $li.find(".title").text().trim()
				};
			}

			var title = "保存快照";

			if (cate == "address") {
				title = "保存位置";
			} else if (cate == "comment") {
				title = "保存批注";
			}

			var dialogHtml = _.templateUrl('/libsH5/tpls/comment/bimview.save.dialog.html')(pars),
			    opts = {
				title: title,
				width: 500,
				height: 250,
				cssClass: "saveViewPoint",
				okClass: "btnWhite",
				cancelClass: "btnWhite",
				okText: "保存",
				closeCallback: function closeCallback() {
					if (cate != "viewPoint") {
						App.Project.Settings.Viewer.commentEnd();
						//收起导航
						$(".modelSidebar").addClass("show open");
					}
				},

				cancelText: "保存并分享",

				message: dialogHtml,

				okCallback: function okCallback() {
					//保存批注
					if (!viewPointId) {

						if (cate == "address") {
							//保存位置
							that.savePosition(dialog, data, callback);
						} else {
							that.saveComment("save", dialog, data, callback, cate);
						}
					} else {
						data.id = viewPointId;
						that.editComment("save", dialog, data, viewPointId, callback, cate);
					}

					return false;
				},
				cancelCallback: function cancelCallback() {
					//保存并分享
					if (!viewPointId) {
						that.saveComment("saveShare", dialog, data, CommentApi.shareViewPoint, cate);
					} else {
						data.id = viewPointId;
						that.editComment("saveShare", dialog, data, CommentApi.shareViewPoint, cate);
					}

					return false;
				}
			},
			    dialog = new App.Comm.modules.Dialog(opts),
			    $viewPointType = dialog.element.find(".viewPointType");

			//分享按钮
			if (cate != "viewPoint") {
				dialog.element.find(".cancel").remove();
			}

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
		});

		//取消
		$topSaveTip.on("click", ".btnCanel", function () {
			App.Project.Settings.Viewer.commentEnd();
			//显示
			$(".modelSidebar").addClass("show open");
		});
	},


	//保存批注
	saveComment: function saveComment(type, dialog, commentData, callback, cate) {
		var _this7 = this;

		if (dialog.isSubmit) {
			return;
		}
		var $element = dialog.element,
		    pars = {
			projectId: App.Project.Settings.projectId,
			name: dialog.element.find(".name").val().trim(),
			type: dialog.type,
			viewPointId: $comment.find('.remarkCount.current').data("id"),
			viewPoint: commentData.camera
		};

		if (!pars.name) {
			$.tip({
				message: "请输入批注描述",
				timeout: 3000,
				type: "alarm"
			});
			//alert("请输入批注名称");
			return false;
		}

		var data = {
			URLtype: cate != "viewPoint" ? "viewPointCommentViewpoint" : "createViewPoint",
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
		App.Comm.ajax(data, function (data) {

			if (data.code == 0) {

				data = data.data;
				//赋值id
				commentData.id = data.id;
				//保存 图片 canvas filter
				$.when(_this7.saveImage({
					id: data.id,
					img: commentData.image
				}), _this7.saveAnnotation(commentData), _this7.saveFilter(commentData)).done(function (imgData, annotationData, filterData) {

					imgData = imgData[0];

					annotationData = annotationData[0];

					filterData = filterData[0];

					//成功
					if (imgData.code == 0 && annotationData.code == 0 && filterData.code == 0) {

						imgData.data.isAdd = true;
						//创建视点 才添加 colleciton
						if (cate == "viewPoint") {

							//项目
							if ($comment.find(".navBar .project").hasClass("selected")) {
								if (dialog.type == 1) {
									CommentCollections.Project.push(imgData.data);
								} else {
									$comment.find(".navBar .user").click();
								}
							} else if ($comment.find(".navBar .user").hasClass("selected")) {
								//个人
								if (dialog.type == 0) {
									CommentCollections.User.push(imgData.data);
								} else {
									$comment.find(".navBar .project").click();
								}
							}
						}

						//关闭弹出层 取消编辑状态
						dialog.close();

						//显示
						$(".modelSidebar").addClass("show open");

						$("#topSaveTip .btnCanel").click();

						if ($.isFunction(callback)) {
							callback(imgData.data);
						}
					}
				});
			} else {
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
			URLtype: "createAnnotation",
			type: "POST",
			contentType: 'application/json',
			data: JSON.stringify(pars)
		};

		return App.Comm.ajax(data);
	},


	//保存过滤器
	saveFilter: function saveFilter(commentData) {

		var filterArr = [];

		for (var key in commentData.filter) {
			commentData.filter[key].cateType = key;
			filterArr.push(JSON.stringify(commentData.filter[key]));
		}

		var pars = {
			projectId: App.Project.Settings.projectId,
			viewPointId: commentData.id,
			filters: filterArr
		},
		    data = {
			URLtype: "savePointFilter",
			type: "POST",
			contentType: 'application/json',
			data: JSON.stringify(pars)
		};

		return App.Comm.ajax(data);
	},


	//分享解析数据
	shareViewPointData: function shareViewPointData($li) {
		var data = {
			id: $li.find(".remarkCount").data("id"),
			pic: $li.find(".thumbnailImg").prop("src"),
			creatorName: $li.find(".name").text().trim(),
			name: $li.find(".title").text().trim(),
			createTime: $li.find(".date").text().trim()
		};
		this.shareViewPoint(data);
	},


	//保存位置
	savePosition: function savePosition(dialog, data, callback) {

		if (dialog.isSubmit) {
			return;
		}

		var description = dialog.element.find(".name").val().trim();

		if (!description) {
			$.tip({
				message: "请输入位置信息",
				timeout: 3000,
				type: "alarm"
			});
			//alert("请输入位置信息");
			return;
		}

		var viewPintId = $comment.find('.remarkCount.current').data("id"),

		//数据
		formdata = new FormData();

		formdata.append("fileName", +new Date() + ".png");
		formdata.append("size", data.image.length);
		formdata.append("file", data.image);

		var pars = {
			URLtype: 'viewPointPosition',
			data: {
				projectId: App.Project.Settings.projectId,
				viewPointId: viewPintId,
				description: description,
				position: data.camera
			}
		},
		    url = App.Comm.getUrlByType(pars).url;

		$.ajax({
			url: url,
			type: "post",
			data: formdata,
			processData: false,
			contentType: false
		}).done(function (data) {
			if (data.code == 0) {
				if ($.isFunction(callback)) {
					callback(data.data);
				}
				dialog.close();
				App.Project.Settings.Viewer.commentEnd();
			}
		});
	},


	//分享视点
	shareViewPoint: function shareViewPoint(obj) {

		var data = {
			URLtype: 'shareComment',
			type: "POST",
			contentType: 'application/json',
			data: JSON.stringify({
				projectId: App.Project.Settings.projectId,
				projectVersionId: App.Project.Settings.versionId,
				viewpointId: obj.id
			})
		};

		App.Comm.ajax(data, function (data) {

			if (data.code == 0) {
				obj.url = data.data.url;
				var dialogHtml = _.templateUrl('/libsH5/tpls/comment/bimview.share.dialog.html')(obj),
				    opts = {
					title: "分享快照",
					width: 500,
					height: 250,
					cssClass: "saveViewPoint",
					isConfirm: false,
					message: dialogHtml
				},
				    dialog = new App.Comm.modules.Dialog(opts),
				    $btnCopy = dialog.element.find(".btnCopy");

				//复制 http://bim.wanda-dev.cn/page/#share/a374
				// var clip = new ZeroClipboard($btnCopy[0]);

				// clip.on("complete", function(e) {
				// 	alert("您已经复制了链接地址");
				// });

				//h5 复制
				if (clipboard) {
					clipboard.destroy();
				}
				clipboard = new Clipboard(".saveViewPoint .btnCopy");
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
	},


	//编辑 批注
	editComment: function editComment(type, dialog, commentData, callback) {
		var _this8 = this;

		if (dialog.isSubmit) {
			return;
		}
		var $element = dialog.element,
		    that = this,
		    pars = {
			viewPointId: commentData.id,
			projectId: App.Project.Settings.projectId,
			name: dialog.element.find(".name").val().trim(),
			type: dialog.type
		};

		if (!pars.name) {
			$.tip({
				message: "请输入批注名称",
				timeout: 3000,
				type: "alarm"
			});
			//alert("请输入批注名称");
			return false;
		}

		var data = {
			URLtype: "updateViewPoint",
			data: JSON.stringify(pars),
			type: "PUT",
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
		App.Comm.ajax(data, function (data) {

			if (data.code == 0) {

				//请求
				$.when(_this8.saveImage({
					id: commentData.id,
					img: commentData.image
				}), _this8.updateAnnotation(commentData)).done(function (imgData, annotationData) {

					imgData = imgData[0];

					annotationData = annotationData[0];

					if (imgData.code == 0 && annotationData.code == 0) {

						var id = imgData.data.id,
						    models = [];

						//项目
						if ($comment.find(".navBar .project").hasClass("selected")) {

							models = CommentCollections.Project.models;
						} else {
							//个人
							models = CommentCollections.User.models;
						}

						$.each(models, function () {
							if (this.toJSON().id == id) {
								this.set(imgData.data);
								//跳出循环
								return false;
							}
						});

						dialog.close();
						//取消
						$("#topSaveTip .btnCanel").click();
						//回掉
						if ($.isFunction(callback)) {
							callback(imgData.data);
						}
					}
				});
			} else {
				dialog.isSubmit = false;
				if (type == "save") {
					dialog.element.find(".ok").text("保存");
				} else {
					dialog.element.find(".cancel").text("保存并分享");
				}
				alert(data.message);
			}
		});
	},


	//修改批注
	editViewPoint: function editViewPoint($li) {

		var viewPointId = $li.find(".remarkCount").data("id"),
		    data = {
			URLtype: "getAnnotation",
			data: {
				projectId: App.Project.Settings.projectId,
				viewPointId: viewPointId
			}
		},
		    viewPint = $li.find(".thumbnailImg").data("viewpoint");

		$li.addClass("selected").siblings().removeClass("selected");

		App.Project.Settings.Viewer.setCamera(viewPint);

		App.Comm.ajax(data, function (data) {

			if (data.code == 0) {

				var filterObj = {},
				    item;

				$.each(data.data.filters, function (i, item) {
					item = JSON.parse(item);
					filterObj[item.cateType] = item;
					delete item.cateType;
				});

				//保存
				App.Project.Settings.Viewer.comment(filterObj);

				var topSaveHtml = _.templateUrl('/libsH5/tpls/comment/bimview.top.save.tip.html', true);

				$(".modelContainerContent .commentBar").append(topSaveHtml);
				//保存事件
				CommentApi.saveCommEvent(viewPointId, 'viewPoint');
			}
		});
	},


	//修改视点
	reName: function reName($li) {
		var _this9 = this;

		var data = {
			cate: "viewPoint",
			id: $li.find(".remarkCount").data("id"),
			type: $li.find(".thumbnailImg").data("type"),
			img: $li.find(".thumbnailImg").prop('src'),
			name: $li.find(".title").text().trim()
		},
		    dialogHtml = _.templateUrl('/libsH5/tpls/comment/bimview.save.dialog.html')(data),
		    opts = {
			title: "修改快照",
			width: 500,
			height: 250,
			cssClass: "saveViewPoint",
			okClass: "btnWhite",
			cancelClass: "btnWhite",
			okText: "保存",
			cancelText: "取消",
			message: dialogHtml,
			okCallback: function okCallback() {
				//保存批注
				_this9.updateComment(dialog);

				return false;
			}
		},
		    dialog = new App.Comm.modules.Dialog(opts),
		    $viewPointType = dialog.element.find(".viewPointType");

		dialog.type = data.type;

		dialog.id = data.id;
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


	//更新视点
	updateComment: function updateComment(dialog) {

		if (dialog.isSubmit) {
			return;
		}
		var $element = dialog.element,
		    pars = {
			viewPointId: dialog.id,
			projectId: App.Project.Settings.projectId,
			name: dialog.element.find(".name").val().trim(),
			type: dialog.type
		};

		if (!pars.name) {
			$.tip({
				message: "请输入批注名称",
				timeout: 3000,
				type: "alarm"
			});
			//alert("请输入批注名称");
			return false;
		}

		var data = {
			URLtype: "updateViewPoint",
			data: JSON.stringify(pars),
			type: "PUT",
			contentType: "application/json"
		};

		//保存中
		dialog.element.find(".ok").text("保存中");
		dialog.isSubmit = true;

		dialog.element.find(".ok").text("保存中");

		//创建
		App.Comm.ajax(data, function (data) {

			if (data.code == 0) {

				//项目
				// if ($comment.find(".navBar .project").hasClass("selected")) {
				// 	if (dialog.type == 1) {
				// 		models = CommentCollections.Project.models;
				// 	} else {
				// 		$comment.find(".navBar .user").click();
				// 	}

				// } else if ($comment.find(".navBar .user").hasClass("selected")) {
				// 	//个人
				// 	if (dialog.type == 0) {
				// 		models = CommentCollections.User.models;
				// 	} else {
				// 		$comment.find(".navBar .project").click();
				// 	}

				// }
				var models = [];
				//项目
				if ($comment.find(".navBar .project").hasClass("selected")) {
					models = CommentCollections.Project.models;
				} else {
					//个人
					models = CommentCollections.User.models;
				}

				if (models) {
					$.each(models, function () {
						if (this.toJSON().id == dialog.id) {
							this.set(data.data);
							//跳出循环
							return false;
						}
					});
				}

				//评论中的视点信息
				var $item = $comment.find(".remarkCount_" + dialog.id).closest(".item");
				//批注信息 赋值
				$(".commentRemark .viewPointInfo").html($item.html());

				dialog.close();
			} else {

				alert(data.message);
				dialog.isSubmit = false;
				dialog.element.find(".ok").text("保存");
			}
		});
	},


	//更新批注
	updateAnnotation: function updateAnnotation(commentData) {
		var pars = {
			projectId: App.Project.Settings.projectId,
			viewPointId: commentData.id,
			annotations: commentData.list
		},
		    data = {
			URLtype: "createAnnotation",
			type: "PUT",
			contentType: 'application/json',
			data: JSON.stringify(pars)
		};

		return App.Comm.ajax(data);
	},


	//上传地址或者评论视点后
	afterUploadAddressViewPoint: function afterUploadAddressViewPoint(data) {

		var imgLoadHTML = _.templateUrl('/libsH5/tpls/comment/upload.img.html', true);
		this.$(".uploadImgs").append(imgLoadHTML);

		this.$(".uploading:first").find(".talkImg").prop("src", "/" + data.pictureUrl).show().end().find(".imgName").text(data.description).addClass("upload").end().find(".delUploadImg").show().end().data("id", data.id).removeClass("uploading").data("data", data);
	},


	//显示批注
	showComment: function showComment($item) {

		var viewPint = $item.find(".thumbnailImg").data("viewpoint");

		viewPointId = $item.find(".remarkCount").data("id");

		$item.addClass("selected").siblings().removeClass("selected");

		App.Project.Settings.Viewer.setCamera(viewPint);

		//获取显示视点的数据
		this.getShowCommentData();
	},


	//获取显示视点的数据
	getShowCommentData: function getShowCommentData() {

		$.when(this.getFilter(), this.getAnnotation()).done(function (filterData, annotationData) {

			filterData = filterData[0];
			//annotationData = annotationData[0];

			if (filterData.code == 0) {

				var filterObj = {},
				    item;
				$.each(filterData.data.filters, function (i, item) {
					item = JSON.parse(item);
					filterObj[item.cateType] = item;
					delete item.cateType;
				});
				App.Project.Settings.Viewer.loadComment({
					//list: annotationData.data.annotations,
					filter: filterObj
				});
				//隐藏加载
				$("#pageLoading").hide();
			} else {
				alert('数据获取失败');
			}
		});
	},


	//获取 过滤器
	getFilter: function getFilter() {

		var data = {
			URLtype: "getFilter",
			data: {
				projectId: App.Project.Settings.projectId,
				viewPointId: viewPointId
			}
		};

		if (App.Project && App.Project.Settings.isShare) {

			data = {
				URLtype: "getFilterByToken",
				data: {
					auth: App.Project.Settings.token
				}
			};
		}

		return App.Comm.ajax(data);
	},


	//获取批注
	getAnnotation: function getAnnotation() {
		return true;
		var data = {
			URLtype: "getAnnotation",
			data: {
				projectId: App.Project.Settings.projectId,
				viewPointId: viewPointId
			}
		};

		if (App.Project && App.Project.Settings.isShare) {

			data = {
				URLtype: "getAnnotationByToken",
				data: {
					auth: App.Project.Settings.token
				}
			};
		}

		return App.Comm.ajax(data);
	}
},
    viewPointId,
    atUserArr = [];
;/*!/imbox/views/message.container.es6*/
"use strict";

App.INBox = App.INBox || {};
App.INBox.imboxContainerView = Backbone.View.extend({

      template: _.templateUrl('./imbox/tpls/container.html', true),

      initialize: function initialize() {
            this.listenTo(App.INBox.messageCollection, "reset", this.renderData);
            this.listenTo(App.INBox.messageAllCollection, "reset", this.renderAllData);
      },

      render: function render() {
            this.$el.html(this.template);
            return this;
      },
      renderData: function renderData(item) {
            var _data = item.toJSON()[0];
            var _html = _.templateUrl('./imbox/tpls/list.html');
            if (!_data.items.length) {
                  return;
            }
            this.$('.commissionLists').html(_html({ data: _data.items }));
            this.$(".commissionListPagination").empty().pagination(_data.totalItemCount, {
                  items_per_page: _data.pageItemCount,
                  current_page: _data.pageIndex - 1,
                  num_edge_entries: 3, //边缘页数
                  num_display_entries: 5, //主体页数
                  link_to: 'javascript:void(0);',
                  itemCallback: function itemCallback(pageIndex) {
                        App.INBox.loadData('un', pageIndex + 1);
                  },
                  prev_text: "上一页",
                  next_text: "下一页"

            });
      },
      renderAllData: function renderAllData(item) {
            var _data = item.toJSON()[0];
            var _html = _.templateUrl('./imbox/tpls/list.html');

            if (!_data.items.length) {
                  return;
            }

            this.$('.alreadyLists').html(_html({ data: _data.items }));
            this.$(".alreadyListPagination").empty().pagination(_data.totalItemCount, {
                  items_per_page: _data.pageItemCount,
                  current_page: _data.pageIndex - 1,
                  num_edge_entries: 3, //边缘页数
                  num_display_entries: 5, //主体页数
                  link_to: 'javascript:void(0);',
                  itemCallback: function itemCallback(pageIndex) {
                        App.INBox.loadData('all', pageIndex + 1);
                  },
                  prev_text: "上一页",
                  next_text: "下一页"

            });
      }
});
;/*!/imbox/views/message.list.es6*/
'use strict';

App.INBox = App.INBox || {};
App.INBox.imboxListView = Backbone.View.extend({

	template: _.templateUrl('./imbox/tpls/container.html', true),

	initialize: function initialize() {
		//  this.listenTo(App.IMBox.messageCollection,"reset",this.renderData);
	},

	render: function render() {
		this.$el.html(this.template);
		return this;
	},
	renderData: function renderData(item) {}
});
;/*!/imbox/views/nav.js*/
App.INBox.NavView = Backbone.View.extend({

	tagName: 'div',

	className: 'imboxNavWrap',

	//代办
	events: {
		'click .already': 'already', //已办
		'click .commission': 'commission' //代办
	},

	//未读消息
	commission: function() {
		$(".imboxNav .commission").addClass("selected");
		$(".imboxNav .already").removeClass("selected");
		$('#imboxContent .commissionBox').show();
		$('#imboxContent .alreadyBox').hide();
		App.INBox.messageCollection.fetch({
			reset:true,
			data:{
				status:0
			}
		});
	},

	//已读消息
	already: function() {
		$(".imboxNav .already").addClass("selected");
		$(".imboxNav .commission").removeClass("selected");
		$('#imboxContent .commissionBox').hide();
		$('#imboxContent .alreadyBox').show();
		App.INBox.messageAllCollection.fetch({
			reset:true
		});
	},

	template:_.templateUrl("./imbox/tpls/nav.html",true),


	render: function() {
		this.$el.html(this.template);
		return this;
	},

	loadDadta:function(){

	}

});