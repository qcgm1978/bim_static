

App.Flow=Backbone.View.extend({

	tagName:"div",

	className:"flowContainer",

	template:_.templateUrl("/flow/tpls/flow.content.html",true),

	render:function(){
		this.$el.html(this.template);
		return this;
	}

});
