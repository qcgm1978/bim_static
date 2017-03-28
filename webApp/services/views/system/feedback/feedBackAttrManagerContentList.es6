App.Services.System.FeedBackAttrManagerContentList=Backbone.View.extend({
	tagName:'tr',
	template:_.templateUrl("/services/tpls/system/feedBack/feedBackAttrManagerContentList.html"),
	events:{
		"click .downLoadId":"downLoadIdHandle",
		"click .feedBackTd":"answerBtnHandle",
		"click .answerBtn":"answerBtnHandle"
	},
	render(){//渲染
		this.model.createTime = this.changeTimeHandle(this.model.createTime);
		this.model.size = App.Comm.formatSize(this.model.size);
		this.$el.html(this.template(this.model));
		return this;
	},
	changeTimeHandle(time){//时间转换
		var timeStr = new Date(time);
		timeStr = timeStr.getFullYear() + "-" + (timeStr.getMonth() + 1) + "-" + timeStr.getDate();
		return timeStr;
	},
	answerBtnHandle(event){
		var target = $(event.target);
		var FeedBackAttrManagerContentDialog = new App.Services.System.FeedBackAttrManagerContentDialog(target.data("feedbackid"));
		App.Services.System.FeedBackDialog = new App.Comm.modules.Dialog({
			title: "建议反馈",
			width: 600,
			height: 600,
			isConfirm: false,
			isAlert: false,
			message: FeedBackAttrManagerContentDialog.render().el,
		})
	},
	downLoadIdHandle(event){
		var target = $(event.target);
		var downloadid = target.data("downloadid");
		var downloadDataObj = {
			URLtype:"downloadsFeedBack",
			data: {
				adviceId: downloadid,
			}
		}
		window.location.href = App.Comm.getUrlByType(downloadDataObj).url;
	}
});