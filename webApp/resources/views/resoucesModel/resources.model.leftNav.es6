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
				$("#resourceModelListNav .fileContent").empty();
				App.ResourceModel.Settings.fileVersionId=file.fileVersionId;
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

	//模型浏览器
	getModelTree: function() {

	}

});