"use strict";

App.Project.ProjectPlanProperty = Backbone.View.extend({

	tagName: "div",

	className: "ProjectPlanPropertyContainer",

	template: _.templateUrl("/projects/tpls/project/plan/project.plan.nav.html", true),

	events: {
		"click .projectPlanNav .item": "navItemClick",
		"change .selDate": "changeDate",
		'change .dateStar': 'loadPlanModelData',
		'change .dateEnd': 'loadPlanModelData',
		'click .clearFormLink': 'clearSearch'
	},

	planType: '1',

	render: function render() {

		this.$el.html(this.template);

		//if (App.AuthObj.project && App.AuthObj.project.plan) {

		// var Auth = App.AuthObj.project.plan,
		// 	$projectNav = this.$(".projectPlanNav"),
		// 	CostTpl = App.Comm.AuthConfig.Project.PlanTab,
		// 	$container = this.$(".planContainer");

		var $container = this.$(".planContainer");

		////模块化
		//if (Auth.modularization) {
		//	$projectNav.append(CostTpl.modularization);
		$container.append(new App.Project.PlanModel().render().el);
		//}

		//模拟
		//if (Auth.simulation) {
		//	$projectNav.append(CostTpl.simulation);
		$container.append(new App.Project.PlanAnalog().render().el);
		//}

		//关注
		//if (Auth.follow) {
		//	$projectNav.append(CostTpl.follow);
		$container.append(new App.Project.PlanPublicity().render().el);
		//}

		//效验
		//if (Auth.proof) {
		//	$projectNav.append(CostTpl.proof);
		$container.append(new App.Project.PlanInspection().render().el);
		//}

		//属性
		//if (Auth.prop) {
		//	$projectNav.append(CostTpl.prop);
		$container.append(new App.Project.PlanProperties().render().el);
		//}
		//}

		this.initDom();
		return this;
	},

	//初始化dom事件
	initDom: function initDom() {
		var _this = this;
		this.$('.planTimeType').myDropDown({
			click: function click($item) {
				_this.planType = $item.attr('data-val');
				_this.loadPlanModelData();
			}
		});

		this.$('.dateStar').datetimepicker({
			language: 'zh-CN',
			autoclose: true,
			format: 'yyyy-mm-dd',
			minView: 'month'
		}).on("changeDate", function (ev) {
			var _dateStr = new Date(ev.date.getTime() + 24 * 60 * 60 * 1000).format('yyyy-MM-dd');
			_this.$('.dateEnd').datetimepicker('setStartDate', _dateStr);
			_this.$('.dateEnd').val('');
		});
		this.$('.dateEnd').datetimepicker({
			language: 'zh-CN',
			autoclose: true,
			format: 'yyyy-mm-dd',
			minView: 'month'
		});
		this.$(".dateBox .iconCal").click(function () {
			$(this).next().focus();
		});
	},
	loadPlanModelData: function loadPlanModelData() {
		var _start = this.$('.dateStar').val(),
		    _end = this.$('.dateEnd').val(),
		    projectId = App.Project.Settings.projectId,
		    projectVersionId = App.Project.Settings.CurrentVersion.id;

		_start = _start ? new Date(_start + ' 00:00:00').getTime() : '';
		_end = _end ? new Date(_end + ' 23:59:59').getTime() : '';
		App.Project.PlanAttr.PlanModelCollection.reset();
		App.Project.PlanAttr.PlanModelCollection.projectId = projectId;
		App.Project.PlanAttr.PlanModelCollection.projectVersionId = projectVersionId;
		App.Project.PlanAttr.PlanModelCollection.fetch({
			data: {
				startTime: _start,
				endTime: _end,
				type: this.planType
			}
		});
	},
	clearSearch: function clearSearch() {
		this.$('.dateStar').val('');
		this.$('.dateEnd').val('');
		this.$('.planTimeType .text').html('计划开始');
		this.planType = '1';
		this.loadPlanModelData();
	},

	//切换导航
	navItemClick: function navItemClick(event) {

		var $target = $(event.target),
		    type = $target.data("type"),
		    projectVersionId = App.Project.Settings.CurrentVersion.id,
		    projectId = App.Project.Settings.projectId;
		$target.addClass('selected').siblings().removeClass('selected');
		App.Project.Settings.property = type;

		if (type == "model") {
			//碰撞

			var $planModel = this.$el.find(".planModel");

			$planModel.show().siblings().hide();

			if ($planModel.find(".noLoading").length > 0) {
				App.Project.PlanAttr.PlanModelCollection.reset();
				App.Project.PlanAttr.PlanModelCollection.projectId = projectId;
				App.Project.PlanAttr.PlanModelCollection.projectVersionId = projectVersionId;
				App.Project.PlanAttr.PlanModelCollection.fetch();
			}
		} else if (type == "analog") {
			//设计检查

			var $planAnalog = this.$el.find(".planAnalog");

			$planAnalog.show().siblings().hide();

			if ($planAnalog.find(".noLoading").length > 0) {
				App.Project.PlanAttr.PlanAnalogCollection.reset();
				App.Project.PlanAttr.PlanAnalogCollection.projectId = projectId;
				App.Project.PlanAttr.PlanAnalogCollection.projectVersionId = projectVersionId;
				App.Project.PlanAttr.PlanAnalogCollection.fetch();
			}
		} else if (type == "publicity") {

			var $planPublicity = this.$el.find(".planPublicity");
			//关注
			$planPublicity.show().siblings().hide();

			if ($planPublicity.find(".noLoading").length > 0) {
				//计划关注列表
				this.loadPublicityData(projectId, projectVersionId);
			}
		} else if (type == "inspection") {
			//设计检查

			var $planInterest = this.$el.find(".planInterest");
			$planInterest.show().siblings().hide();

			if ($planInterest.find(".noLoading").length > 0) {
				this.loadPlanInspection(projectId, projectVersionId);
			}
		} else if (type == "poperties") {
			//属性

			this.$el.find(".planProperties").show().siblings().hide();
			//属性渲染
			App.Project.renderProperty();
		}
	},

	//改变时间
	changeDate: function changeDate(event) {

		var $target = $(event.target),
		    val = $target.val(),
		    data = {
			projectCode: App.Project.Settings.CurrentVersion.projectNo,
			type: val,
			userId: App.Comm.user('userId')
		};

		if (val == 4 || val == 2) {
			App.Project.PlanAttr.PlanPublicityCollectionMonth.reset();
			App.Project.PlanAttr.PlanPublicityCollectionMonth.fetch({
				data: data
			});
		}
		if (val == 3 || val == 1) {
			App.Project.PlanAttr.PlanPublicityCollection.reset();
			App.Project.PlanAttr.PlanPublicityCollection.fetch({
				data: data
			});
		}
	},


	//加载计划关注列表
	loadPublicityData: function loadPublicityData(projectId, projectVersionId, isEnd) {

		var weekType = 4,
		    monthType = 3;
		if (isEnd) {
			weekType = 2;
			monthType = 1;
		}

		App.Project.PlanAttr.PlanPublicityCollection.reset();
		//App.Project.PlanAttr.PlanPublicityCollection.projectId = projectId;
		//App.Project.PlanAttr.PlanPublicityCollection.projectVersionId = projectVersionId;

		App.Project.PlanAttr.PlanPublicityCollection.fetch({
			data: {
				projectCode: App.Project.Settings.CurrentVersion.projectNo,
				type: monthType,
				userId: App.Comm.user('userId')
			}
		});

		App.Project.PlanAttr.PlanPublicityCollectionMonth.reset();
		//App.Project.PlanAttr.PlanPublicityCollectionMonth.projectId = projectId;
		//App.Project.PlanAttr.PlanPublicityCollectionMonth.projectVersionId = projectVersionId;

		App.Project.PlanAttr.PlanPublicityCollectionMonth.fetch({
			data: {
				projectCode: App.Project.Settings.CurrentVersion.projectNo,
				type: weekType,
				userId: App.Comm.user('userId')
			}
		});
	},


	//加载设计检查
	loadPlanInspection: function loadPlanInspection(projectId, projectVersionId) {

		App.Project.PlanAttr.PlanInspectionCollection.reset();
		App.Project.PlanAttr.PlanInspectionCollection.projectVersionId = projectVersionId;
		App.Project.PlanAttr.PlanInspectionCollection.projectId = projectId;
		App.Project.PlanAttr.PlanInspectionCollection.fetch();

		App.Project.PlanAttr.fetchPlanInspectionCate.reset();
		App.Project.PlanAttr.fetchPlanInspectionCate.projectVersionId = projectVersionId;
		App.Project.PlanAttr.fetchPlanInspectionCate.projectId = projectId;
		App.Project.PlanAttr.fetchPlanInspectionCate.fetch();
	}
});