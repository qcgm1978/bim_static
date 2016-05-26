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

	var $comment, AppView, ModelView;

	//扩展 批注
	bimView.prototype.commentInit = function() {


		//单利 不存在 则 新建
		if (!AppView) {
			ModelView = this;
			AppView = new CommentView.App().render();

			$comment = $('#comment');
			//生成
			$comment.html(AppView.$el);
		}

		//显示
		bimView.sidebar.comment(true);

		$("#comment .navBar .item.project").click();

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

	//集合
	var CommentCollections = {
			//项目
			Project: new(Backbone.Collection.extend({

				model: Backbone.Model.extend({
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
					defaults: {
						title: ""
					}
				}),

				urlType: "viewComments",

				parse(response, options) {
					if (response.code == 0) {
						return response.data.items;
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

				template: _.templateUrl('/libsH5/tpls/comment/bimview.pro.comment.html', true),

				//渲染
				render() {
					//模板
					this.$el.html(this.template);
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
						//获取数据
						CommentCollections.Project.projectId = App.Project.Settings.projectId;
						CommentCollections.Project.reset();
						CommentCollections.Project.fetch();


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
					this.listenTo(CommentCollections.Project, "dataNull", this.dataNull)
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
					this.$el.append($list);
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

					this.$el.append($list);

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
					"click .remarkCount": "viewComments"
				},

				template: _.templateUrl('/libsH5/tpls/comment/bimview.pro.comment.list.detail.html'),

				render() {

					var data = this.model.toJSON();

					this.$el.html(this.template(data));

					return this;

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

					CommentCollections.ViewComments.reset();
					CommentCollections.ViewComments.fetch();

				}

			}),

			//
			ReMark: Backbone.View.extend({

				tagName: "div",

				className: "reMarkBox",

				events: {
					"click .goList": "goList",
					"focus .txtReMark": "inputReMark", //输入评论
					"blur .txtReMark": "outReMark" //失去焦点
				},

				initialize() {
					this.listenTo(CommentCollections.ViewComments, "add", this.addOne);
					this.listenTo(CommentCollections.ViewComments, "reset", this.reLoading);
				},

				template: _.templateUrl('/libsH5/tpls/comment/bimview.remark.html', true),

				//渲染
				render() {
					//模板
					this.$el.html(this.template);


					return this;
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

				//返回列表
				goList() {

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
				}

			}),

			//讨论列表
			ReMarkListDetail: Backbone.View.extend({

				tagName: "li",

				className: "item",

				template: _.templateUrl("/libsH5/tpls/comment/bimview.remark.list.detail.html"),

				render() {

					var data = this.model.toJSON();

					this.$el.html(this.template(data));

					return this;

				}

			})

		},


		CommentApi = {

			//绑定保存 批注事件
			saveCommEvent() {

				var $topSaveTip = $("#topSaveTip");

				//保存
				$topSaveTip.on("click", ".btnSave", function() {

					var dialogHtml = _.templateUrl('/libsH5/tpls/comment/bimview.save.dialog.html')({});

					var opts = {
						title: "保存快照",
						width: 601,						
						height: 400, 
						cssClass: "saveViewPoint",
						okClass:"btnWhite",
						cancelClass:"btnWhite",
						okText:"保存",
						cancelText:"保存并分享",
						message: dialogHtml,
						okCallback: () => {
							 
						} 
					} 
					var dialog = new App.Comm.modules.Dialog(opts);

				});

				//取消
				$topSaveTip.on("click", ".btnCanel", function() {
					App.Project.Settings.Viewer.commentEnd();
				});

			}


		}

})();