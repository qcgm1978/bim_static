//project.cost.property.reference.es6

//陈本清单
App.Project.CostReference = Backbone.View.extend({

	tagName: "div",

	className: "CostReference",

	initialize: function() {
		this.listenTo(App.Project.CostAttr.ReferenceCollection, "add", this.addOne);
		this.listenTo(App.Project.CostAttr.ReferenceCollection, "reset", this.reset);
	},


	events: {
		"click .tbReference  tr": "showInModle",
		"click tr .nodeSwitch": "nodeSwitch"
	},


	//渲染
	render: function() {
		var page = _.templateUrl("/projects/tpls/project/cost/project.cost.property.reference.html", true);
		this.$el.html(page);
		return this;
	},

	template: _.templateUrl("/projects/tpls/project/cost/project.cost.property.reference.detail.html"),

	rootTemplate: _.templateUrl("/projects/tpls/project/cost/project.cost.property.reference.detail.root.html"),

	itemTemplate: _.templateUrl("/projects/tpls/project/cost/project.cost.property.reference.detail.root.item.html"),

	//获取数据后处理
	addOne: function(model) {
		var data = model.toJSON();
		this.$(".tbReference tbody").html(this.template(data));
	},

	reset() {
		this.$(".tbReference tbody").html(App.Project.Settings.loadingTpl);
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
			App.Project.Settings.Viewer.selectIds(Ids);
			App.Project.Settings.Viewer.zoomSelected();
			// App.Project.Settings.Viewer.highlight({
			// 	type: "userId",
			// 	ids: Ids
			// }) 

			return;
		}


		var data = {
			URLtype: "fetchCostModleIdByCode",
			data: {
				projectId: App.Project.Settings.CurrentVersion.projectId,
				projectVersionId: App.Project.Settings.CurrentVersion.id,
				costCode: $target.data("code")
			}
		};

		App.Comm.ajax(data, function(data) {
			if (data.code == 0) {
				$target.data("cate", data.data);
				$target.parent().find(".selected").each(function() {
					Ids = $.merge(Ids, $(this).data("cate"))
				});
				App.Project.Settings.Viewer.selectIds(Ids);
				App.Project.Settings.Viewer.zoomSelected();
				// App.Project.Settings.Viewer.highlight({
				// 	type: "userId",
				// 	ids: Ids
				// })
			}
		});



	},

	//收起展开
	nodeSwitch(event) {
		 
		var $target = $(event.target),

			$tr = $target.closest("tr"),
			isOpen = $target.hasClass("on");

		if ($tr.hasClass("stepOne")) {
			//展开
			if (isOpen) {
				$tr.nextUntil(".stepOne").hide();
				$target.removeClass("on");
			} else {
				$tr.nextUntil(".stepOne").show();
				$target.addClass("on");
			}
		}

		if ($tr.hasClass("stepTwo")) {

			var nextUntilStepOne = $tr.nextUntil(".stepTwo"),
				isExists = false;

			nextUntilStepOne.each(function() {
				if ($(this).hasClass(".stepOne")) {
					isExists = true;
					return false;
				}
			}); 

			if (isExists) {
				//展开
				if (isOpen) {
					$tr.nextUntil(".stepOne").hide();
				} else {
					$tr.nextUntil(".stepOne").show();
				}
			} else {
				nextUntilStepOne.splice(-1);
				if (isOpen) {
					nextUntilStepOne.hide();
				}else{
					nextUntilStepOne.show();
				} 
			} 
		} 

		if (isOpen) {
			$target.removeClass("on");
		} else {
			$target.addClass("on");
		}

		event.stopPropagation();

	}


});