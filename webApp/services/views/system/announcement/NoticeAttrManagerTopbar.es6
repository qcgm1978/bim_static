App.Services.NoticeAttrManagerTopbar = Backbone.View.extend({
	default:{
		timeout:0
	},
	tagName:'div',
	className:"noticeTopbar",
	template:_.templateUrl("/services/tpls/system/notice/noticeAttrManagerTopbar.html",true),
	events:{
		"keyup .noticeTopSearch input":"seachHandle",
		"click .newTextNotice":"newTextNotice",
		"click .newLinkNotice":"newLinkNotice",
		"click .editNotice":"editNotice",
		"click .deleteNotice":"deleteNotice",
		"click .publishNotice":"publishNotice",
		"click .previewNotice":"previewNotice",
		"click .stickNotice":"stickNotice",
		"click .cancelStickNotice":"cancelStickNotice",
		"click .withdrawNotice":"withdrawNotice",
	},
	render(){//渲染
		this.$el.html(this.template)
		return this;
	},
	seachHandle(){
		var _this = this;
		var target = $(event.target);
		var targetVal = target.val().trim();
 		if(this.default.timeout){
 			clearTimeout(this.default.timeout);
 		}
	    this.default.timeout = setTimeout(function(){
	    	_this.searchAjaxFun(targetVal);
	    },400);
	},
	searchAjaxFun:function(targetVal){//最后执行提交搜索
		App.Services.SystemCollection.getListHandle({searchName:targetVal});
	},
	stickNotice:function(){//点击置顶按钮的时候执行的方法
		var noticeDom = $("#listDom tr.selectClass");
		// console.log("notcieState",notcieState);
		// if(noticeDom.length>0){
		// 	if(notcieState == "已发布"){
		// 		console.log("noticeDom",noticeDom.length);
		// 	}else{
		// 		alert("只允许撤回已发布公告");
		// 	}
			
		// }else{
		// 	alert("请选择一条公告");
		// }
	},
	cancelStickNotice:function(){//取消置顶按钮方法
		var noticeDom = $("#listDom tr.selectClass");
		var sticeState = noticeDom.find("td:eq(0)").data("sticeState");
		if(this.publicFun()){
			if(sticeState=="true"){
				console.log("noticeDom",noticeDom.length);
			}else{
				alert("只允许撤回已发布公告");
			}
		}else{
			alert("请选择一条公告");
		}
	},
	withdrawNotice:function(){//点击撤回按钮的时候执行的方法
		var noticeDom = $("#listDom tr.selectClass");
		var notcieState = noticeDom.find("td:eq(0)").data("publishState");
		if(this.publicFun()){
			if(notcieState == "已发布"){
				console.log("noticeDom",noticeDom.length);
			}else{
				alert("只允许撤回已发布公告");
			}
		}else{
			alert("请选择一条公告");
		}
	},
	publicFun:function(){//公用判断当前是否有选中的数据
		var noticeDom = $("#listDom tr.selectClass");
		if(noticeDom.length>0){
			return true;
		}else{
			return false;
		}
	}
});