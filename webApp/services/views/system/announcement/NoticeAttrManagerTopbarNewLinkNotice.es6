App.Services.NoticeAttrManagerTopbarNewLinkNotice = Backbone.View.extend({
	tagName:'div',
	className:"newLinkNoticeDialog",
	template:_.templateUrl("/services/tpls/system/notice/newLinkNotice.html"),
	events:{
		"click #publishBtn":"publicAjaxHandle",
		"click #saveBtn":"publicAjaxHandle",
		"click #cancelBtn":"cancelBtn",
	},
	render(parmers){
		var defaultData = {
			noticeTitle:"",
			noticeLink:"",
			noticeTime:"",
		};
		var data = $.extend({},defaultData,parmers);
		this.$el.html(this.template(data));
		return this;
	},
	publishBtn(){//发布按钮的方法
		// App.Services.SystemCollection.getListHandle();
	},
	saveBtn(){//保存按钮的方法
		// App.Services.SystemCollection.getListHandle();
	},
	cancelBtn(){//取消按钮的方法
		App.Services.SystemCollection.addLinkNoticeDialog.close();
	},
	publicAjaxHandle(event){//公用的提交方法
		var target = $(event.target);
		var type = target.attr("id");
		var noticeTitleVal = $("#noticeTitle").val();
		var noticeLinkVal = $("#noticeLink").val();
		var noticeTimeVal = $("#noticeTime").val();
		var dataObj = {};
		dataObj.noticeName = noticeTitleVal;
		dataObj.noticeLink = noticeLinkVal;
		dataObj.noticeTime = noticeTimeVal;
		var ajaxData = {
			data:dataObj
		}
		console.log(dataObj);
	}
})