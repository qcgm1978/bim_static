App.AddViewUser.AddViewUserV = Backbone.View.extend({
	template:_.templateUrl("/addViewUser/tpls/index.html"),
	render:function(){
	    this.$el.html(this.template);
	    return this;
	}
});