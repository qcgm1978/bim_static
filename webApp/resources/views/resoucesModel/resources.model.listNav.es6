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

		if (this.$el.closest('body').length <= 0) {
			this.remove();
			return;
		}

		if (type == "file") {

			this.$el.removeClass('hideLeft');
			this.$el.find(".listContent").show().end().find(".modelContentBox").hide().end().find(".modelAttr").hide();

			$("#resourceModelLeftNav").show();

			//绑定上传
			var status = App.ResourceModel.Settings.CurrentVersion.status;

			if (status != 9 && status != 4 && status != 7) {
				//上传
				App.ResourceUpload.init($(document.body));
				$("#file-upload-btn").show();
			} else {
				$("#file-upload-btn").hide();
			}

		} else {

			//销毁上传
			App.Comm.upload.destroy();

			$("#resourceModelLeftNav").hide();

			this.$el.addClass('hideLeft');

			this.$el.find(".listContent").hide().end().find(".modelContentBox").show().end().find(".modelAttr").show();


			if (App.ResourceModel.Settings.DataModel.bind) {
				return;
			}

			App.ResourceModel.Settings.DataModel.bind = true;

			App.ResourceModel.Settings.Viewer = new bimView({
				element: this.$el.find(".modelContent"),
				sourceId: App.ResourceModel.Settings.DataModel.sourceId,
				etag: App.ResourceModel.Settings.DataModel.etag,
				projectId: App.ResourceModel.Settings.CurrentVersion.projectId
			});

			App.ResourceModel.Settings.Viewer.on("click", function(model) {

				if (!model.intersect) {
					$("#navContainer .attrContent").html('<div class="nullTip">请选择构件</div>');
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

	},

	reTemplate: _.templateUrl('/resources/tpls/resourceModel/resources.model.attr.detail.html'),

	//重新渲染苏醒
	reRender: function(model) {

		if (this.$el.closest('body').length <= 0) {
			this.remove();
			return;
		}
		//渲染数据
		var data = model.toJSON().data;
		this.$el.find(".attrContentBox .attrContent").html(this.reTemplate(data));
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