//资源管理
App.Services.System.ResourceAttrManagerContentList=Backbone.View.extend({
	tagName:'tr',
	template:_.templateUrl("/services/tpls/system/resource/resourceContentList.html"),
	events:{
		"click .checkItem": "checkItemFun",
	},
	render(){//渲染
		this.$el.html(this.template({data:this.model}));
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
});