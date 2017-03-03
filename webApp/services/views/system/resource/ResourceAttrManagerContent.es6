//资源管理
App.Services.System.ResourceAttrManagerContent=Backbone.View.extend({
	tagName:'div',
	className:"resourceContent",
	render(){//渲染
		var template = _.templateUrl('/services/tpls/system/resource/resourceContent.html');
		this.$el.html(template);
		return this;
	}
});