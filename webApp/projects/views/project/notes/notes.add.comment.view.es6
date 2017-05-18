App.Project.AddCommentView = Backbone.View.extend({
	tagName: "div",
	className: "addCommentBox",
	template:_.templateUrl("/projects/tpls/project/notes/project.notes.add.comment.html",true),
	events:{
		"click .uploadTypeBtn .uploadImg":"uploadImgHandle",//点击评论上传图片按钮执行的方法
		"click .uploadTypeBtn .uploadFile":"uploadFileHandle",//点击评论上传文件按钮执行的方法
		"change .uploadTypeBtn .fileButton":"fileButtonHandle",//点击评论上传按钮执行的方法
		"change .uploadTypeBtn .uploadFileButton":"fileButtonHandle",//点击评论上传按钮执行的方法
		"click .deleteUploadImg":"deleteUploadImgHandle",//点击删除上传图片的方法
		"click .uploadBtn":"uploadBtnHandle",//点击评论按钮执行的方法
		"click .uploadTypeBtn .uploadsnapshot":"uploadsnapshotHandle",//点击插入模型批注视角按钮执行的方法
	},
	render: function() {
		this.$el.html(this.template);
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
				App.Project.NotesCollection.defaults.atUserArrs.push({
					userId: $item.data("uid") + "",
					userName: $item.find(".name").text().trim()
				});
			}
		});
	},
	uploadImgHandle(evt){//点击评论上传图片按钮执行的方法
		var viewPointId = App.Project.NotesCollection.defaults.viewpointId;
		var url = "sixD/" + App.Project.Settings.projectId + "/viewPoint/" + viewPointId + "/comment/pic";
		var commentUploadImageForm = $("#commentUploadImageForm");
		var uploadImgDom = $('<input type="file" name="uploadImg" class="fileButton" value="上传图片" accept="image/*" />');
		if(commentUploadImageForm.find(".uploadFileButton").length>0){
			commentUploadImageForm.find(".uploadFileButton").remove();
		}
		if(commentUploadImageForm.find(".fileButton").length==0){
			commentUploadImageForm.prepend(uploadImgDom).prop("action", url);
		}
		//上传完成
		if (!this.bindUpload) {
			this.uploadSuccess();
			this.bindUpload = true;
		}
		return this.$(".fileButton").click();
	},
	uploadFileHandle(){//点击评论上传文件按钮执行的方法
		var viewPointId = App.Project.NotesCollection.defaults.viewpointId;
		var url = "sixD/" + App.Project.Settings.projectId + "/viewPoint/" + viewPointId + "/comment/doc";
		var commentUploadImageForm = $("#commentUploadImageForm");
		var uploadFileButton = $('<input type="file" name="uploadFile" class="uploadFileButton" value="上传文件" />');
		if(commentUploadImageForm.find(".fileButton").length>0){
			commentUploadImageForm.find(".fileButton").remove();
		}
		if(commentUploadImageForm.find(".uploadFileButton").length==0){
			commentUploadImageForm.prepend(uploadFileButton).prop("action", url);
		}
		//上传完成
		if (!this.bindUpload) {
			this.uploadSuccess();
			this.bindUpload = true;
		}
		return this.$(".uploadFileButton").click();
	},
	fileButtonHandle(evt) {//提交
		var commentAttachmentListBox = this.$("#commentAttachmentListBox");
		commentAttachmentListBox.find(".loading").remove();
		
		if(evt.target.files.length>0){
			var size = evt.target.files[0].size;
			if(size <= 52428800){
				commentAttachmentListBox.prepend("<li class='loading'>上传中....</li>");
				$("#commentUploadImageForm").submit();
			}else{
				$.tip({
					message: "最大支持50兆",
					timeout: 3000,
					type: "alarm"
				})
			}
		}
		
	},
	uploadSuccess(event) {//图片上传成功之后的方法 accept="image/*"
		var that = this;
		$("#commentUploadIframe").on("load", function(event) {
			var data = JSON.parse(this.contentDocument.body.innerText);//获取ifrem里面的文本
			var commentAttachmentListBox = that.$("#commentAttachmentListBox");
			var html="";
			if (data.code == 0) {
				commentAttachmentListBox.find(".loading").remove();
				data = data.data;
				html += '<li>';
				switch(data.type){
					case 1:
						html += '<div class="imgThumbnailBox"><img src="'+data.pictureUrl+'"></div>';
						break;
					case 4:
						html += '<div class="imgThumbnailBox"><img src="/static/dist/images/projects/images/word.png"></div>';
						break;
					case 5:
						html += '<div class="imgThumbnailBox"><img src="/static/dist/images/projects/images/ppt.png"></div>';
						break;
					case 6:
						html += '<div class="imgThumbnailBox"><img src="/static/dist/images/projects/images/excel.png"></div>';
						break;
					case 7:
						html += '<div class="imgThumbnailBox"><img src="/static/dist/images/projects/images/pdf.png"></div>';
						break;
					case 8:
						html += '<div class="imgThumbnailBox"><img src="/static/dist/images/projects/images/dwg.png"></div>';
						break;
					case 9:
						html += '<div class="imgThumbnailBox"><img src="/static/dist/images/projects/images/rvt.png"></div>';
						break;
					case 10:
						html += '<div class="imgThumbnailBox"><img src="/static/dist/images/projects/images/default.png"></div>';
						break;
					default:
						break;
				}
				html +=	'<span class="imgThumbnailName">'+data.description+'</span>'+
						'<span class="imgThumbnailSize">'+App.Comm.formatSize(data.length)+'</span>'+
						'<a href="javascript:;" data-id="'+data.id+'" class="deleteUploadImg">删除</a>'+
					'</li>';
				commentAttachmentListBox.prepend(html);
				App.Project.NotesCollection.defaults.attachments.push(data.id);
				that.bindCommentScroll();
			}
		});
	},
	deleteUploadImgHandle(target){//点击删除上传图片的方法
		for (var i = 0,len=App.Project.NotesCollection.defaults.attachments.length; i<len; i++) {
			if(App.Project.NotesCollection.defaults.attachments[i]==$(event.target).data("id")){
				App.Project.NotesCollection.defaults.attachments.splice(i,1);
				$(event.target).closest("li").remove();
			}
		}
		if(App.Project.NotesCollection.defaults.attachments.length == 0){
			var commentAttachmentListBox = this.$("#commentAttachmentListBox");
			commentAttachmentListBox.find(".loading").remove();
			// commentAttachmentListBox.prepend("<li class='loading'>暂无评论附件</li>")
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
			uploadAtUserArrs = [];
		for (var i = 1; i < texts.length; i++) {
			_.contains(textsUniq, texts[i].split(' ')[0]) ? '' : textsUniq.push(texts[i].split(' ')[0]);
		}
		for (var j = 0; j < textsUniq.length; j++) {
			for (var k = 0; k < App.Project.NotesCollection.defaults.atUserArrs.length; k++) {
				if (App.Project.NotesCollection.defaults.atUserArrs[k]['userName'] == textsUniq[j]) {
					uploadAtUserArrs.push(App.Project.NotesCollection.defaults.atUserArrs[k]);
					break;
				}
			}

		}
		//结束配置@用户列表的方法
		var pars = {
				projectId: parseInt(App.Project.Settings.projectId),
				viewPointId: App.Project.NotesCollection.defaults.viewpointId,
				text: this.$(".textareaBox textarea").val().trim(),
				attachments: App.Project.NotesCollection.defaults.attachments,//评论附件id列表
				projectVersionId: parseInt(App.Project.Settings.versionId),
				receivers: uploadAtUserArrs,// 消息接收者列表
			},
			data = {
				URLtype: "createComment",
				data: JSON.stringify(pars),
				type: "POST",
				contentType: "application/json"
			};
		if (!this.$(".textareaBox textarea").val().trim()||this.$(".textareaBox textarea").val().trim()=="请输入评论内容") {//没有输入评论内容
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
				$btnEnter.html("评论").attr("data-issubmit", false);
				App.Project.NotesCollection.getCommentListHandle({viewpointId:data.data.viewpointId});
				App.Project.NotesCollection.defaults.atUserArrs = [];
				App.Project.NotesCollection.defaults.attachments = [];
				this.$("#commentAttachmentListBox").html("");
				this.$(".textareaBox textarea").val("请输入评论内容");
				App.Project.NotesCollection.defaults.pageIndexComment=1;
				App.Project.NotesCollection.getCommentListHandle();//共用了获取批注评论列表的方法
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
			var modelContainerContent = $("#projectContainer .modelContainerContent");
			modelContainerContent[0].appendChild($("#dialogModelBox .bim")[0]);
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
		dialogModelBox[0].appendChild($("#projectContainer .bim")[0]);
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
