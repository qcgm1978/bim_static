/**
 * @require /libsH5/js/bimView.js
 * @require /libsH5/js/bimView.prototype.js
 */


;
(function() {

	//非bim平台
	if (!_.templateUrl) {
		return;
	}

	var $comment, AppView, ModelView, viewPointId;

	//扩展 批注
	bimView.prototype.commentInit = function() {


		//单利 不存在 则 新建
		if (!AppView) {
			ModelView = this;
			AppView = new CommentView.App().render();

			$comment = $('#comment');
			//生成
			$comment.html(AppView.$el);

			//右键菜单
			if (!document.getElementById("viewPointContext")) {
				//右键菜单
				var contextHtml = _.templateUrl("/libsH5/tpls/comment/viewPointContext.html", true);
				$("body").append(contextHtml);
			}
		}

		$("#comment .navBar .item.project").click();

	}



	//集合
	var CommentCollections = {
			//项目
			Project: new(Backbone.Collection.extend({

				model: Backbone.Model.extend({

					urlType: "delViewPoint",
					defualt: {
						title: ""
					}
				}),

				urlType: "projectPhoto",

				parse(response, options) {
					if (response.code == 0 && response.data.length > 0) {
						return response.data;
					} else {
						this.trigger("dataNull");
					}
				}
			})),

			//项目
			Share: new(Backbone.Collection.extend({

				model: Backbone.Model.extend({

					urlType: "delViewPoint",
					defualt: {
						title: ""
					}
				}),

				urlType: "projectPhoto",

				parse(response, options) {
					if (response.code == 0 && response.data.length > 0) {
						return response.data;
					} else {
						this.trigger("dataNull");
					}
				}
			})),

			//用户
			User: new(Backbone.Collection.extend({

				model: Backbone.Model.extend({

					urlType: "delViewPoint",

					defaults: {
						title: ""
					}
				}),

				urlType: "userPhoto",

				parse(response, options) {
					if (response.code == 0 && response.data.length > 0) {
						return response.data;
					} else {
						this.trigger("dataNull");
					}
				}

			})),

			//讨论
			ViewComments: new(Backbone.Collection.extend({

				model: Backbone.Model.extend({

					urlType: "delComment",

					defaults: {
						title: ""
					}
				}),

				urlType: "viewComments",

				parse(response, options) {
					if (response.code == 0) {

						if (response.data.length > 0) {
							return response.data;
						} else {
							this.trigger("dataNull");
						}

					}
				}

			}))
		},

		//视图
		CommentView = {


			//入口
			App: Backbone.View.extend({

				tagName: "div",

				className: "commentListBox",

				events: {
					"click .navBar .item": "itemClick"
				},

				template: _.templateUrl('/libsH5/tpls/comment/bimview.pro.comment.html'),

				//渲染
				render() {
					//模板
					this.$el.html(this.template({}));
					//项目快照
					this.$(".projectListScroll").html(new CommentView.Project().render().$el);
					//个人快照
					this.$(".userListScroll").html(new CommentView.User().render().$el);
					//评论
					this.$(".commentRemark").html(new CommentView.ReMark().render().$el);

					return this;
				},

				//导航
				itemClick(event) {

					var $el = $(event.target).closest(".item"),
						type = $el.data("type");

					//项目视点
					if (type == "project") {
						this.$(".projectListBox").fadeIn("fast");
						//this.$(".projectListScroll").animate({left:"0px" },300);
						if (App.Project.Settings.isShare) {
							//获取数据
							CommentCollections.Share.projectId = App.Project.Settings.projectId;
							CommentCollections.Share.reset();
							CommentCollections.Share.fetch({
								success() {

									$(".projectList .item:first").click();
								}
							});
						} else {
							//获取数据
							CommentCollections.Project.projectId = App.Project.Settings.projectId;
							CommentCollections.Project.reset();
							CommentCollections.Project.fetch();
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
						//保存
						App.Project.Settings.Viewer.comment();

						var topSaveHtml = _.templateUrl('/libsH5/tpls/comment/bimview.top.save.tip.html', true);

						$("body").append(topSaveHtml);
						//保存事件
						CommentApi.saveCommEvent();

					}

				}

			}),

			//项目
			Project: Backbone.View.extend({

				tagName: "ul",

				className: "projectList",

				//初始化
				initialize() {
					this.listenTo(CommentCollections.Project, "add", this.addOne);
					this.listenTo(CommentCollections.Project, "reset", this.reLoading);
					this.listenTo(CommentCollections.Project, "dataNull", this.dataNull);
					this.listenTo(CommentCollections.Share, "add", this.addOne);
					this.listenTo(CommentCollections.Share, "reset", this.reLoading);
					this.listenTo(CommentCollections.Share, "dataNull", this.dataNull);
				},

				render() {
					return this;
				},

				//新增数据
				addOne(model) {
					var $list = new CommentView.listDetail({
						model: model
					}).render().$el;
					this.$el.find(".loading").remove();
					//新增放前面
					if (model.toJSON().isAdd) {
						this.$el.prepend($list);
					} else {
						this.$el.append($list);
					}
				},

				//无数据
				dataNull() {
					this.$el.html('<li class="loading">无数据</li>');
				},

				//重新加载
				reLoading() {

					this.$el.html('<li class="loading">正在加载，请稍候……</li>');
				}

			}),

			//用户
			User: Backbone.View.extend({

				tagName: "ul",

				className: "userList",

				//初始化
				initialize() {
					this.listenTo(CommentCollections.User, "add", this.addOne);
					this.listenTo(CommentCollections.User, "reset", this.reLoading);
					this.listenTo(CommentCollections.User, "dataNull", this.dataNull);
				},

				render() {
					return this;
				},

				//新增数据
				addOne(model) {

					var $list = new CommentView.listDetail({
						model: model
					}).render().$el;

					if (model.toJSON().isAdd) {
						this.$el.prepend($list);
					} else {
						this.$el.append($list);
					}


					this.$el.find(".loading").remove();
				},

				//无数据
				dataNull() {
					this.$el.html('<li class="loading">无数据</li>');
				},

				//重新加载
				reLoading() {

					this.$el.html('<li class="loading">正在加载，请稍候……</li>');
				}

			}),

			//单个列表
			listDetail: Backbone.View.extend({

				tagName: "li",

				className: "item",

				events: {
					"click .remarkCount": "viewComments",
					"click": "showComment"
				},

				//初始化
				initialize() {
					this.listenTo(this.model, "destroy", this.remove);
					this.listenTo(this.model, "change", this.afterUpdate);
				},

				template: _.templateUrl('/libsH5/tpls/comment/bimview.pro.comment.list.detail.html'),

				render() {

					var data = this.model.toJSON();

					this.$el.html(this.template(data));

					this.bindContent();

					return this;

				},

				//显示批注
				showComment(event) {
					var $item = $(event.target).closest(".item"),
						viewPint = $item.find(".thumbnailImg").data("viewpoint");

					viewPointId = this.$(".remarkCount").data("id");

					$item.addClass("selected").siblings().removeClass("selected");

					App.Project.Settings.Viewer.setCamera(viewPint);

					$.when(this.getFilter(), this.getAnnotation()).done((filterData, annotationData) => {

						filterData = filterData[0];
						annotationData = annotationData[0];

						if (filterData.code == 0 && annotationData.code == 0) {

							var filterObj = {

								},
								item;
							$.each(filterData.data.filters, function(i, item) {
								item = JSON.parse(item);
								filterObj[item.cateType] = item;
								delete item.cateType;
							});
							App.Project.Settings.Viewer.loadComment({
								list: annotationData.data.annotations,
								filter: filterObj
							});

						} else {
							alert('数据获取失败');
						}

					});

				},

				//获取批注
				getFilter() {

					var data = {
						URLtype: "getFilter",
						data: {
							projectId: App.Project.Settings.projectId,
							viewPointId: viewPointId
						}
					}

					return App.Comm.ajax(data);
				},

				//获取批注
				getAnnotation() {
					var data = {
						URLtype: "getAnnotation",
						data: {
							projectId: App.Project.Settings.projectId,
							viewPointId: viewPointId
						}
					}

					return App.Comm.ajax(data);
				},


				//更新后操作
				afterUpdate() {

					var data = this.model.toJSON();

					if (data.type == 1 && $comment.find(".navBar .project").hasClass("selected") || data.type == 0 && $comment.find(".navBar .user").hasClass("selected")　) {

						this.$el.html(this.template(data));

						this.bindContent();

						return this;
					} else {
						this.remove();
					}

				},

				//删除数据
				remove() {

					this.$el.slideUp(function() {

						var $this = $(this),
							$parent = $this.parent();

						$this.remove();

						if ($parent.find("li").length <= 0) {
							$parent.html('<li class="loading">无数据</li>');
						}

					});
				},

				//查看发表评论
				viewComments(event) {

					var $el = $(event.target).closest(".remarkCount"),
						id = $el.data("id");


					$comment.find(".commentList").animate({
						left: "314px"
					}, 500);
					$comment.find(".commentRemark").show().animate({
						left: "0px"
					}, 500);

					$el.addClass('current');
					//获取数据
					CommentCollections.ViewComments.reset();
					CommentCollections.ViewComments.projectId = App.Project.Settings.projectId;
					CommentCollections.ViewComments.viewPointId = id;
					viewPointId = id;
					CommentCollections.ViewComments.fetch({
						success(model, data) {
							$(".commentRemark .reMarkCount .count").text(data.data.length);
							this.$(".reMarkListBox").css("bottom", this.$(".talkReMark").height() + 10);
						}
					});

					event.stopPropagation();

				},


				bindContent() {

					var that = this;

					this.$el.contextMenu('viewPointContext', {
						theme: "viewPointContext",
						shadow: false,
						//显示 回调
						onShowMenuCallback: function(event) {

							var $li = $(event.target).closest(".item"),
								createId = $li.find(".name").data("creatorid");

							//创建者 可以 删除 分享 编辑
							if (App.Global.User && App.Global.User.userId == createId && !App.Project.Settings.isShare) {
								$("#shareViewPoint,#delViewPoint,#editViewPoint,#reName").show();
							} else {
								$("#shareViewPoint,#delViewPoint,#editViewPoint,#reName").hide();
							}

						},
						//事件绑定
						bindings: {

							downLoadViewPoint(li) {
								//下载
								window.location.href = $(li).find(".thumbnailImg").prop("src");
							},

							shareViewPoint(li) {
								 
								var $li = $(li),
									data = {
										id:$li.find(".remarkCount").data("id"),
										pic: $li.find(".thumbnailImg").prop("src"),
										creatorId: $li.find(".name").text().trim(),
										name: $li.find(".title").text().trim(),
										description: $li.find(".desc").text().trim(),
										createTime: $li.find(".date").text().trim()
									};
								//分享								
								CommentApi.shareViewPoint(data);

							},

							talkViewPoint(li) {
								//评论
								$(li).find(".remarkCount").click();
							},

							editViewPoint(li) {

								//修改
								that.editViewPoint(li);

							},

							reName() {
								//修改
								that.reName();

							},

							'delViewPoint': function() {
								//删除视点
								if (confirm("确认删除该视点么？")) {
									that.delViewPoint();
								}
							}

						}
					});
				},

				editViewPoint(li) {


					var $li = $(li),
						viewPointId = $li.find(".remarkCount").data("id"),
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

					App.Comm.ajax(data, function(data) {

						if (data.code == 0) {

							var filterObj = {

								},
								item;

							$.each(data.data.filters, function(i, item) {
								item = JSON.parse(item);
								filterObj[item.cateType] = item;
								delete item.cateType;
							});

							//保存
							App.Project.Settings.Viewer.comment(filterObj);

							var topSaveHtml = _.templateUrl('/libsH5/tpls/comment/bimview.top.save.tip.html', true);

							$("body").append(topSaveHtml);
							//保存事件
							CommentApi.saveCommEvent(viewPointId);

						}
					})


				},


				//删除试点
				delViewPoint() {
					var id = this.$(".remarkCount").data("id");
					this.model.projectId = App.Project.Settings.projectId;
					this.model.viewPointId = id;
					this.model.destroy();
				},

				//修改批注
				reName() {

					var data = {
							id: this.$(".remarkCount").data("id"),
							type: this.$(".thumbnailImg").data("type"),
							img: this.$(".thumbnailImg").prop('src'),
							name: this.$(".title").text().trim(),
							desc: this.$(".desc").text().trim()
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
							okCallback: () => {
								//保存批注
								this.updateComment(dialog);

								return false;
							}
						},

						dialog = new App.Comm.modules.Dialog(opts),

						$viewPointType = dialog.element.find(".viewPointType");

					dialog.type = data.type;

					dialog.id = data.id;
					//视点类型
					$viewPointType.myDropDown({
						click: function($item) {
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
				updateComment(dialog) {

					if (dialog.isSubmit) {
						return;
					}
					var $element = dialog.element,
						that = this,
						pars = {
							viewPointId: dialog.id,
							projectId: App.Project.Settings.projectId,
							name: dialog.element.find(".name").val().trim(),
							description: dialog.element.find(".desc").val().trim(),
							type: dialog.type
						};

					if (!pars.name) {
						alert("请输入批注名称");
						return false;
					}

					// if (!pars.description) {
					// 	alert("请输入批注描述");
					// 	return false;
					// }

					var data = {
						URLtype: "updateViewPoint",
						data: JSON.stringify(pars),
						type: "PUT",
						contentType: "application/json"
					}

					//保存中
					dialog.element.find(".ok").text("保存中");
					dialog.isSubmit = true;

					//创建
					App.Comm.ajax(data, (data) => {

						if (data.code == 0) {
							that.model.set(data.data);
							dialog.close();
						}

					});

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
					"click .btnLogin": "login" //登陆
				},

				initialize() {
					this.listenTo(CommentCollections.ViewComments, "add", this.addOne);
					this.listenTo(CommentCollections.ViewComments, "reset", this.reLoading);
					this.listenTo(CommentCollections.ViewComments, "dataNull", this.dataNull);

				},

				template: _.templateUrl('/libsH5/tpls/comment/bimview.remark.html')(),

				//渲染
				render() {
					//模板
					this.$el.html(this.template);
					return this;
				},

				login() {
					//初始化登陆
					App.Project.Share.initLogin();
				},

				//上传图片
				triggerUpload() {

					var url = "sixD/" + App.Project.Settings.projectId + "/viewPoint/" + viewPointId + "/comment/pic"

					$("#viewPointUploadImageForm").prop("action", url);
					//上传完成
					if (!this.bindUpload) {
						this.uploadSuccess();
						this.bindUpload = true;
					}

					return this.$(".uploadImg").click();
				},

				uploadImg() {

					//提交
					$("#viewPointUploadImageForm").submit();

					var imgLoadHTML = _.templateUrl('/libsH5/tpls/comment/upload.img.html', true);

					this.$(".uploadImgs").append(imgLoadHTML);

					this.listHeight();

				},

				//图片上传成功
				uploadSuccess(event) {

					var that = this;

					$("#viewPintUploadIframe").on("load", function(event) {

						var data = JSON.parse(this.contentDocument.body.innerText);
						if (data.code == 0) {

							data = data.data;

							that.$(".uploading:first").find(".talkImg").prop("src", "/" + data.url).show().end().
							find(".imgName").text(data.name).addClass("upload").end().
							find(".delUploadImg").show().end().
							data("id", data.id).removeClass("uploading");
						}
					});
				},

				//删除图片
				removeImg(event) {
					$(event.target).closest(".singleImg").remove();
				},

				//新增数据
				addOne(model) {

					//模板数据
					var $list = new CommentView.ReMarkListDetail({
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
				reLoading() {
					this.$(".reMarkList").html('<li class="loading">正在加载，请稍候……</li>');
				},

				//无数据
				dataNull() {
					this.$(".reMarkList").html('<li class="loading">无数据</li>');
				},

				//返回列表
				goList() {

					$(".remarkCount.current").removeClass("current").find(".count").text($(".commentRemark .reMarkCount .count").text());

					$comment.find(".commentList").animate({
						left: "0px"
					}, 500);
					$comment.find(".commentRemark").show().animate({
						left: "330px"
					}, 500);
				},

				//获取到焦点
				inputReMark(event) {
					$(event.target).addClass("input");
					//列表高度
					this.listHeight();
				},

				//失去焦点
				outReMark(event) {
					$(event.target).removeClass("input");
					//列表高度
					this.listHeight();
				},

				//计算列表高度
				listHeight() {
					this.$(".reMarkListBox").css("bottom", this.$(".talkReMark").height() + 10);
				},

				//发表评论
				sendComment(event) {

					var $btnEnter = $(event.target);

					if ($btnEnter.data("isSubmit")) {
						return;
					}

					if (this.$(".uploading").length > 0) {
						alert('图片上传中');
						return;
					}
					//图片
					var pictures = [];
					this.$(".singleImg").each(function() {
						pictures.push($(this).data("id"));
					});

					//其余参数
					var pars = {
							projectId: App.Project.Settings.projectId,
							viewPointId: viewPointId,
							text: this.$(".txtReMark").val().trim(),
							pictures: pictures
						},
						data = {
							URLtype: "createComment",
							data: JSON.stringify(pars),
							type: "POST",
							contentType: "application/json"
						};


					if (!pars.text) {

						alert('请输入评论内容');
						return;
					}

					$btnEnter.val("保存中").data("isSubmit", true);

					App.Comm.ajax(data, (data) => {

						if (data.code == 0) {

							CommentCollections.ViewComments.push(data.data);
							//清空数据
							$btnEnter.val("评论").data("isSubmit", false);
							this.$(".uploadImgs").empty();
							this.$(".txtReMark").val('');
							//评论的数量
							var $count = $(".commentRemark .reMarkCount .count");
							$count.text(+$count.text() + 1);
						}

					});
				}

			}),

			//讨论列表
			ReMarkListDetail: Backbone.View.extend({

				tagName: "li",

				className: "item",

				events: {
					"click .delTalk": "delTalk"
				},

				initialize() {
					this.listenTo(this.model, "destroy", this.remove);
				},

				template: _.templateUrl("/libsH5/tpls/comment/bimview.remark.list.detail.html"),

				render() {

					var data = this.model.toJSON();

					this.$el.html(this.template(data));

					return this;

				},

				//删除评论
				delTalk(event) {

					if (!confirm('确认删除该评论么？')) {
						return;
					}

					var $el = $(event.target),
						id = $el.data("id");

					this.model.projectId = App.Project.Settings.projectId;
					this.model.viewPointId = viewPointId;
					this.model.commentId = id;
					this.model.destroy();

				},

				//删除后
				remove() {

					var $count = $(".commentRemark .reMarkCount .count");
					$count.text(+$count.text() - 1);

					this.$el.slideUp(function() {

						var $this = $(this),
							$parent = $this.parent();

						$this.remove();

						if ($parent.find("li").length <= 0) {
							$parent.html('<li class="loading">无数据</li>');
						}

					});
				}

			})

		},


		CommentApi = {

			//绑定保存 批注事件
			saveCommEvent(viewPointId) {

				var $topSaveTip = $("#topSaveTip"),
					that = this;

				//保存
				$topSaveTip.on("click", ".btnSave", function() {

					var data = App.Project.Settings.Viewer.saveComment(),
						pars = {
							img: data.image
						};

					if (viewPointId) {

						var $li = $comment.find(".remarkCount_" + viewPointId).closest(".item");

						pars = {
							id: $li.find(".remarkCount").data("id"),
							type: $li.find(".thumbnailImg").data("type"),
							img: $li.find(".thumbnailImg").prop('src'),
							name: $li.find(".title").text().trim(),
							desc: $li.find(".desc").text().trim()
						}
					}


					var dialogHtml = _.templateUrl('/libsH5/tpls/comment/bimview.save.dialog.html')(pars),

						opts = {
							title: "保存快照",
							width: 500,
							height: 250,
							cssClass: "saveViewPoint",
							okClass: "btnWhite",
							cancelClass: "btnWhite",
							okText: "保存",
							cancelText: "保存并分享",
							message: dialogHtml,
							okCallback: () => {
								//保存批注
								if (!viewPointId) {
									that.saveComment(dialog, data);
								} else {
									data.id = viewPointId;
									that.editComment(dialog, data, viewPointId);
								}


								return false;
							},
							cancelCallback() {

								if (!viewPointId) {
									that.saveComment(dialog, data, CommentApi.shareViewPoint);
								} else {
									data.id = viewPointId;
									that.editComment(dialog, data, CommentApi.shareViewPoint);
								}

								return false;
							}
						},

						dialog = new App.Comm.modules.Dialog(opts),

						$viewPointType = dialog.element.find(".viewPointType");

					dialog.type = 1;
					//视点类型
					$viewPointType.myDropDown({
						click: function($item) {
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
				$topSaveTip.on("click", ".btnCanel", function() {
					App.Project.Settings.Viewer.commentEnd();
				});

			},

			//保存批注
			saveComment(dialog, commentData, callback) {

				if (dialog.isSubmit) {
					return;
				}
				var $element = dialog.element,
					pars = {
						projectId: App.Project.Settings.projectId,
						name: dialog.element.find(".name").val().trim(),
						description: dialog.element.find(".desc").val().trim(),
						type: dialog.type,
						viewPoint: commentData.camera
					};

				if (!pars.name) {
					alert("请输入批注名称");
					return false;
				}

				// if (!pars.description) {
				// 	alert("请输入批注描述");
				// 	return false;
				// }

				var data = {
					URLtype: "createViewPoint",
					data: JSON.stringify(pars),
					type: "POST",
					contentType: "application/json"
				}

				//保存中
				dialog.element.find(".ok").text("保存中");
				dialog.isSubmit = true;

				//创建
				App.Comm.ajax(data, (data) => {

					if (data.code == 0) {

						data = data.data;
						//赋值id
						commentData.id = data.id;
						//保存 图片 canvas filter
						$.when(this.saveImage({
								id: data.id,
								img: commentData.image
							}),
							this.saveAnnotation(commentData),
							this.saveFilter(commentData)).
						done((imgData, annotationData, filterData) => {

							imgData = imgData[0];

							annotationData = annotationData[0];

							filterData = filterData[0];

							//成功
							if (imgData.code == 0 && annotationData.code == 0 && filterData.code == 0) {

								imgData.data.isAdd = true;
								//项目 
								if ($comment.find(".navBar .project").hasClass("selected")) {
									CommentCollections.Project.push(imgData.data);
								} else {
									//个人
									CommentCollections.User.push(imgData.data);
								}

								//关闭弹出层 取消编辑状态
								dialog.close();

								$("#topSaveTip .btnCanel").click();

								if ($.isFunction(callback)) {
									callback(imgData.data);
								}
							}

						});

					}

				});

			},

			//保存图片
			saveImage(data) {
				//数据
				var formdata = new FormData();
				formdata.append("fileName", (+(new Date())) + ".png");
				formdata.append("size", data.img.length);
				formdata.append("file", data.img);
				var url = '/sixD/' + App.Project.Settings.projectId + '/viewPoint/' + data.id + '/pic';
				return $.ajax({
					url: url,
					type: "post",
					data: formdata,
					processData: false,
					contentType: false
				})
			},

			//保存批注数据
			saveAnnotation(commentData) {

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
					}

				return App.Comm.ajax(data);
			},

			//保存过滤器
			saveFilter(commentData) {

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
					}

				return App.Comm.ajax(data);
			},

			//分享视点
			shareViewPoint(obj) {



				var data = {
					URLtype: 'shareComment',
					type:"POST",
					contentType:'application/json',
					data: JSON.stringify({
						projectId: App.Project.Settings.CurrentVersion.projectId,
						projectVersionId: App.Project.Settings.CurrentVersion.id,
						viewpointId: obj.id
					})
				}

				App.Comm.ajax(data, function(data) {

					if (data.code == 0) {
						obj.url=data.data.url;
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
						var clip = new ZeroClipboard($btnCopy);

						clip.on("complete", function(e) {
							alert("您已经复制了链接地址");
						});

					}


				});



			},

			//编辑 批注
			editComment(dialog, commentData, callback) {

				if (dialog.isSubmit) {
					return;
				}
				var $element = dialog.element,
					that = this,
					pars = {
						viewPointId: commentData.id,
						projectId: App.Project.Settings.projectId,
						name: dialog.element.find(".name").val().trim(),
						description: dialog.element.find(".desc").val().trim(),
						type: dialog.type
					};

				if (!pars.name) {
					alert("请输入批注名称");
					return false;
				}

				var data = {
					URLtype: "updateViewPoint",
					data: JSON.stringify(pars),
					type: "PUT",
					contentType: "application/json"
				}

				//保存中
				dialog.element.find(".ok").text("保存中");
				dialog.isSubmit = true;

				//创建
				App.Comm.ajax(data, (data) => {

					if (data.code == 0) {

						//请求
						$.when(this.saveImage({
							id: commentData.id,
							img: commentData.image
						}), this.updateAnnotation(commentData)).
						done((imgData, annotationData) => {

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

								$.each(models, function() {
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


					}

				});

			},

			//更新批注
			updateAnnotation(commentData) {
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
					}

				return App.Comm.ajax(data);
			}

		}


	//关闭批注
	bimView.prototype.commentEnd = function() {
		// 退出批注模式
		var self = this;
		var viewer = self.viewer;
		self._dom.bimBox.attr('class', 'bim');
		self._dom.bimBox.find('.commentBar').remove();
		viewer.editCommentEnd();
		viewer.setPickMode();
		//删除保存
		$("#topSaveTip").remove();
	};

})();