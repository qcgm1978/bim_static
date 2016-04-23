App.Project.PlanModel = Backbone.View.extend({

	tagName: "div",

	className: "planModel",

	initialize: function() {
		this.listenTo(App.Project.PlanAttr.PlanModelCollection, "add", this.addOne);
	},

	events: {
		"click .tbPlan tr": "showInModle"
	},

	render: function() {
		var tpl = _.templateUrl("/projects/tpls/project/plan/project.plan.property.planModel.html", true);
		this.$el.html(tpl);
		return this;
	},

	template: _.templateUrl("/projects/tpls/project/plan/project.plan.property.planAnalog.detail.html"),


	addOne: function(model) {

		var data = model.toJSON();
		this.$(".tbPlan tbody").html(this.template(data));
	},

	//模型中显示
	showInModle(event) {

		var $target = $(event.target).closest("tr");


		if ($target.hasClass("selected")) {
			$target.parent().find(".selected").removeClass("selected");
			//$target.removeClass("selected");
		} else {
			$target.parent().find(".selected").removeClass("selected");
			$target.addClass("selected");
		}

		var Ids = [];
			 
		if ($target.data("cate")) {

			$target.parent().find(".selected").each(function() {
				Ids = $.merge(Ids, $(this).data("cate"))
			}); 
			App.Project.Settings.Viewer.highlight({
				type: "userId",
				ids: Ids
			}) 

			return;
		}

		 
		var data = {
			URLtype: "fetchModleIdByCode",
			data: {
				projectId: App.Project.Settings.CurrentVersion.projectId,
				projectVersionId: App.Project.Settings.CurrentVersion.id,
				planCode: $target.data("code")
			}
		};

		App.Comm.ajax(data, function(data) {
			if (data.code == 0) {
				$target.data("cate",data.data);
				$target.parent().find(".selected").each(function() {
					Ids = $.merge(Ids, $(this).data("cate"))
				});
				  
				App.Project.Settings.Viewer.highlight({
					type: "userId",
					ids: Ids
				})
			}
		});



	}


});