App.Notice.NoticeListDetailView = Backbone.View.extend({
	tagName:"tr",
	template:_.templateUrl("./notice/tpls/notice.list.detail.html"),
	render:function(){//
		// var data=this.model.toJSON();
		var data= this.model;
		this.$el.html(this.template(data));
		return this;
	}
})