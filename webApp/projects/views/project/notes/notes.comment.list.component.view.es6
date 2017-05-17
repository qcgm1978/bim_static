App.Project.NotesCommentComponentView = Backbone.View.extend({
	tagName: "li",
	className: "",
	template:_.templateUrl("/projects/tpls/project/notes/project.notes.comment.component.html"),
	default:{
	},
	events:{
		"click .deleteNotesCommentBtn":"deleteNotesCommentHandle",//删除批注的评论
		"click .commentLookModel":"commentLookModelHandle",//评论里面的查看模型方法
		"click .attachmentThumbnailBox":"commentImgHandle",//评论里面的缩略图查看模型方法
		"click .canDownloadFile":"canDownloadFileHandle",//评论里面的评论附件下载方法
	},
	render: function() {
		this.$el.html(this.template(this.model));
		return this;
	},
	canDownloadFileHandle(event){//评论里面的评论附件下载方法
		var projectid = parseInt(App.Project.Settings.projectId);
		var viewpointid = $(event.target).closest("a.canDownloadFile").data("viewpointid");
		var attachmentid = $(event.target).closest("a.canDownloadFile").data("attachmentid");
		var downloadUrl = window.location.origin+"/sixD/"+projectid+"/viewPoint/"+viewpointid+"/comment/"+attachmentid+"/download";
		window.open(downloadUrl,"_blank");
	},
	commentLookModelHandle(event){//评论里面的查看模型方法
		var target = $(event.target);
		var viewpointInput = $("#viewpointInput");
		viewpointInput.attr("data-viewpoint",target.data("viewpointid"));
		App.Project.NotesCollection.clickModelHandle();//执行查看模型方法
	},
	commentImgHandle(event){
		var target = $(event.target).closest("div.attachmentThumbnailBox");
		var viewpointInput = $("#viewpointInput");
		viewpointInput.attr("data-viewpoint",target.data("viewpointid"));
	},
	deleteNotesCommentHandle(evt){//删除批注的快照
		var notesId = $(evt.target).data("id");
		var viewpointid = $(evt.target).data("viewpointid");
		$.confirm("确认删除该评论么？", function() {
			var pars = {
				projectId:parseInt(App.Project.Settings.projectId),
				viewPointId:viewpointid,
				commentId:notesId,
				
			}
			var data = {
				URLtype: "deleteNotesComment",
				data: pars,
				type: "delete"
			}
			App.Comm.ajax(data, (data) => {
				if (data.code == 0) {
					App.Project.NotesCollection.getCommentListHandle();//共用了获取批注评论列表的方法
				} else {
					alert(data.message);
				}
			})
		});
	}
	
})