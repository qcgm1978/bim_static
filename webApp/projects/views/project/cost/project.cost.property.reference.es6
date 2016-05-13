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
		"click .tbBodyContent": "showInModle",
		"click .tbBodyContent .nodeSwitch": "nodeSwitch"
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
		data.treeNode = this.itemTemplate;
		this.$(".tbBody .tbBodyContent").html(this.rootTemplate(data));

		App.Comm.initScroll(this.$(".tbBodyScroll"),"y");
	},

	reset() {
		this.$(".tbBody .tbBodyContent").html(App.Project.Settings.loadingTpl);
	},
	//模型中显示
	showInModle(event) {

		var $target = $(event.target).closest(".item");


		if ($target.hasClass("selected")) {
			this.$(".tbBodyScroll").find(".selected").removeClass("selected");
			//$target.removeClass("selected");
		} else {
			this.$(".tbBodyScroll").find(".selected").removeClass("selected");
			$target.addClass("selected");
		}

		var Ids = [];

		if ($target.data("cate")) {

			this.$(".tbBodyScroll").find(".selected").each(function() {
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
			}
		});



	},

	//收起展开
	nodeSwitch(event) { 

		var $target = $(event.target),
			$node = $target.closest(".node");

		if ($target.hasClass("on")) {
			$target.removeClass("on");
			$node.children("ul").hide();
		} else {
			$target.addClass("on");
			$node.children("ul").show();
		} 

		//this.$(".tbBodyScroll .tbBodyContent li:visible:odd").addClass("odd");

		event.stopPropagation(); 

	}


});