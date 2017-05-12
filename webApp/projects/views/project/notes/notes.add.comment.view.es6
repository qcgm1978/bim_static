App.Project.AddCommentView = Backbone.View.extend({
	tagName: "div",
	className: "addCommentBox",
	template:_.templateUrl("/projects/tpls/project/notes/project.notes.add.comment.html"),
	default:{
		attachments:[],
		atUserArrs:[],
	},
	events:{
		"click .uploadTypeBtn .uploadImg":"uploadImgHandle",//点击评论上传图片按钮执行的方法
		"change .uploadTypeBtn .fileButton":"fileButtonHandle",//点击评论上传图片按钮执行的方法
		"click .deleteUploadImg":"deleteUploadImgHandle",//点击删除上传图片的方法
		"click .uploadBtn":"uploadBtnHandle",//点击评论按钮执行的方法
		"click .uploadTypeBtn .uploadsnapshot":"uploadsnapshotHandle",//点击插入模型批注视角按钮执行的方法
	},
	render: function() {
		this.$el.html(this.template({hosttype:App.Project.NotesCollection.defaults.hosttype}));
		this.atHandle();//at用户方法
		return this;
	},
	atHandle(){
		var _this = this;
		this.$(".textareaBox textarea").at({
			getData: function(name) {
				//返回数据源
				var data = {
					URLtype: "autoComplateUser",
					data: {
						projectId: App.Project.Settings.projectId,
						name: name
					}
				}
				return App.Comm.ajax(data);
			},
			callback: function($item) {
				//点击单个用户回调
				_this.default.atUserArrs.push({
					userId: $item.data("uid") + "",
					userName: $item.find(".name").text().trim()
				});
			}
		});
	},
	uploadImgHandle(evt){//点击评论上传图片按钮执行的方法
		var viewPointId = App.Project.NotesCollection.defaults.viewpointId;
		var url = "sixD/" + App.Project.Settings.projectId + "/viewPoint/" + viewPointId + "/comment/pic";
		$("#commentUploadImageForm").prop("action", url);
		//上传完成
		if (!this.bindUpload) {
			this.uploadSuccess();
			this.bindUpload = true;
		}
		return this.$(".fileButton").click();
	},
	fileButtonHandle() {//提交
		$("#commentUploadImageForm").submit();
	},
	uploadSuccess(event) {//图片上传成功之后的方法
		var that = this;
		$("#commentUploadIframe").on("load", function(event) {
			var data = JSON.parse(this.contentDocument.body.innerText);
			var commentAttachmentListBox = $("#commentAttachmentListBox");
			var html="";
			if (data.code == 0) {
				data = data.data;
				html += '<li>'
							+'<div class="imgThumbnailBox"><img src="'+data.pictureUrl+'"></div>';
				if(data.type==1){
					html += '<span class="imgThumbnailType">[图片]</span>';
				}else if(data.type==3){

				}else if(data.type==4 || data.type==4){

				}
				html +=	'<span class="imgThumbnailName">'+data.description+'</span>'
						+'<a href="javascript:;" data-id="'+data.id+'" class="deleteUploadImg">删除</a>'
					+'</li>';
				commentAttachmentListBox.append(html);
				that.default.attachments.push(data.id);
				that.bindCommentScroll();
			}
		});
	},
	deleteUploadImgHandle(target){//点击删除上传图片的方法
		for (var i = 0,len=this.default.attachments.length; i<len; i++) {
			if(this.default.attachments[i]==$(event.target).data("id")){
				this.default.attachments.splice(i,1);
				$(event.target).closest("li").remove();
			}
		}
	},
	uploadBtnHandle(event){//点击评论按钮执行的方法
		var $btnEnter = $(event.target);
		if($btnEnter.data("issubmit")){
			return;
		}
		//开始配置@用户列表的方法
		var texts = this.$(".textareaBox textarea").val().trim().split('@'),
			textsUniq = [],
			atUserArrs = [];
		for (var i = 1; i < texts.length; i++) {
			_.contains(textsUniq, texts[i].split(' ')[0]) ? '' : textsUniq.push(texts[i].split(' ')[0]);
		}
		for (var j = 0; j < textsUniq.length; j++) {
			for (var k = 0; k < this.default.atUserArrs.length; k++) {
				if (this.default.atUserArrs[k]['userName'] == textsUniq[j]) {
					atUserArrs.push(this.default.atUserArrs[k]);
					break;
				}
			}

		}
		//结束配置@用户列表的方法
		var pars = {
				projectId: parseInt(App.Project.Settings.projectId),
				viewPointId: App.Project.NotesCollection.defaults.viewpointId,
				text: this.$(".textareaBox textarea").val().trim(),
				attachments: this.default.attachments,//评论附件id列表
				projectVersionId: parseInt(App.Project.Settings.versionId),
				receivers: this.default.atUserArrs,// 消息接收者列表
			},
			data = {
				URLtype: "createComment",
				data: JSON.stringify(pars),
				type: "POST",
				contentType: "application/json"
			};
		if (!this.$(".textareaBox textarea").val().trim()) {//没有输入评论内容
			$.tip({
				message: "请输入评论内容",
				timeout: 3000,
				type: "alarm"
			});
			return;
		}
		$btnEnter.html("保存中").attr("data-issubmit", true);
		//创建
		App.Comm.ajax(data, (data) => {
			if (data.code == 0) {
				App.Project.NotesCollection.getCommentListHandle({viewpointId:data.data.viewpointId});
			}
		})
	},
	uploadsnapshotHandle(){//点击插入模型批注视角按钮执行的方法
		var _this = this;
		var addModelBgHtmlDom = $("<div class='addModelBgHtmlDom'></div>");
		var addModelHtmlDom = $("<div class='addModelHtmlDom'><div class='addModelHtmlDomBox'><div id='addModelHtmlDomTitleBox' class='addModelHtmlDomTitleBox'><span>创建快照</span><a href='javascript:;' id='closeDialogModelBtn'></a></div><div id='addModelHtmlDomContentBox' class='addModelHtmlDomContentBox'></div></div></div>");
		var NotesCommentAddModelView = new App.Project.NotesCommentAddModelView();
		addModelBgHtmlDom.width($(window).width());
		addModelBgHtmlDom.height($(window).height());
		addModelHtmlDom.width($(window).width());
		addModelHtmlDom.height($(window).height());
		addModelHtmlDom.css("padding","32px");
		addModelBgHtmlDom.appendTo($("body"));
		addModelHtmlDom.appendTo($("body"));
		var addModelHtmlDomContentBox = $("#addModelHtmlDomContentBox");
		addModelHtmlDomContentBox.html(NotesCommentAddModelView.render().el);
		$("#closeDialogModelBtn").off("click");
		$("#closeDialogModelBtn").on("click",function(){
			$(".addModelBgHtmlDom").fadeOut();
			$(".addModelHtmlDom").fadeOut();
			var projectContainer = $("#projectContainer");
			projectContainer[0].appendChild($("#dialogModelBox .projectCotent")[0]);
			$(".addModelBgHtmlDom").remove();
			$(".addModelHtmlDom").remove();
		})
		if (App.Project.Settings.DataModel && App.Project.Settings.DataModel.sourceId) {
    		_this.typeContentChange();
    	} else {
    		_this.fetchModelIdByProject();
    	}
	},
	typeContentChange(){
		var dialogModelBox = $("#dialogModelBox");
		dialogModelBox[0].appendChild($("#projectContainer .projectCotent")[0]);
		App.Project.NotesCollection.renderModelCallBackHandle();
	},
	fetchModelIdByProject: function() {
		var data = {
			URLtype: "fetchModelIdByProject",
			data: {
				projectId: App.Project.Settings.projectId,
				projectVersionId: App.Project.Settings.CurrentVersion.id
			}
		};
		var that = this;
		App.Comm.ajax(data, function(data) {
			if (data.message == "success") {
				if (data.data) {
					App.Project.Settings.DataModel = data.data;
					var viewer = App.Project.Settings.Viewer = new bimView({
						type: 'model',
						element: $("#dialogModelBox"),
						sourceId: App.Project.Settings.DataModel.sourceId,
						etag: App.Project.Settings.DataModel.etag,
						projectId: App.Project.Settings.projectId,
						projectVersionId: App.Project.Settings.CurrentVersion.id
					});
					viewer.on("loaded", function() {
						//加载数据
						viewer.filter({
							ids: ['10.01'],
							type: "classCode"
						});
						/*add by wuweiwei init filter checkbox state*/
						$($("#specialty .itemContent")[0]).find(".m-lbl").addClass("m-lbl-2");
						App.Project.NotesCollection.renderModelCallBackHandle();
					});
				} else {
					alert("模型转换中");
				}
			} else {
				alert(data.message);
			}
		});
	},
	bindCommentScroll:function(){//绑定滚动条
		if($("#uploadListBox").hasClass('mCustomScrollbar')){
			$("#uploadListBox").mCustomScrollbar("update");
		}else{
			$("#uploadListBox").mCustomScrollbar({
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
