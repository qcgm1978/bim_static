App.Project.NotesCommentView = Backbone.View.extend({
	tagName: "div",
	className: "commetnListBox",
	template:_.templateUrl("/projects/tpls/project/notes/project.notes.comment.list.html",true),
	initialize() {//初始化
		this.listenTo(App.Project.NotesCollection.GetCommentListCollection, "add", this.addOne);
		this.listenTo(App.Project.NotesCollection.GetCommentListCollection, "reset", this.resetList);
	},
	render: function() {
		this.$el.html(this.template);
		this.initAddCommentHandle();//初始化添加评论模块
		return this;
	},
	initAddCommentHandle(){//初始化添加批注评论方法
		var addCommentBox = this.$("#addCommentBox");
		var AddCommentView = new App.Project.AddCommentView();
		addCommentBox.html(AddCommentView.render().el);
	},
	addOne(model){//初始化复选框事件
		var data = model.toJSON();
		var commentComponentBox = this.$("#commentComponentBox");
		var NotesCommentComponentView = new App.Project.NotesCommentComponentView({model:data});//批注评论列表单个组件的视图
		commentComponentBox.append(NotesCommentComponentView.render().el);
		this.bindScroll();
	},
	resetList(){//重置加载
		this.$("#commentComponentBox").html('<li class="loading">正在加载，请稍候……</li>');
	},
	bindScroll:function(){//绑定滚动条
		if(this.$el.find("div.commentScroll").hasClass('mCustomScrollbar')){
			this.$(".reMarkListScroll").mCustomScrollbar("update");
		}else{
			this.$el.find("div.commentScroll").mCustomScrollbar({
				theme: 'minimal-dark',
				axis: 'y',
				keyboard: {
					enable: true
				},
				scrollInertia: 0,
			}); 
		}
	},
})