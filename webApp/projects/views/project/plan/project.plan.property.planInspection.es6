//检查
App.Project.PlanInspection = Backbone.View.extend({

	tagName: "div",

	className: "planInterest",

	initialize: function() {
		this.listenTo(App.Project.PlanAttr.PlanInspectionCollection, "add", this.addOne);
		this.listenTo(App.Project.PlanAttr.fetchPlanInspectionCate, "add", this.addOne2);

		this.listenTo(App.Project.PlanAttr.PlanInspectionCollection, "reset", this.reset);
		this.listenTo(App.Project.PlanAttr.fetchPlanInspectionCate, "reset", this.reset2);

	},

	events: {
		"click .tbBottom .nodeSwitch": "showNode",
		"click .subData .code": "showInModel"
	},


	render: function() {
		var page = _.templateUrl("/projects/tpls/project/plan/project.plan.property.inspection.html", true);
		this.$el.html(page);
		return this;
	},



	//计划节点未关联图元
	addOne: function(model) {
		var template = _.templateUrl("/projects/tpls/project/plan/project.plan.property.inspection.detail.html");
		var data = model.toJSON();
		var $tbTop = this.$(".tbTop");
		$tbTop.find("tbody").html(template(data));
		$tbTop.prev().find(".count").text(data.data.length); 
		this.bindScroll();
	},

	//图元未关联计划节点
	addOne2(model) {
		var template = _.templateUrl("/projects/tpls/project/plan/project.plan.property.inspection.detail.cate.html");
		var data = model.toJSON();
		var $tbBottom = this.$(".tbBottom"),
			count = data.data && data.data.length || 0;
		$tbBottom.find("tbody").html(template(data)); 
		$tbBottom.prev().find(".count").text(count);  
		this.bindScroll();
	},

	bindScroll(){
		this.$('.nullLinkData').hide();
		this.$('.exportList').show();
		App.Comm.initScroll(this.$(".contentBody .contentScroll"),"y");
	},

	reset() {
		this.$(".tbTop tbody").html(App.Project.Settings.loadingTpl);
	},
	reset2() {
		this.$(".tbBottom tbody").html(App.Project.Settings.loadingTpl);
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
			URLtype: "fetchComponentByCateId",
			data: {
				projectId: App.Project.Settings.projectId,
				projectVersionId: App.Project.Settings.CurrentVersion.id,
				cateId: $target.data("cateid")
			}
		}

		$tr.after('<tr><td class="subData loading">正在加载，请稍候……</td></tr>');
		App.Comm.ajax(data, function(data) {

			if (data.code == 0) {
				var tpl = _.templateUrl("/projects/tpls/project/plan/project.plan.property.inspection.detail.cate.detail.html");
				$tr.next().remove();
				$tr.after(tpl(data));
				$target.addClass("on");
			}

		});

	},

	//在模型中显示
	showInModel(event) { 
		App.Project.planCostShowInModel(event); 
	},
	 


});