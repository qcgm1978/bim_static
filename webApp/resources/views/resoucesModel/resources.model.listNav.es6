


App.ResourceModel.ListNav=Backbone.View.extend({

	tagName:"div",

	id:"resourceModelListNav",

	template:_.templateUrl("/resources/tpls/resourceModel/resources.model.listNav.html",true),

	//渲染
	render:function(){
		this.$el.html(this.template);
		return this;
	}

});