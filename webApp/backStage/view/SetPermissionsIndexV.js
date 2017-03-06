App.backStage.SetPermissionsIndexV = Backbone.View.extend({
	el:$("#contains"),
	template:_.templateUrl("/backStage/tpls/setPermissions/setPermissions.html"),
	events: {
 		"click #headerUlTab li": "switchTab",
 	},
	render:function(){
		this.$el.html(this.template());
		$("#headerUlTab").find("li").eq(0).addClass("selected");
		$("#downViewShowBox > div").eq(0).css("display","block");
		return this;
	},
	switchTab:function(event){//tab切换的方法
		var target = $(event.target);
		if(!target.hasClass('selected')){
			target.siblings().removeClass('selected').end().addClass('selected');
			if(target.data('type') == "viewStandardPattern"){
				// this.renderUserAdminListDom();//显示用户列表
			}else if(target.data('type') == "viewFamilyLibrary"){
				// this.renderAddPrefixDom();//配置前缀
			}
		}
	},
})