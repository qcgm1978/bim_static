//列表
App.ResourceModel.ThumContent = Backbone.View.extend({

	tagName: "div",

	id: "resourceThumContent",

	//初始化
	initialize: function() {
		this.listenTo(App.ResourceModel.FileThumCollection, "add", this.addOneFile);
	},


	template: _.templateUrl("/resources/tpls/resourceFamLibs/resources.model.listNav.thum.html", true),

	//渲染
	render: function() {

		this.$el.html(this.template);
		return this;
	},

	//添加单个文件
	addOneFile: function(model) {

		 
		var view = new App.ResourceModel.ThumDetail({
			model: model
		});

		if (model.toJSON().isAdd) {
			this.$el.find(".thumContent").prepend(view.render().el);
		} else {
			this.$el.find(".thumContent").append(view.render().el);
		}


		this.bindScroll();
	},

	//绑定滚动条
	bindScroll: function() {
		var $fileLists = this.$el.find(".thumLists");
		if (!$fileLists.hasClass('mCustomScrollbar')) {
			$fileLists.mCustomScrollbar({
				set_height: "100%",
				set_width: "100%",
				theme: 'minimal-dark',
				axis: 'y',
				keyboard: {
					enable: true
				},
				scrollInertia: 0
			});
		}
	}



});