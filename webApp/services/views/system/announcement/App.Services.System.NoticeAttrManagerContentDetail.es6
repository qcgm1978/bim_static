App.Services.System.NoticeAttrManagerContentDetail = Backbone.View.extend({
	tagName:'tr',
	className:"itemClick",
	template:_.templateUrl("/services/tpls/system/notice/noticeAttrManagerDownContentDetail.html"),
	render(){//渲染
		// var data = this.model.toJSON();
		var data = this.model;
		this.$el.html(this.template(data));
		return this;
	},
});