/*!/addViewUser/collection/index.js调用*/
App.AddViewUser.AddViewUserV = Backbone.View.extend({
	el:$("#contains"),
	template:_.templateUrl("/addViewUser/tpls/index.html"),
	render:function(){
	    this.$el.html(this.template);
	    return this;
	},

});