//列表
App.ResourceModel.ListContent = Backbone.View.extend({

	tagName: "div",

	id: "resourceListContent",

	//初始化
	initialize: function() {
		this.listenTo(App.ResourceModel.FileCollection, "add", this.addOneFile);
	},


	template: _.templateUrl("/resources/tpls/resourceModel/resources.model.listNav.list.html", true),

	events:{
		"click .header .ckAll":"ckAll"
	},

	//渲染
	render: function() {

		this.$el.html(this.template);
		return this;
	},

	ckAll(event){ 
		this.$el.find(".fileContent .ckAll").prop("checked",event.target.checked);
	}, 

	//添加单个文件
	addOneFile: function(model) {


		var view = new App.ResourceModel.ListNavDetail({
			model: model
		});

		if (model.toJSON().isAdd) {
			this.$el.find(".fileContent").prepend(view.render().el);
		} else {
			this.$el.find(".fileContent").append(view.render().el);
		}


		this.bindScroll();
	},

	//绑定滚动条
	bindScroll: function() {
		var $fileLists = this.$el.find(".fileLists");
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