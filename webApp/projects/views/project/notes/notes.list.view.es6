App.Project.NotesListView = Backbone.View.extend({
	tagName: "div",
	className: "notesContentBox",
	template:_.templateUrl("/projects/tpls/project/notes/project.notes.content.html",true),
	default:{
		
	},
	events:{
		"click .clickItem":"notesClickHandle",//点击每个批注执行的方法
	},
	initialize() {//初始化
		this.listenTo(App.Project.NotesCollection.GetNotesListCollection, "add", this.addOne);
		this.listenTo(App.Project.NotesCollection.GetNotesListCollection, "reset", this.resetList);
	},
	render: function() {
		this.$el.html(this.template);
		this.initToMeHandle();//初始化是否与我相关组件
		this.loadNotesListHandle();//进入进来 获取批注列表的方法
		this.initCommentHandle()//进入之后初始化批注评论结构
		return this;
	},
	notesClickHandle(evt){//点击每个批注执行的方法
		var target = $(evt.target).closest("li");
		var notesId = target.children("input").data("notesid");
		if(evt.target.tagName == "A"){
			return false;
		}else if(evt.target.tagName !== "IMG"){
			var target = $(evt.target).closest("li");
			var notesId = target.children("input").data("notesid");
			if(!target.hasClass('notesSelectClass')){
				target.siblings().removeClass("notesSelectClass").end().addClass('notesSelectClass');
			}
			if(notesId){//如果当前点击的批注存在id则去获取批注评论的列表
				App.Project.NotesCollection.defaults.viewpointId = notesId;
				App.Project.NotesCollection.defaults.pageIndexComment=1;
				App.Project.NotesCollection.getCommentListHandle();
			}
		}else if(evt.target.tagName == "IMG"){
			$("#viewpointInput").attr("data-viewpoint",target.children("input").data("viewpointid"));
		}
	},
	initCommentHandle(){//进入之后初始化批注评论结构
		var rightNotesCommentListBox = this.$(".rightNotesCommentListBox");
		var NotesCommentView = new App.Project.NotesCommentView;//上部是否与我相关的视图组件
		rightNotesCommentListBox.html(NotesCommentView.render().el);
	},
	initToMeHandle(){//初始化是否与我相关组件
		var notesContentBoxTop = this.$("#notesContentBoxTop");
		var NotesToMeView = new App.Project.NotesToMeView;//上部是否与我相关的视图组件
		notesContentBoxTop.html(NotesToMeView.render().el);
	},
	loadNotesListHandle(){//进入进来 获取批注列表的方法
		var leftNotesListBox = this.$("#leftNotesListBox");
		leftNotesListBox.html("");
		App.Project.NotesCollection.getNotesListHandle();//共用了获取批注列表的方法
	},
	addOne(model){//每一条数据 进行处理
		var data = model.toJSON();
		var leftNotesListBox = this.$("#leftNotesListBox");
		var NotesListComponentView = new App.Project.NotesListComponentView({model:data});//批注列表单个组件的视图
		leftNotesListBox.append(NotesListComponentView.render().el);
		this.bindScroll();
	},
	resetList(){//重置加载
		this.$("#leftNotesListBox").html('<li class="loading">正在加载，请稍候……</li>');
	},
	bindScroll:function(){//绑定滚动条
		if(this.$el.find("div.scrollBox").hasClass('mCustomScrollbar')){
			this.$(".reMarkListScroll").mCustomScrollbar("update");
		}else{
			this.$el.find("div.scrollBox").mCustomScrollbar({
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