App.Services.NoticeAttrManagerContent = Backbone.View.extend({
	tagName:'div',
	className:"noticeDownContent",
	template:_.templateUrl("/services/tpls/system/notice/noticeAttrManagerDownContent.html",true),
	events:{
		"click tr.itemClick":"itemClickHandle"
	},
	initialize:function(){ // 重写初始化
		this.listenTo(App.Services.SystemCollection.NoticeCollection, 'reset', this.reset);  
		this.listenTo(App.Services.SystemCollection.NoticeCollection, 'add', this.addOne);  
	}, 
	render(){//渲染
		this.$el.html(this.template);
		// this.addOne();
		this.getListHandle();//获取公告列表的方法
		return this;
	},
	getListHandle(){//获取公告列表的方法
		App.Services.SystemCollection.getListHandle();
	},
	itemClickHandle(event){//disable
		var deleteNotice = $("button.deleteNotice");
		var publishNotice = $("button.publishNotice");
		var stickNotice = $("button.stickNotice");
		var cancelStickNotice = $("button.cancelStickNotice");
		var withdrawNotice = $("button.withdrawNotice");
		var target = $(event.target).parent();
		var publishState = target.find("td:eq(0)").data("publishstate");//当前公告是否发布
		var sticeState = target.find("td:eq(0)").data("sticestate");//当前公告是否置顶
		var withdrawState = target.find("td:eq(0)").data("withdrawstate");//当前公告是否撤回
		target.siblings().removeClass('selectClass');
		deleteNotice.addClass('disable');
		publishNotice.addClass('disable');
		stickNotice.addClass('disable');
		cancelStickNotice.addClass('disable');
		if(target.hasClass("selectClass")){
			target.removeClass("selectClass");
		}else{
			target.addClass("selectClass");
			if(publishState == "1"){
				withdrawNotice.removeClass('disable');
			}else if(publishState == "2"){
				publishNotice.removeClass('disable');
			}else if(publishState == "3"){
				deleteNotice.removeClass('disable');
				publishNotice.removeClass('disable');
			}
			if(sticeState == "0"){
				stickNotice.removeClass('disable');
			}
		}
	},
	addOne:function(model){
		var model = model.toJSON();
		var items = model.items;
		for(var i=0,len=items.length-1;i<=len;i++){
			var view = new App.Services.NoticeAttrManagerContentDetail({model:items[i]});
			var listDom = this.$el.find("#listDom");
			listDom.append(view.render().el);
		}
		this.bindScroll();
	},
	reset:function(){
		this.$el.find("tbody#listDom").html('<tr> <td  colspan="3" class="noDataTd">正在加载...</td></tr>');
	},
	bindScroll:function(){//绑定滚动条
		//代办滚动条
		this.$el.find("div.scrollBox").mCustomScrollbar({
			theme: 'minimal-dark',
			axis: 'y',
			keyboard: {
				enable: true
			},
			scrollInertia: 0
		}); 
	},
});