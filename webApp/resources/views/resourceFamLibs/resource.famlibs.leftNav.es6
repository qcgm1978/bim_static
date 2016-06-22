App.ResourceFamLibs.leftNav = Backbone.View.extend({

	tagName: "div",

	id: "resourceFamlibsLeftNav",

	template: _.templateUrl("/resources/tpls/resourceFamLibs/resource.famlibs.leftNav.html", true),
 
	//渲染
	render: function(type) {

		this.$el.html(this.template);

		this.getfileTree();

		return this;
	},

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

				//清除搜索
				$("#navContainer").find(".clearSearch").hide().end().
				find(".opBox").show().end().
				find(".searchCount").hide();
				$("#txtFileSearch").val("");
				App.ResourceModel.Settings.searchText = "";
				
				//清空数据
				$("#resourceThumContent .thumContent").empty();
				App.ResourceModel.Settings.fileVersionId = file.fileVersionId;
				App.ResourceModel.FileThumCollection.reset();

				App.ResourceModel.FileThumCollection.fetch({
					data: {
						parentId: file.fileVersionId
					}
				});
			}
			data.iconType = 1;
			if (data.data) {
				var navHtml = new App.Comm.TreeViewMar(data);
				that.$el.find(".fileTree").html(navHtml);
				App.Comm.initScroll(that.$el.find(".fileTree"), "y"); 
			} else { 
				that.$el.find(".fileTree").html('<div class="loading">无数据</div>'); 
			} 

			$("#pageLoading").hide();

		});
	}



});