/**
 * @require /resources/collection/resource.nav.es6
 */

App.ResourcesNav.App = Backbone.View.extend({

	el: $("#contains"),

	template: _.templateUrl("/resources/tpls/resources.app.html", true),


	render() {

		var _this = this;

		this.$el.html(new App.ResourceCrumbsNav().render().el);

		var type = App.ResourcesNav.Settings.type;
		var optionType = App.ResourcesNav.Settings.optionType;



		if (type == "standardLibs") {
			//获取标准模型库数据
			this.fetchStandardLibs();

		} else if (type == "famLibs") {
			//族库
			this.fetchFamLibs();

		} else if (type == "qualityStandardLibs") {
			//质量标准库
			this.$el.append(new App.ResourcesNav.QualityStandardLibs().render().el);

		} else if (type == "manifestLibs") {
			//清单库
			this.$el.append(new App.ResourcesNav.ManifestLibs().render().el);

		}else if(type == "artifactsMapRule" ||  type == "project"){

			//构件映射规则
			if(optionType){//映射规则/规则模板
				App.ResourceArtifacts.init(_this,optionType);
			}
		}
		this.bindScroll();
		return this;
	},




	//获取标准模型库数据
	fetchStandardLibs: function() {

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
				$("#pageLoading").hide();
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
	},

	//只是加载数据
	onlyLoadStandardLibsData: function() { 

		App.ResourcesNav.StandardLibsCollection.reset();
		App.ResourcesNav.StandardLibsCollection.fetch({
			data: {
				pageIndex: App.ResourcesNav.Settings.pageIndex,
				pageItemCount: App.Comm.Settings.pageItemCount
			}
		});
	},

	//获取标准模型库数据
	fetchFamLibs: function() {

		//标准模型库
		this.$el.append(new App.ResourcesNav.FamLibs().render().el);
		//重置 和 加载数据
		App.ResourcesNav.FamLibsCollection.reset();
		var that = this;
		App.ResourcesNav.FamLibsCollection.fetch({
			data: {
				pageIndex: App.ResourcesNav.Settings.pageIndex,
				pageItemCount: App.Comm.Settings.pageItemCount
			},
			success: function(collection, response, options) {
				$("#pageLoading").hide();
				var $standardLibs = $("#famLibs"),
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
						that.onlyLoadFamLibsData();
					},
					prev_text: "上一页",
					next_text: "下一页"

				});
			}
		});
	},

	onlyLoadFamLibsData: function() {
		App.ResourcesNav.FamLibsCollection.reset();
		App.ResourcesNav.FamLibsCollection.fetch({
			data: {
				pageIndex: App.ResourcesNav.Settings.pageIndex,
				pageItemCount: App.Comm.Settings.pageItemCount
			}
		});
	},

	bindScroll() {
		this.$el.find(".standarBodyScroll").mCustomScrollbar({
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

});