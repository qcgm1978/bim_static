App.Services.NoticeAttrManagerTopbarNewTextNotice = Backbone.View.extend({
	tagName:'div',
	className:"newTextNoticeDialog",
	template:_.templateUrl("/services/tpls/system/notice/newTextNotice.html"),
	events:{
		"click #publishBtn":"publicAjaxHandle",
		"click #saveBtn":"publicAjaxHandle",
		"click #cancelBtn":"cancelBtn",
	},
	default:{
		flag:true,
		edit:false
	},
	render(parmers){
		var defaultData = {
			title:null,
			href:null,
			publishTime:null,
			id:null,
			department:null,
			type:null,
			content:null
		};
		var data = $.extend({},defaultData,parmers);
		if(parmers){
			this.default.edit=true;
		}
		this.$el.html(this.template(data));
		return this;
	},
	cancelBtn(){//取消按钮的方法
		App.Services.SystemCollection.um.destroy();
		App.Services.SystemCollection.addTextNoticeDialog.close();
	},
	publicAjaxHandle(event){//公用的提交方法
		var _this = this;
		var target = $(event.target);
		var saveOrPublish = target.attr("id");
		var noticeTitleVal = $("#noticeTitle").val();
		var noticeLinkVal = $("#noticeLink").val();
		var noticeTimeVal = $("#noticeTime").val();
		var match = /^((https|http|ftp|rtsp|mms)?:\/\/)?([\w\-]+(\.[\w\-]+)*\/)*[\w\-]+(\.[\w\-]+)*\/?(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?/;
		var dataObjAdd = {},
			dataObjEdit = {},
			linkUrl="",
			status=(saveOrPublish=="publishBtn")?1:3;
		if(noticeTitleVal==""){
			alert("公告标题不能为空！");
			return;
		}
		if(noticeLinkVal==""){
			alert("公告链接地址不能为空！");
			return;
		}else{
			if(!match.test(noticeLinkVal)){
				alert("公告链接地址不合法！");
				return;
			}
		}
		if(noticeTimeVal==""){
			alert("发布时间不能为空！");
			return;
		}
		if(this.default.edit){
			dataObjEdit.title = noticeTitleVal;
			dataObjEdit.href = noticeLinkVal;
			dataObjEdit.publishTime = noticeTimeVal;
			dataObjEdit.content = $("#hideVal").data("content");
			dataObjEdit.department = $("#hideVal").data("department");
			dataObjEdit.type = $("#hideVal").data("type");
			dataObjEdit.id = $("#hideVal").data("id");
			dataObjEdit.status = status;
		}else{
			dataObjAdd.title = noticeTitleVal;
			dataObjAdd.href = noticeLinkVal;
			dataObjAdd.publishTime = noticeTimeVal;
			dataObjAdd.content = "";
			dataObjAdd.department = "";
			dataObjAdd.type = 1;
			dataObjAdd.status = status;
		}
		var dataObj = this.default.edit?dataObjEdit:dataObjAdd;
		var linkUrl = this.default.edit?"editNotice":"addLinkNotice";
		if(!target.hasClass("disable")){
			if(this.default.flag){
				this.default.flag=false;
				App.Comm.ajax({
					URLtype:linkUrl,
					data:JSON.stringify(dataObj),
					type:this.default.edit?"PUT":"POST",
					contentType:"application/json",
				}).done(function(res){
					if(res.code==0){
						App.Services.SystemCollection.addLinkNoticeDialog.close();
						App.Services.SystemCollection.getListHandle();
						_this.default.flag=true;
					}
				})
			}
		}
	}
})