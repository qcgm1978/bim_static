App.Services.System.FeedBackAttrManagerContentDialog=Backbone.View.extend({
	tagName:'div',
	className:"feedBackDialog suggestView",
	events:{
		"click #saveButton":"addFeedBack",
		"click .feedBackDl a":"deleteFeedBack"
	},
	render(){//渲染
		this.getFeedBackInfo(this.model);//获取建议反馈的信息
		return this;
	},
	getFeedBackInfo(infoId){//获取建议反馈的信息
		var _this = this;
		App.Comm.ajax({
			URLtype:"getFeedBackInfo",
			data:JSON.stringify({
				id:infoId
			}),
			type:'POST',
			contentType:"application/json",
		}).done(function(res){
			if(res.code == 0){
				var dialogHtml = _.templateUrl("/services/tpls/system/feedBack/feedBackAttrManagerDialog.html");
				_this.$el.html(dialogHtml(res.data.items[0]));
			}else{
				alert(res.message)
			}
		})
	},
	addFeedBack(event){//添加回复
		var target = $(event.target);
		var feedBackDesc = $("#feedBackDesc").val();
		var addDataObj = {
			"adviceId": target.data("adviceid"),  
		    "content": feedBackDesc,
		    "replyId": target.data("createid"),
		    "loginName":target.data("loginname"),
		    "replyName": target.data("createname")
		}
		if(!target.hasClass("disabled")){
			App.Comm.ajax({
				URLtype:"addFeedBack",
				data:JSON.stringify(addDataObj),
				type:'POST',
				contentType:"application/json",
			}).done(function(res){
				if(res.code == 0){
					App.Services.SystemCollection.getFeedBackListHandle();
					App.Services.System.FeedBackDialog.close();
				}else{
					alert(res.message)
				}
			})
		}
	},
	deleteFeedBack(event){//删除当前回复
		var target = $(event.target);
		var adviceId = target.data('adviceid');
		var replytId = target.data('id');
		App.Comm.ajax({
			URLtype: "deleteFeedBack",
			type: "DELETE",
			data:{
				adviceId:adviceId,
				replytId:replytId
			},
		}).done(function(res){
			if(res.code == 0){
				App.Services.System.FeedBackDialog.close();
				App.Services.SystemCollection.getFeedBackListHandle();
			}else{
				alert(res.message)
			}
		})
	}
});