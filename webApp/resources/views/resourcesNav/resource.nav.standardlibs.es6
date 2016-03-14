App.ResourcesNav.StandardLibs=Backbone.View.extend({

	tagName:"div",

	id:"standardLibs",

	template:_.templateUrl("/resources/tpls/resourcesNav/resource.nav.standardlibs.html"),

	//初始化
	initialize(){
		this.listenTo(App.ResourcesNav.StandardLibsCollection,"add",this.addOne);
	},

	render:function(){
		this.$el.html("正在加载，请稍候……");
		return this;
	},

	//添加单个
	addOne(model){ 
		var data=model.toJSON().data.items;
	 
		this.$el.html(this.template(data));
	}




});