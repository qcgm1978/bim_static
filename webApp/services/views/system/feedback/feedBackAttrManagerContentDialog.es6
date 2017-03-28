App.Services.System.FeedBackAttrManagerContentDialog=Backbone.View.extend({
	tagName:'div',
	className:"feedBackDialog suggestView",
	events:{
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
				var saveButton = $("#saveButton");
				var dialogHtml = _.templateUrl("/services/tpls/system/feedBack/feedBackAttrManagerDialog.html");
				_this.$el.html(dialogHtml(res.data.items[0]));
			}else{
				alert(res.message)
			}
		})
	},
	deleteFeedBack(event){//删除当前回复
		var target = $(event.target);
		var adviceId = target.data('adviceid');
		var deleteId = target.data('id');
		App.Comm.ajax({
			URLtype: "deleteFeedBack",
			type: "DELETE",
			data:JSON.stringify({
				adviceId:adviceId,
				attachmentId:deleteId
			}),
		}).done(function(res){
			if(res.code == 0){
				if(res.code == 0){
					console.log(res)
				}else{
					alert(res.message)
				}
			}
		})
		// var dialogDeleteHtml = _.templateUrl('/services/tpls/system/feedBack/feedBackDeleteDialog.html',true);
		// var dialog = new App.Comm.modules.Dialog({
		// 	width: 300,
		// 	height: 180,
		// 	isConfirm: false,
		// 	isAlert: false,
		// 	message: dialogDeleteHtml,
		// 	readyFn:function(){
		// 		$("#saveButton").on("click",function(){
		// 			debugger;
		// 			App.Comm.ajax({
		// 				URLtype: "deleteFeedBack",
		// 				type: "DELETE",
		// 				data:JSON.stringify({
		// 					adviceId:adviceId,
		// 					attachmentId:deleteId
		// 				}),
		// 			}).done(function(res){
		// 				if(res.code == 0){
		// 					if(res.code == 0){
		// 						console.log(res)
		// 					}else{
		// 						alert(res.message)
		// 					}
		// 				}
		// 			})
		// 		})
		// 	}
		// })
	}
});