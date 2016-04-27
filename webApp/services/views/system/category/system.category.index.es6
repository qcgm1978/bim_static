
//列别管理
App.Services.System.CategoryManager=Backbone.View.extend({

	tagName:"div",

	className:"categoryManager",

	initialize(){
		this.listenTo(App.Services.SystemCollection,"add",this.addOne)
	}

	template:_.templateUrl('/services/tpls/system/category/system.category.index.html'),

	render(){

		this.$el.html(this.template);

		return this;

	}


});