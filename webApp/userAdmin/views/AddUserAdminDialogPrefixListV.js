App.userAdmin.AddUserAdminDialogPrefixListV = Backbone.View.extend({
	tagName:"select",
	className:"selectPrefixBox",
	template:_.templateUrl("/userAdmin/tpls/dialogPrefixList.html"),
	render:function(data){
		console.log(data);
		//this.$el.html(this.template({state:data}));
		return this;
	}
})