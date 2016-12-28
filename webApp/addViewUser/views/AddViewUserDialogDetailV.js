App.AddViewUser.AddViewUserDialogDetailV = Backbone.View.extend({
	el:"li",
	template:_.templateUrl("/addViewUser/tpls/newViewUserDialogDetail.html"),
	render:function(data){
		this.$el.html(this.template({item:data}));
		console.log(this.template({item:data}));
		console.log(this.$el);
		return this;
	}
})