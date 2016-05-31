//成本 -> 校验
App.Project.CostVerification = Backbone.View.extend({

	tagName: "div",

	className: "CostVerification",

	initialize: function() {
		this.listenTo(App.Project.CostAttr.VerificationCollection, "add", this.addOne);
		this.listenTo(App.Project.CostAttr.VerificationCollection, "reset", this.reset);

		this.listenTo(App.Project.CostAttr.VerificationCollectionCate, "add", this.addOneCate);
		this.listenTo(App.Project.CostAttr.VerificationCollectionCate, "reset", this.resetCate);
	},


	events: {
		"click .tbVerificationCate .nodeSwitch": "showNode",
		"click .tbVerification .nodeSwitch":"nodeSwitch",
		"click .subData .code": "showInModel"
	},


	//渲染
	render: function() {
		var page = _.templateUrl("/projects/tpls/project/cost/project.cost.property.verification.html", true);
		this.$el.html(page);
		return this;

	},

	//获取数据后处理
	addOne: function(model) {
		var template = _.templateUrl("/projects/tpls/project/cost/project.cost.property.verification.detail.html"),
			data = model.toJSON(),
			$tbTop = this.$(".tbTop");

		$tbTop.find("tbody").html(template(data));
		$tbTop.prev().find(".count").text(data.data.length);

	},

	addOneCate(model) {
		var template = _.templateUrl("/projects/tpls/project/plan/project.plan.property.inspection.detail.cate.html"),
			data = model.toJSON(),
			$tbBottom = this.$(".tbVerificationCate");

		$tbBottom.find("tbody").html(template(data));
		$tbBottom.prev().find(".count").text(data.data.length);
	},

	resetCate() {
		this.$(".tbVerificationCate tbody").html(App.Project.Settings.loadingTpl);
	},

	reset() {
		this.$(".tbTop tbody").html(App.Project.Settings.loadingTpl);
	},
	//图元未关联计划节点 暂开
	showNode(event) {

		var $target = $(event.target),
			$tr = $target.closest("tr");
		//展开
		if ($target.hasClass("on")) {
			$target.removeClass("on");
			$tr.nextUntil(".odd").hide();
			return;
		}

		//加载过
		if (!$tr.next().hasClass("odd")) {
			$target.addClass("on");
			$tr.nextUntil(".odd").show();
			return;
		}
		//未加载过
		var data = {
			URLtype: "fetchNoCostCate",
			data: {
				projectId: App.Project.Settings.projectId,
				projectVersionId: App.Project.Settings.CurrentVersion.id,
				cateId: $target.data("cateid")
			}
		}

		App.Comm.ajax(data, function(data) {

			if (data.code == 0) {
				var tpl = _.templateUrl("/projects/tpls/project/plan/project.plan.property.inspection.detail.cate.detail.html");
				$tr.after(tpl(data));
				$target.addClass("on");
			}

		});

	},
	//在模型中显示
	showInModel(event) {
		App.Project.planCostShowInModel(event); 
		// var $target = $(event.target),
		// 	modelId = $target.data("id"),
		// 	$parent = $target.parent();
		// if ($parent.hasClass("selected")) {
		// 	$target.closest("table").find(".selected").removeClass("selected");
		// 	App.Project.Settings.Viewer.selectIds();
		// } else {
		// 	$target.closest("table").find(".selected").removeClass("selected");
		// 	$target.parent().addClass("selected");
		// 	App.Project.Settings.Viewer.selectIds([modelId]);
		// }
		// App.Project.Settings.Viewer.zoomSelected();
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