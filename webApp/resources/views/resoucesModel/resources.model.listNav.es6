


App.ResourceModel.ListNav=Backbone.View.extend({

	tagName:"div",

	id:"resourceModelListNav",

	//初始化
	initialize:function(){
		this.listenTo(App.ResourceModel.FileCollection,"add",this.addOneFile);
	},


	template:_.templateUrl("/resources/tpls/resourceModel/resources.model.listNav.html",true),

	//渲染
	render:function(){
		this.$el.html(this.template);
		return this;
	},

	//添加单个文件
	addOneFile:function(model){
		var data=model.toJSON();
		this.$el.find(".fileListsUl").append(new App.ResourceModel.ListNavDetail(model).render().el);
	}

});