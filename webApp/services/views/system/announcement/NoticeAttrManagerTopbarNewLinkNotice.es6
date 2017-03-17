App.Services.NoticeAttrManagerTopbarNewLinkNotice = Backbone.View.extend({
	tagName:'div',
	className:"newLinkNoticeDialog",
	template:_.templateUrl("/services/tpls/system/notice/newLinkNotice.html"),
	events:{
		"click #publishBtn":"publicAjaxHandle",
		"click #saveBtn":"publicAjaxHandle",
		"click #cancelBtn":"cancelBtn",
	},
	default:{
		flag:true
	},
	render(parmers){
		var defaultData = {
			title:"",
			href:"",
			publishTime:"",
		};
		var data = $.extend({},defaultData,parmers);
		this.$el.html(this.template(data));
		return this;
	},
	cancelBtn(){//取消按钮的方法
		App.Services.SystemCollection.addLinkNoticeDialog.close();
	},
	publicAjaxHandle(event){//公用的提交方法
		var _this = this;
		var target = $(event.target);
		var type = target.attr("id");
		var noticeTitleVal = $("#noticeTitle").val();
		var noticeLinkVal = $("#noticeLink").val();
		var noticeTimeVal = $("#noticeTime").val();
		var dataObj = {};
		dataObj.title = noticeTitleVal;
		dataObj.href = noticeLinkVal;
		dataObj.publishTime = noticeTimeVal;
		dataObj.content = "";
		dataObj.department = "";
		dataObj.type = 1;
		if(!target.hasClass("disable")){
			if(this.default.flag){
				this.default.flag=false;
				App.Comm.ajax({
					URLtype:"addLinkNotice",
					data:JSON.stringify(dataObj),
					type:"POST",
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