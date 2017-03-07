App.backStage.PublicListV = Backbone.View.extend({
	tagName:'div',
	className:'viewListBodyScrollBox',
	template:_.templateUrl("/backStage/tpls/setPermissions/setPermissionsPublicList.html"),
	events:{
		"click .checkItem": "checkItemFun",
	},
	render:function(){
		this.$el.html(this.template({listData:this.model}));
		return this;
	},
	checkItemFun(){//点击列表的单个复选框的方法
		var allCheck = $(".allCheck");
		if (this.$el.parent().parent().find(".checkItem:not(:checked)").length>0) {
			allCheck.prop("checked",false);
		}else{
			allCheck.prop("checked",true);
		}
	},
})