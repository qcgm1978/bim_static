var ViewComp=ViewComp||{};

ViewComp.Modal= Backbone.View.extend({
	el: "#modalWrapper",
	template: _.templateUrl('/services/tpls/auth/projectMember/modal.html'),
	events: {
		'click .closeIcon': 'closeView'
	},
	render: function(data) {
		this.$el.append(this.template(data))
		return this;
	},
	//向Modal视图嵌套视图
	append: function(view) {
		if (view instanceof Backbone.View) {
			var _view = view.render();
			this.$el.find(".mwin-body").append(_view.el);
			_view.initView();
		}
	},
	//关闭Modal视图
	closeView: function() {
		this.$el.html("");
	}
})