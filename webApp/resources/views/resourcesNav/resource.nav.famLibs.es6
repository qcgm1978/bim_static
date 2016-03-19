App.ResourcesNav.FamLibs=Backbone.View.extend({

	tagName:"div",

	id:"famLibs",

	template:_.templateUrl("/resources/tpls/resourcesNav/resource.nav.standardlibs.html"),

	//初始化
	initialize(){
		this.listenTo(App.ResourcesNav.FamLibsCollection,"add",this.addOne);
	},

	render:function(){
		this.$el.html(this.template());
		return this;
	},

	templateDetail:_.templateUrl("/resources/tpls/resourcesNav/resource.nav.standardlibs.detail.html"),

	//添加单个
	addOne(model){ 

		var $standar=this.$el.find(".standarBody .standar"),$loading=$standar.find(".loading");

		if ($loading.length>0) {
			$loading.remove();
		}  
		var data=model.toJSON();
	 	$standar.append(this.templateDetail(data));
		 
	}


});