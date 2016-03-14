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

			App.ResourcesNav.StandardLibsCollection.fetch({
				data: { 
					pageIndex: App.ResourcesNav.Settings.pageIndex,
					pageItemCount: App.Comm.Settings.pageItemCount
				},
				success: function(collection, response, options) {
					console.log(response);
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



		App.Projects.ProjectCollection.fetch({

			data: {
				projectType: 1,
				name: "",
				estateType: "",
				province: "",
				region: "",
				complete: "",
				open: "",
				openTimeStart: "",
				openTimEnd: ""

			}
		});
	},

});