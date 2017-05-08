App.Project.NotesListView = Backbone.View.extend({
	tagName: "div",
	className: "notesContentBox",
	template:_.templateUrl("/projects/tpls/project/notes/project.notes.content.html",true),
	default:{
	},
	render: function() {
		this.$el.html(this.template);
		this.initToMeHandle();//初始化是否与我相关组件
		this.loadNotesListHandle();//进入进来 获取批注列表的方法
		return this;
	},
	initToMeHandle(){//初始化是否与我相关组件
		var notesContentBoxTop = this.$("#notesContentBoxTop");
		var NotesToMeView = new App.Project.NotesToMeView;//上部是否与我相关的视图组件
		notesContentBoxTop.html(NotesToMeView.render().el);
	},
	loadNotesListHandle(){//进入进来 获取批注列表的方法
		App.Project.NotesCollection.getNotesListHandle();//共用了获取批注列表的方法
	}
})