/*!/addViewUser/collection/index.js调用*/
App.AddViewUser.AddViewUserV = Backbone.View.extend({
	default:{
		state:{
			selectedIndex:"userList",
			showIndex:"userList"
		}
	},
	el:$("#contains"),
	template:_.templateUrl("/addViewUser/tpls/index.html"),
	events: {
 		"click .viewUserTopTab li": "switchTab",
 	},
	render:function(){
	    this.$el.html(this.template({state:this.default.state}));
	    return this;
	},
	switchTab:function(event){
		var target = $(event.target);
		if(!target.hasClass('selected')){
			this.default.state.selectedIndex = target.data('type');
			this.default.state.showIndex = target.data('type');
			this.render();
		}
	}
});