App.ResourceCrumbsNav=Backbone.View.extend({

	tagName:"div",

	className:"resourceCrumbsNav",

	template:_.templateUrl('/resources/tpls/resources.crumbsNav.html'),

	render:function(){
		
		this.$el.html(this.template);
		return this;
	}

});