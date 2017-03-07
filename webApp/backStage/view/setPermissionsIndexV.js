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
		var PublicDomV = new App.backStage.PublicDomV();
		var viewStandardPattern = this.$(".viewStandardPattern");
		viewStandardPattern.empty();
		viewStandardPattern.append(PublicDomV.render().el);
		return this;
	},
	switchTab:function(event){//tab切换的方法
		var target = $(event.target);
		var downViewShowBox = this.$("#downViewShowBox");
		if(!target.hasClass('selected')){
			target.siblings().removeClass('selected').end().addClass('selected');
			var PublicDomV = new App.backStage.PublicDomV();
			if(target.data('type') == "viewStandardPattern"){
				var viewStandardPattern = this.$(".viewStandardPattern");
				downViewShowBox.find("div.viewStandardPattern").siblings().css("display","none").end().css("display","block");
				viewStandardPattern.empty();
				viewStandardPattern.append(PublicDomV.render({tabType:"model"}).el);
			}else if(target.data('type') == "viewFamilyLibrary"){
				var viewFamilyLibrary = this.$(".viewFamilyLibrary");
				downViewShowBox.find("div.viewFamilyLibrary").siblings().css("display","none").end().css("display","block");
				viewFamilyLibrary.empty();
				viewFamilyLibrary.append(PublicDomV.render({tabType:"family"}).el);
			}
		}
	},
})