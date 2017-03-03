//资源管理
App.Services.System.ResourceAttrManagerContent=Backbone.View.extend({
	tagName:'div',
	className:"resourceContent",
	template:_.templateUrl("/services/tpls/system/resource/resourceContent.html"),
	events:{
		"click .allCheck": "allCheckFun",
	},
	initialize() {//初始化
		this.listenTo(App.Services.SystemCollection.ResourceCollection, "add", this.addOne);
		this.listenTo(App.Services.SystemCollection.ResourceCollection, "reset", this.resetList);
	},
	render(){//渲染
		this.$el.html(this.template());
		this.getResourceList();//获取资源管理的列表的方法
		return this;
	},
	allCheckFun(event){//点击列表的全选复选框的方法
		var checkItem = this.$el.find(".resourceList .checkItem");
		checkItem.prop('checked', event.target.checked);
	},
	getResourceList(){//获取资源管理的列表的方法
		//重置
		// App.Services.SystemCollection.ResourceCollection.reset();
		// //获取数据
		// App.Services.SystemCollection.ResourceCollection.fetch({
		// 	success:function(models,data){
		// 		// console.log("models",models);
		// 		// console.log("data",data);
		// 	}
		// });
		var dataArr = [
			{
				fileId:"001",
				sortNum:"001",
				fileName:"总发包操作手册.pdf",
				resourceType:"操作手册",
				resourceSize:"2.31M",
				publishTime:"2016-09-15 10:23:50",
			},
			{
				fileId:"002",
				sortNum:"002",
				fileName:"总发包操作手册.pdf",
				resourceType:"操作手册",
				resourceSize:"2.31M",
				publishTime:"2016-09-15 10:23:50",
			},
			{
				fileId:"003",
				sortNum:"003",
				fileName:"总发包操作手册.pdf",
				resourceType:"操作手册",
				resourceSize:"2.31M",
				publishTime:"2016-09-15 10:23:50",
			},
			{
				fileId:"004",
				sortNum:"004",
				fileName:"总发包操作手册.pdf",
				resourceType:"操作手册",
				resourceSize:"2.31M",
				publishTime:"2016-09-15 10:23:50",
			}
		]
		App.Services.SystemCollection.ResourceCollection.add(dataArr);
	},
	addOne(model){//每一条数据 进行处理
		this.$(".resourceList").find(".loading").remove();
		var model = model.toJSON();
		var ResourceAttrManagerContentList = new App.Services.System.ResourceAttrManagerContentList({model:model});
		this.$(".resourceList").append(ResourceAttrManagerContentList.render().el);
	},
	resetList(){//重置加载
		this.$(".resourceList").html('<li class="loading">正在加载，请稍候……</li>');
	}
});