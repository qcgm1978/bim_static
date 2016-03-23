App.ResourceModel.LeftNav = Backbone.View.extend({

	tagName: "div",

	id: "resourceModelLeftNav",

	template: _.templateUrl("/resources/tpls/resourceModel/resources.model.leftNav.html", true),

	events: {
		"click .projectNav .item": "navClick",
		"click .slideBar": "slideBarToggle",
		"mousedown .dragSize": "dragSize"
	},

	//渲染
	render: function(type) {

		this.$el.html(this.template);

		this.getfileTree();

		return this;
	},

	//文件浏览器
	getfileTree: function() {

		var data = {
			URLtype: "fetchFileTree",
			data: {
				projectId: App.ResourceModel.Settings.CurrentVersion.projectId,
				projectVersionId: App.ResourceModel.Settings.CurrentVersion.id
			}
		}
		var that = this;

		App.Comm.ajax(data, function(data) {

			data.click = function(event) {
				var file = $(event.target).data("file");
				//清空数据
				$("#resourceListContent .fileContent").empty();
				App.ResourceModel.Settings.fileVersionId = file.fileVersionId;
				App.ResourceModel.FileCollection.reset();

				App.ResourceModel.FileCollection.fetch({
					data: {
						parentId: file.fileVersionId
					}
				});
			}
			data.iconType = 1;
			var navHtml = new App.Comm.TreeViewMar(data);
			that.$el.find(".fileTree").html(navHtml);
			that.fileScroll();

		});

	},

	//文件浏览滚动条
	fileScroll: function() {
		var $fileTree = this.$el.find(".fileTree");
		if (!$fileTree.hasClass('mCustomScrollbar')) {
			$fileTree.mCustomScrollbar({
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

	//切换Tab
	navClick: function(event) {

		var type = $(event.target).addClass("selected").siblings().removeClass("selected").end().data("type"),
			$resourceModelLeftNav = this.$el;

		App.ResourceModel.Settings.leftType = type;

		if (type == "file") {
			//文件
			$resourceModelLeftNav.find(".fileTree").show().end().find(".modelTree").hide();
			$resourceModelLeftNav.find(".dragSize").hide().end().find(".slideBar").hide();

			//触发内容部分的左侧导航事件
			Backbone.trigger('navClickCB', type);

		} else {

			if (!typeof(Worker)) {
				alert("请使用现代浏览器查看模型");
				return;
			}

			$resourceModelLeftNav.find(".fileTree").hide().end().find(".modelTree").show();
			$resourceModelLeftNav.find(".dragSize").show().end().find(".slideBar").show();

			if (App.ResourceModel.Settings.DataModel && App.ResourceModel.Settings.DataModel.sourceId) {
				this.renderModel();
			} else {
				//获取模型id
				this.fetchModelIdByResource(() => {
					$("#resourceModelLeftNav .item:last").addClass("selected").siblings().removeClass("selected");
					$resourceModelLeftNav.find(".fileTree").show().end().find(".modelTree").hide();
					$resourceModelLeftNav.find(".dragSize").hide().end().find(".slideBar").hide();
				});
			} 
		}

	},

	//获取模型id
	fetchModelIdByResource: function(errCb) {

		var data = {
			URLtype: "fetchModelIdByProject",
			data: {
				projectId: App.ResourceModel.Settings.CurrentVersion.projectId,
				projectVersionId: App.ResourceModel.Settings.CurrentVersion.id
			}
		}

		// App.ResourceModel.Settings.modelId = "e0c63f125d3b5418530c78df2ba5aef1";
		// this.renderModel();
		// return;

		App.Comm.ajax(data, (data) => {

			if (data.message == "success") {

				if (data.data) {
					App.ResourceModel.Settings.DataModel = data.data;
					//成功渲染
					this.renderModel();
				} else {
					alert("模型转换中");
					//回调处理 tab
					if ($.isFunction(errCb)) {
						errCb();
					}
				}
			} else {
				//回调处理 tab
				if ($.isFunction(errCb)) {
					errCb();
				}
				alert(data.message);
			}

		});
	},

	renderModel() {
		this.bindTreeScroll();
		this.$el.find(".modelTree .mCS_no_scrollbar_y").width(800);

		//触发内容部分的左侧导航事件
		Backbone.trigger('navClickCB', App.ResourceModel.Settings.leftType);
	},

	//文件浏览滚动条
	bindTreeScroll: function() {
		var $modelTree = this.$el.find(".modelTree");
		if (!$modelTree.hasClass('mCustomScrollbar')) {
			$modelTree.mCustomScrollbar({
				set_height: "100%",
				set_width: "100%",
				theme: 'minimal-dark',
				axis: 'xy',
				keyboard: {
					enable: true
				},
				scrollInertia: 0
			});
		}

	},

	// 收起暂开
	slideBarToggle: function() {

		App.Comm.navBarToggle(this.$el, $("#navContainer"), "left", App.ResourceModel.Settings.Viewer);
	},

	//拖拽改变大小
	dragSize: function(event) {

		App.Comm.dragSize(event, $("#resourceModelLeftNav"), $("#navContainer"), "left", App.ResourceModel.Settings.Viewer);

		return false;
	}

});