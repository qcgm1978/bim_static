
//列表详情
App.Services.System.CategoryListDetail=Backbone.View.extend({

	tagName:"li",

	className:"item",

	template:_.templateUrl('/services/tpls/system/category/system.category.list.detail.html'),

	render(){
		var data=this.model.toJSON();
		this.$el.html(this.template(data));
		return this;
	}	

});