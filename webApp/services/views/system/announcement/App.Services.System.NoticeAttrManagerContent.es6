App.Services.System.NoticeAttrManagerContent = Backbone.View.extend({
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
		this.addOne();
		// this.getListHandle();//获取列表的方法
		return this;
	},
	getListHandle(parmer){//获取列表的方法
		App.Services.SystemCollection.getListHandle();
	},
	itemClickHandle(event){
		var target = $(event.target).parent();
		target.siblings().removeClass('selectClass');
		if(target.hasClass("selectClass")){
			target.removeClass("selectClass");
		}else{
			target.addClass("selectClass");
		}
	},
	addOne:function(model){
		var data = {
			title:'万达商业地产公告',
			time:'2017-03-15',
			status:'已发布'
		}
		var view = new App.Services.System.NoticeAttrManagerContentDetail({model:data});
		var listDom = this.$el.find("#listDom");
		listDom.append(view.render().el);
	},
	reset:function(){
		this.$el.find("tbody#listDom").html('<tr> <td  colspan="3" class="noDataTd">正在加载...</td></tr>');
	},
	bindScroll:function(){//绑定滚动条
		//代办滚动条
		this.$el.find("div.scrollBox").mCustomScrollbar({
			set_height: "100%",
			theme: 'minimal-dark',
			axis: 'y',
			keyboard: {
				enable: true
			},
			scrollInertia: 0
		}); 
	},
});