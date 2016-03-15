

App.ResourceModel.ListNavDetail=Backbone.View.extend({

	tagName:"li",

	className:"item",

	template:_.templateUrl("/resources/tpls/resourceModel/resource.model.list.nav.detail.html"),

	render:function(){
		 
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}


});