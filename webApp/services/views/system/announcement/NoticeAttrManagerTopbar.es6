App.Services.NoticeAttrManagerTopbar = Backbone.View.extend({
	default:{
		timeout:0,
		flag:true
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
	newTextNotice(){//添加文本公告
		var NewTextNotice = new App.Services.NoticeAttrManagerTopbarNewTextNotice();
		App.Services.SystemCollection.addTextNoticeDialog = new App.Comm.modules.Dialog({
		    title:"新建文本公告",
		    width:600,
		    height:600,
		    isConfirm:false,
		    isAlert:false,
		    closeCallback:function(){},
		    message:NewTextNotice.render("").el
		});
	},
	newLinkNotice:function(){//添加链接公告
		var NewLinkNotice = new App.Services.NoticeAttrManagerTopbarNewLinkNotice();
		App.Services.SystemCollection.addLinkNoticeDialog = new App.Comm.modules.Dialog({
		    title:"新建链接公告",
		    width:600,
		    height:150,
		    isConfirm:false,
		    isAlert:false,
		    closeCallback:function(){},
		    message:NewLinkNotice.render("").el
		});
	},
	editNotice(){//编辑公告的按钮方法
		var _this = this;
		var noticeDom = $("#listDom tr.selectClass");
		var noticeid = noticeDom.find("td:eq(0)").data("noticeid");
		var data = {
			"id":noticeid
		}
		if(this.default.flag){
			this.default.flag=false;
			App.Comm.ajax({
				URLtype:"getNotice",
				data:data,
			}).done(function(res){
				if(res.code==0){
					if(res.data.type == 1){
						var NewLinkNotice = new App.Services.NoticeAttrManagerTopbarNewLinkNotice();
						App.Services.SystemCollection.addLinkNoticeDialog = new App.Comm.modules.Dialog({
						    title:"新建链接公告",
						    width:600,
						    height:150,
						    isConfirm:false,
						    isAlert:false,
						    closeCallback:function(){},
						    message:NewLinkNotice.render(res.data).el
						});
					}else if(res.data.type == 2){

					}
					_this.default.flag=true;
				}
			})
		}
	},
	deleteNotice(){//删除选中公告的方法
		var _this = this;
		var target = $(event.target);
		var noticeDom = $("#listDom tr.selectClass");
		var noticeid = noticeDom.find("td:eq(0)").data("noticeid");
		var data = {
			"id":noticeid
		}
		if(!target.hasClass("disable")){
			if(this.default.flag){
				this.default.flag=false;
				App.Comm.ajax({
					URLtype:"deleteNotice",
					data:JSON.stringify(data),
					type:"DELETE",
					contentType:"application/json",
				}).done(function(res){
					if(res.code==0){
						App.Services.SystemCollection.getListHandle();
						target.add("disable");
						_this.default.flag=true;
					}
				})
			}
		}
	},
	publishNotice(){//发布公告的方法
		var _this = this;
		var target = $(event.target);
		var noticeDom = $("#listDom tr.selectClass");
		var noticeid = noticeDom.find("td:eq(0)").data("noticeid");
		var data = {
			"id":noticeid
		}
		if(!target.hasClass("disable")){
			if(this.default.flag){
				this.default.flag=false;
				App.Comm.ajax({
					URLtype:"publishNotice",
					data:JSON.stringify(data),
					type:"PUT",
					contentType:"application/json",
				}).done(function(res){
					if(res.code==0){
						App.Services.SystemCollection.getListHandle();
						target.add("disable");
						_this.default.flag=true;
					}
				})
			}
		}
	},
	stickNotice:function(event){//点击置顶按钮的时候执行的方法
		var _this = this;
		var target = $(event.target);
		var noticeDom = $("#listDom tr.selectClass");
		var noticeid = noticeDom.find("td:eq(0)").data("noticeid");
		var data = {
			"id":noticeid
		}
		if(!target.hasClass("disable")){
			if(this.default.flag){
				this.default.flag=false;
				App.Comm.ajax({
					URLtype:"stickNotice",
					data:JSON.stringify(data),
					type:"PUT",
					contentType:"application/json",
				}).done(function(res){
					if(res.code==0){
						App.Services.SystemCollection.getListHandle();
						target.add("disable");
						_this.default.flag=true;
					}
				})
			}
		}
	},
	cancelStickNotice:function(){//取消置顶按钮方法
		var _this = this;
		var target = $(event.target);
		var noticeDom = $("#listDom tr.selectClass");
		var noticeid = noticeDom.find("td:eq(0)").data("noticeid");
		var data = {
				"id":noticeid
			}
		if(!target.hasClass("disable")){
			if(this.default.flag){
				this.default.flag=false;
				App.Comm.ajax({
					URLtype:"cancelStickNotice",
					data:JSON.stringify(data),
					type:"PUT",
					contentType:"application/json",
				}).done(function(res){
					if(res.code==0){
						App.Services.SystemCollection.getListHandle();
						target.add("disable");
						_this.default.flag=true;
					}
				})
			}
		}
	},
	withdrawNotice:function(){//点击撤回按钮的时候执行的方法
		var _this = this;
		var target = $(event.target);
		var noticeDom = $("#listDom tr.selectClass");
		var noticeid = noticeDom.find("td:eq(0)").data("noticeid");
		var data = {
			"id":noticeid
		}
		if(!target.hasClass("disable")){
			if(this.default.flag){
				this.default.flag=false;
				App.Comm.ajax({
					URLtype:"withdrawNotice",
					data:JSON.stringify(data),
					type:"PUT",
					contentType:"application/json",
				}).done(function(res){
					if(res.code==0){
						App.Services.SystemCollection.getListHandle();
						target.add("disable");
						_this.default.flag=true;
					}
				})
			}
		}
	},
});