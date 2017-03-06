App.backStage.SetPermissionsIndexV = Backbone.View.extend({
	el:$("#contains"),
	template:_.templateUrl("/backStage/tpls/setPermissions/setPermissions.html"),
	render:function(){
		this.$el.html(this.template());
		return this;
	},
})