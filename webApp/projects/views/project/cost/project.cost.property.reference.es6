//成本 -> 清单
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
		var $target = $(event.target).closest(".item"),
			ids=$target.data("userId"),
			box=$target.data("box");
		if ($target.hasClass("selected")) {
			return
		} else {
			this.$(".tbBodyScroll").find(".selected").removeClass("selected");
			$target.addClass("selected");
		}
		if (ids && box) {
			App.Project.zoomModel(ids,box);
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
				var box=App.Project.formatBBox(data.data.boundingBox);
				$target.data("userId", data.data.elements);
				$target.data("box", box);
				App.Project.zoomModel(data.data.elements,box);
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