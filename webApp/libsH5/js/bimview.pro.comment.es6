/**
 * @require /libsH5/js/bimView.js 
 * @require /libsH5/js/bimView.prototype.js 
 */


;
(function() {

	var $comment, AppView;

	//扩展 批注
	bimView.prototype.commentInit = function() {
		 return
		//单利 不存在 则 新建
		if (!AppView) {

			AppView = new CommentView.App().render();

			$comment = $('#comment');
			//生成
			$comment.html(AppView.$el);
		}

		//显示
		bimView.sidebar.comment(true)

	}

	//集合
	var CommentCollections={
		//项目
		Project:new (Backbone.Collection.extend({

			model:Backbone.Model.extend({
				defualt:{
					title:""
				}
			}),

			urlType:"projectPhoto",
		})),

		//用户
		User:new (Backbone.Collection.extend({

			model:Backbone.Model.extend({
				defaults:{
					title:""
				}
			}),

			urlType:"userPhoto"

		})),
	}


	var CommentView = { 


		//入口
		App: Backbone.View.extend({

			el: "div",

			className: "commentList",

			events:{
				".navBar .item":"itemClick"
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
			itemClick(event){

				var $el=$(event.target).closest("li"),type=$el.data("type");

				//项目视点
				if (type=="project") {

					this.$(".projectListScroll").show();

				}else if (type=="user") {
					//个人视点

					this.$(".userListScroll").show();

				}else if (type=="save") {
					//保存



				}

			}

		}),

		//项目
		Project:Backbone.View.extend({

			el:"div",

			className:"projectList",

			//初始化
			initialize(){
				this.listenTo(CommentCollections.Project,"add",this.addOne),
				this.listenTo(CommentCollections.Project,"reset",this.reLoading)
			},

			render(){
				return this;
			},

			//新增数据
			addOne(){

			},

			//重新加载
			reLoading(){

			}

		}),

		//用户
		User:Backbone.View.extend({

			el:"div",

			className:"userList",

			//初始化
			initialize(){
				this.listenTo(CommentCollections.Project,"add",this.addOne),
				this.listenTo(CommentCollections.Project,"reset",this.reLoading)
			},

			render(){
				return this;
			},

			//新增数据
			addOne(){

			},

			//重新加载
			reLoading(){
				
			}

		}),


	}


})();