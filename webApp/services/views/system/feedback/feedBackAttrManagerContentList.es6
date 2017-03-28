App.Services.System.FeedBackAttrManagerContentList=Backbone.View.extend({
	tagName:'tr',
	template:_.templateUrl("/services/tpls/system/feedBack/feedBackAttrManagerContentList.html"),
	events:{
		"click .feedBackTd":"answerBtnHandle",
		"click .answerBtn":"answerBtnHandle"
	},
	render(){//渲染
		this.model.createTime = this.changeTimeHandle(this.model.createTime);
		this.model.size = App.Comm.formatSize(this.model.size);
		console.log(this.model);
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
		var answerObj = {}
		answerObj.feedbackid = target.data("feedbackid");
		answerObj.createid = target.data("createid");
		answerObj.loginname = target.data("loginname");
		answerObj.createname = target.data("createname");
		var getFeedBackInfo = {
			id:target.data("feedbackid")
		}
		var dialogHtml = _.templateUrl("/services/tpls/system/feedBack/feedBackAttrManagerDialog.html",true);
		var feedBackDialog = new App.Comm.modules.Dialog({
			title: "建议反馈",
			width: 600,
			height: 600,
			isConfirm: false,
			isAlert: false,
			message: dialogHtml,
			readyFn:function(){
				App.Comm.ajax({
					URLtype:"getFeedBackInfo",
					data:JSON.stringify(getFeedBackInfo),
					type:'POST',
					contentType:"application/json",
				}).done(function(res){
					if(res.code == 0){
						console.log(res);
					}else{
						alert(res.message)
					}
				})
			}
		})
	}
});