App.ResourceModel.LeftNav = Backbone.View.extend({

	tagName: "div",

	id: "resourceModelLeftNav",

	template: _.templateUrl("/resources/tpls/resourceModel/resources.model.leftNav.html", true),

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
				$("#navContainer .header .ckAll").prop("checked", false);
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
			if (data.data) {
				var navHtml = new App.Comm.TreeViewMar(data);
				that.$el.find(".fileTree").html(navHtml);

				App.Comm.initScroll();

				that.fileScroll(this.$el.find(".fileTree"),"y");
			} else {
				that.$el.find(".fileTree").html('<div class="loading">无数据</div>');
			} 

		});

	}

 
});