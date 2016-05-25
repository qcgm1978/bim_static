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

	var $comment, AppView;

	//扩展 批注
	bimView.prototype.commentInit = function() {

		//单利 不存在 则 新建
		if (!AppView) {

			AppView = new CommentView.App().render();

			$comment = $('#comment');
			//生成
			$comment.html(AppView.$el);
		}

		//显示
		bimView.sidebar.comment(true);

		$("#comment .navBar .item.project").click();

	}

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
				if (response.code == 0) {
					return response.data.items;
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
				if (response.code == 0) {
					return response.data.items;
				}
			}

		}))
	}


	var CommentView = {


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
					CommentCollections.User.reset();
					CommentCollections.User.fetch();

					$el.addClass("selected").siblings().removeClass("selected");
					//绑定滚动条
					App.Comm.initScroll(this.$(".userListScroll"), "y");

				} else if (type == "save") {
					//保存


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
				this.listenTo(CommentCollections.Project, "reset", this.reLoading)
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
				this.listenTo(CommentCollections.User, "add", this.addOne),
					this.listenTo(CommentCollections.User, "reset", this.reLoading)
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

			//重新加载
			reLoading() {
				 
				this.$el.html('<li class="loading">正在加载，请稍候……</li>');
			}

		}),

		//单个列表
		listDetail: Backbone.View.extend({

			tagName: "li",

			className: "item",

			template: _.templateUrl('/libsH5/tpls/comment/bimview.pro.comment.list.detail.html'),

			render() {

				var data = this.model.toJSON();

				this.$el.html(this.template(data));

				return this;

			}

		})


	}


})();