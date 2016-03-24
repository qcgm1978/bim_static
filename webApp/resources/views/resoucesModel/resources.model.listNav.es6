App.ResourceModel.ListNav = Backbone.View.extend({

	tagName: "div",

	id: "navContainer",

	template: _.templateUrl("/resources/tpls/resourceModel/resource.model.listNav.html", true),

	initialize: function(options) {
		this.listenTo(App.ResourceModel.PropertiesCollection, "add", this.reRender);
		Backbone.on('navClickCB', this.navClickCB, this);
	},

	events: {
		"click .modleShowHide": "slideUpAndDown",
		"click .modelAttr .slideBar": "slideBarToggle",
		"mousedown .modelAttr .dragSize": "dragSize"
	},

	render: function() {


		this.$el.html(this.template);

		this.$el.find(".listContent").html(new App.ResourceModel.TopBar().render().el);

		var type = App.ResourcesNav.Settings.type;
		if (type == "standardLibs") {
			//获取标准模型库数据
			this.$el.find(".listContent").append(new App.ResourceModel.ListContent().render().el);

		} else if (type == "famLibs") {
			this.$el.find(".listContent").append(new App.ResourceModel.ThumContent().render().el);
		}


		return this;
	},

	//左侧试图
	navClickCB: function(type) {

		if (type == "file") {

			this.$el.find(".listContent").show().end().find(".modelContentBox").hide().end().find(".modelAttr").hide();
			this.$el.css("margin-right", 0);
		} else {

			this.$el.find(".listContent").hide().end().find(".modelContentBox").show().end().find(".modelAttr").show();

			var $modelAttr = this.$el.find(".modelAttr"),
				mRight = parseInt($modelAttr.css("margin-right"));

			if (mRight >= 0) {
				this.$el.css("margin-right", $modelAttr.width());
			} else {
				this.$el.css("margin-right", 0);
			}

			if (App.ResourceModel.Settings.DataModel.bind) {
				return;
			}
			App.ResourceModel.Settings.DataModel.bind=true;

			App.ResourceModel.Settings.Viewer = new BIM({
				element: this.$el.find(".modelContent")[0],
				sourceId: App.ResourceModel.Settings.DataModel.sourceId,
				etag: App.ResourceModel.Settings.DataModel.etag,
				tools: true,
				treeElement: $("#resourceModelLeftNav .modelTree")[0]
			});

			App.ResourceModel.Settings.Viewer.on("click", function(model) {

				if (!model.intersect) {
					return;
				}
				App.ResourceModel.PropertiesCollection.projectId = App.ResourceModel.Settings.CurrentVersion.projectId;
				App.ResourceModel.PropertiesCollection.projectVersionId = App.ResourceModel.Settings.CurrentVersion.id;
				App.ResourceModel.PropertiesCollection.fetch({
					data: {
						elementId: model.intersect.userId,
						sceneId: model.intersect.object.userData.sceneId
					}
				});

			});
		}
		//this.bindTreeScroll();


	},

	reTemplate: _.templateUrl('/resources/tpls/resourceModel/resources.model.attr.detail.html'),

	//重新渲染苏醒
	reRender: function(model) {

		//渲染数据
		var data = model.toJSON().data;
		this.$el.find(".attrContentBox .attrContent").html(this.reTemplate(data));
	},

	//文件浏览滚动条
	bindTreeScroll: function() {
		var $modelContent = this.$el.find(".modelContent");
		if (!$modelContent.hasClass('mCustomScrollbar')) {
			$modelContent.mCustomScrollbar({
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
	},

	//展开和收起
	slideUpAndDown: function(event) {
		var $parent = $(event.target).parent(),
			$modleList = $parent.find(".modleList");
		$(event.target).toggleClass("down");
		if ($modleList.is(":hidden")) {
			$modleList.slideDown();
		} else {
			$modleList.slideUp();
		}

	},

	//收起展开
	slideBarToggle: function() {

		App.Comm.navBarToggle(this.$el.find(".modelAttr"), $("#navContainer"), "right", App.ResourceModel.Settings.Viewer);
	},

	//拖拽改变大小
	dragSize: function(event) {
		App.Comm.dragSize(event, this.$el.find(".modelAttr"), $("#navContainer"), "right", App.ResourceModel.Settings.Viewer);
		return false;
	}

});