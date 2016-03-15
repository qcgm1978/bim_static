/**
 * @require /resources/collection/resource.nav.es6
 */

App.ResourcesNav.App = Backbone.View.extend({

	el: $("#contains"),

	template: _.templateUrl("/resources/tpls/resources/resources.app.html", true),

	render() {

		 
		this.$el.html(new App.ResourceCrumbsNav().render().el);

		var type = App.ResourcesNav.Settings.type;

		if (type == "standardLibs") {
			//标准模型库
			this.$el.append(new App.ResourcesNav.StandardLibs().render().el);
			//重置 和 加载数据
			App.ResourcesNav.StandardLibsCollection.reset();

			var that = this;
			App.ResourcesNav.StandardLibsCollection.fetch({
				data: {
					pageIndex: App.ResourcesNav.Settings.pageIndex,
					pageItemCount: App.Comm.Settings.pageItemCount
				},
				success: function(collection, response, options) {

					var $standardLibs = $("#standardLibs"),
						$standarPagination, pageCount = response.data.totalItemCount;
					//todo 分页

					$standarPagination = $standardLibs.find(".standarPagination");
					$standardLibs.find(".sumDesc").html('共 ' + pageCount + ' 个标准模型');

					$standarPagination.pagination(pageCount, {
						items_per_page: response.data.pageItemCount,
						current_page: response.data.pageIndex - 1,
						num_edge_entries: 3, //边缘页数
						num_display_entries: 5, //主体页数
						link_to: 'javascript:void(0);',
						itemCallback: function(pageIndex) {
							//加载数据
							App.ResourcesNav.Settings.pageIndex = pageIndex + 1;
							that.onlyLoadStandardLibsData();
						},
						prev_text: "上一页",
						next_text: "下一页"

					});
				}
			});

		} else if (type == "famLibs") {
			//族库
			this.$el.append(new App.ResourcesNav.FamLibs().render().el);


		} else if (type == "qualityStandardLibs") {
			//质量标准库
			this.$el.append(new App.ResourcesNav.QualityStandardLibs().render().el);

		} else if (type == "manifestLibs") {
			//清单库
			this.$el.append(new App.ResourcesNav.ManifestLibs().render().el);
		}

		return this;
	},

	//只是加载数据
	onlyLoadStandardLibsData: function() {

		//$("#standardLibs").find(".standarBody .standar").empty();

		App.ResourcesNav.StandardLibsCollection.fetch({ 
			data: {
				pageIndex: App.ResourcesNav.Settings.pageIndex,
				pageItemCount: App.Comm.Settings.pageItemCount 
			}
		});
	},

});