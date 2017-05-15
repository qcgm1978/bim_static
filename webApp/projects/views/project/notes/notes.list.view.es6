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
		var hosttype = target.children("input").data("hosttype");
		var viewpointInput = $("#viewpointInput");
		this.initAddCommentHandle();//初始化添加批注评论方法
		viewpointInput.attr("data-viewpoint",target.children("input").data("viewpointid"));
		if(evt.target.tagName == "A"){
			var $data = target.find("input");
			if(evt.target.innerText == "查看模型"){
				App.Project.NotesCollection.clickModelHandle();//执行查看模型方法
				return false;
			}else if(evt.target.innerText == "编辑"){
				this.editNotesHandle($data);//编辑批注的方法
				return false;
			}else if(evt.target.innerText == "删除"){
				this.deleteNotes(notesId);//删除批注的方法
				return false;
			}else if(evt.target.innerText == "分享"){
				this.shareNotesHandle($data);//删除批注的方法
				return false;
			}
		}else if(evt.target.tagName !== "IMG"){
			if(!target.hasClass('notesSelectClass')){
				var target = $(evt.target).closest("li");
				var notesId = target.children("input").data("notesid");
				if(!target.hasClass('notesSelectClass')){
					target.siblings().removeClass("notesSelectClass").end().addClass('notesSelectClass');
				}
				if(notesId){//如果当前点击的批注存在id则去获取批注评论的列表
					App.Project.NotesCollection.defaults.viewpointId = notesId;
					App.Project.NotesCollection.defaults.pageIndexComment=1;
					App.Project.NotesCollection.getCommentListHandle();
					App.Project.NotesCollection.defaults.hosttype = target.children("input").data("hosttype");//当前点击的批注是什么类型的
				}
				if(hosttype == 0){
					$("a.uploadsnapshot").css("display","inline-block");
				}
			}
		}
	},
	initAddCommentHandle(){//初始化添加批注评论方法
		var addCommentBox = this.$("#addCommentBox");
		var AddCommentView = new App.Project.AddCommentView();
		addCommentBox.html(AddCommentView.render().el);
	},
	editNotesHandle($li) {//编辑批注的方法
		var _this = this;
		var data = {
			cate: "viewPoint",
			id: $li.data("notesid"),
			type: $li.data("notestype"),
			img: $li.data('notesimgsrc'),
			name: $li.data("notesname")
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
				_this.updateComment(dialog);
				return false;
			}
		},
		dialog = new App.Comm.modules.Dialog(opts);
		dialog.type = data.type;
		dialog.id = data.id;
	},
	updateComment(dialog) {//编辑批注点击弹出层按钮执行的方法
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
				message: "请输入快照名称",
				timeout: 3000,
				type: "alarm"
			});
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
		App.Comm.ajax(data, (data) => {
			if (data.code == 0) {
				dialog.close();
				App.Project.NotesCollection.getNotesListHandle();//共用了获取批注列表的方法
			} else {
				alert(data.message);
				dialog.isSubmit = false;
				dialog.element.find(".ok").text("保存");
			}
		})
	},
	shareNotesHandle($li) {//分享批注的方法
		var data = {
			id: $li.data("notesid"),
			pic: $li.data('notesimgsrc'),
			creatorName: $li.data('notescretorname'),
			name: $li.data("notesname"),
			createTime: $li.data("notescretortime")
		};
		this.shareViewPointData(data);
	},
	shareViewPointData(obj) {//分享批注点击弹出层按钮执行的方法
		var clipboard;
		var data = {
			URLtype: 'shareComment',
			type: "POST",
			contentType: 'application/json',
			data: JSON.stringify({
				projectId: App.Project.Settings.projectId,
				projectVersionId: App.Project.Settings.versionId,
				viewpointId: obj.id
			})
		}
		App.Comm.ajax(data, function(data) {
			if (data.code == 0) {
				obj.url = "http://" + location.host + "/" + data.data.url;
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
				if (clipboard) {
					clipboard.destroy();
				}
				clipboard = new Clipboard(".saveViewPoint .btnCopy");
				clipboard.on('success', function(e) {
					$.tip({
						message: "您已经复制了链接地址",
						timeout: 3000
					});
					e.clearSelection();
				});
			}
		});
	},
	deleteNotes(notesId) {//删除批注的方法
		$.confirm("确认删除该快照么？", function() {
			var pars = {
				projectId:parseInt(App.Project.Settings.projectId),
				viewPointId:notesId
			}
			var data = {
				URLtype: "deleteViewpointById",
				data: pars,
				type: "delete"
			}
			App.Comm.ajax(data, (data) => {
				App.Project.NotesCollection.getNotesListHandle();//共用了获取批注列表的方法
				// if (data.code == 0) {
				// 	App.Project.NotesCollection.getNotesListHandle();//共用了获取批注列表的方法
				// } else {
				// 	alert(data.message);
				// }
			})
		});
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
		if(data.creatorId == App.Comm.user("userId")){
			data.editDeleteBool = true;
		}else{
			data.editDeleteBool = false;
		}
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