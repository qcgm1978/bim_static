App.ResourceModel.LeftNav = Backbone.View.extend({

	tagName: "div",

	id: "resourceModelLeftNav",

	template: _.templateUrl("/resources/tpls/resourceModel/resources.model.leftNav.html", true),

	//渲染
	render: function(type) { 

		this.$el.html(this.template);
		if (type == 1) {
			this.getfileTree();
		} else {
			this.getModelTree();
		}
		return this;
	},

	//文件浏览器
	getfileTree: function() {
				


	},

	//模型浏览器
	getModelTree: function() {

	}

});