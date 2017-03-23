App.Services=App.Services||{};
App.Services.More=Backbone.View.extend({
	tagName:"div",
	className:"servicesMore",
	template:_.templateUrl("/services/tpls/services.more.html",true),
	initialize() {//初始化
		this.listenTo(App.Services.SystemCollection.ResourceGetCollection, "add", this.addOne);
		this.listenTo(App.Services.SystemCollection.ResourceGetCollection, "reset", this.resetList);
	},
	render:function(){
		this.$el.html(this.template);
		this.getMoreList();//获取前台页面列表的方法
		return this;
	},
	getMoreList(){//获取前台页面列表的方法
		App.Services.SystemCollection.resourceListHandle();
	},
	addOne(model){//每一条数据 进行处理
		var data = model.toJSON();
		var MoreDetail = new App.Services.MoreDetail({model:data});
		this.$(".resourceListBox").append(MoreDetail.render().el);
	},
	resetList(){//重置加载
		this.$(".resourceListBox").html('<li class="loading">正在加载，请稍候……</li>');
	}
});
