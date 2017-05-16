App.Project.NotesContentView = Backbone.View.extend({
	tagName: "div",
	className: "notesContentBox",
	template:_.templateUrl("/projects/tpls/project/notes/project.notes.content.html",true),
	render: function() {
		this.$el.html(this.template);//渲染批注内容部分结构
		this.initToMeHandle();//初始化是否与我相关组件
		this.initNotesListHandle();//初始化批注列表页面结构功能
		this.initNotesCommentHandle()//进入之后初始化批注评论结构
		return this;
	},
	initToMeHandle(){//初始化是否与我相关组件
		var notesContentBoxTop = this.$("#notesContentBoxTop");
		var NotesToMeView = new App.Project.NotesToMeView;//上部是否与我相关的视图组件
		notesContentBoxTop.html(NotesToMeView.render().el);
	},
	initNotesListHandle(){//初始化批注列表页面结构功能
		var leftNotesListBox = this.$("#leftNotesListBox");
		var NotesListDomView = new App.Project.NotesListDomView;//批注列表页面结构view
		leftNotesListBox.prepend(NotesListDomView.render().el);
	},
	initNotesCommentHandle(){//进入之后初始化批注评论结构
		var rightNotesCommentListBox = this.$("#rightNotesCommentListBox");
		var NotesCommentView = new App.Project.NotesCommentView;//右侧批注评论的视图组件
		rightNotesCommentListBox.html(NotesCommentView.render().el);
	},
})