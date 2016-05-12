//列表
App.ResourceModel.ThumContent = Backbone.View.extend({

	tagName: "div",

	id: "resourceThumContent",

	//初始化
	initialize: function() {
		this.listenTo(App.ResourceModel.FileThumCollection, "add", this.addOneFile);
		this.listenTo(App.ResourceModel.FileThumCollection, "reset", this.reset);
		
	},


	template: _.templateUrl("/resources/tpls/resourceFamLibs/resources.model.listNav.thum.html", true),

	//渲染
	render: function() {

		this.$el.html(this.template);
		return this;
	},

	//添加单个文件
	addOneFile: function(model) {

		var view = new App.ResourceModel.ThumDetail({
			model: model
		});

		var data = model.toJSON();

		this.$el.find(".thumContent .loading").remove();
	 
		this.$el.find(".thumContent").prepend(view.render().el);

		App.Comm.initScroll(this.$el.find(".thumLists"),'y'); 
		 
	},

	//加载
	reset(){
		this.$el.find(".thumContent").html('<li class="loading">正在加载，请稍候…</li>');
	}

 



});