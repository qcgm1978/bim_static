"use strict";

// 开业验收 project.quality.property.openingAcceptance.es6

//开业验收
App.Project.QualityOpeningAcceptance = Backbone.View.extend({

	tagName: "div",

	className: "QualityOpeningAcceptance",

	currentDiseaseView: null,

	initialize: function initialize() {
		this.listenTo(App.Project.QualityAttr.OpeningAcceptanceCollection, "add", this.addOne);
		this.listenTo(App.Project.QualityAttr.OpeningAcceptanceCollection, "reset", this.loading);
	},

	events: {
		"click .searchToggle": "searchToggle",
		"click .clearSearch": "clearSearch",
		"click .tbOpeningacceptanceBody tr": "showInModel",
		'click .resultStatusIcon': 'showDiseaseList',
		'click .btnCk': 'showSelectMarker'

	},

	//渲染
	render: function render(options) {

		this.OpeningAcceptanceOptions = options.OpeningAcceptance;

		var tpl = _.templateUrl("/projects/tpls/project/quality/project.quality.property.openingAcceptance.html");
		this.$el.html(tpl);
		this.bindEvent();
		return this;
	},

	//开业验收过滤条件change事件
	changeOA: function changeOA(key, val) {
		Backbone.trigger('qualityFilterDataChange', 'OpeningAcceptanceOptions', key, val);
	},


	//事件初始化
	bindEvent: function bindEvent() {

		var that = this;

		this.$('.txtLocationName').change(function () {
			that.changeOA('locationName', $(this).val());
		});
		//隐患
		this.$(".riskOption").myDropDown({
			click: function click($item) {
				//	that.OpeningAcceptanceOptions.problemCount = $item.data("status");
				that.changeOA('problemCount', $item.data("val"));
			}
		});
		this.$(".floorOption").myDropDown({
			click: function click($item) {
				//	that.OpeningAcceptanceOptions.problemCount = $item.data("status");
				that.changeOA('floor', $item.data("val"));
			}
		});
		//类别
		this.$(".categoryOption").myDropDown({
			zIndex: 20,
			click: function click($item) {
				//that.OpeningAcceptanceOptions.category = $item.text();
				that.changeOA('category', $item.attr('data-val'));
			}
		});

		//状态
		this.$(".statusOption").myDropDown({
			click: function click($item) {
				//	that.OpeningAcceptanceOptions.specialty = $item.text();
				that.changeOA('specialty', $item.attr('data-val'));
			}
		});

		//显示搜索结果对应位置
		this.$(".groupRadio").myRadioCk();
	},
	showSelectMarker: function showSelectMarker(e) {
		App.Project.isShowMarkers('open', $(e.currentTarget).hasClass('selected'));
	},


	//显示隐藏搜索
	searchToggle: function searchToggle(e) {
		var $searchDetail = this.$(".searchDetail");
		if ($searchDetail.is(":animated")) {
			return;
		}
		$(e.currentTarget).toggleClass('expandArrowIcon');
		$searchDetail.slideToggle();
	},
	searchup: function searchup() {
		var $searchDetail = this.$(".searchDetail");
		if ($searchDetail.is(":animated")) {
			return;
		}
		this.$('.searchToggle').removeClass('expandArrowIcon');
		$searchDetail.slideUp();
	},

	//清空搜索条件
	clearSearch: function clearSearch() {
		this.$(".riskOption .text").html('全部');
		this.$(".categoryOption .text").html('全部');
		this.$(".specialitiesOption .text").html('全部');
		Backbone.trigger('qualityFilterDataClear');
	},


	template: _.templateUrl("/projects/tpls/project/quality/project.quality.property.openingAcceptance.body.html"),

	//获取数据后处理
	addOne: function addOne(model) {
		var data = model.toJSON();
		this.$(".tbOpeningacceptanceBody tbody").html(this.template(data));
		this.bindScroll();
	},
	//绑定滚动条
	bindScroll: function bindScroll() {

		var $materialequipmentListScroll = this.$(".materialequipmentListScroll");

		if ($materialequipmentListScroll.hasClass('mCustomScrollbar')) {
			return;
		}

		$materialequipmentListScroll.mCustomScrollbar({
			set_height: "100%",
			theme: 'minimal-dark',
			axis: 'y',
			keyboard: {
				enable: true
			},
			scrollInertia: 0
		});
	},

	//加载
	loading: function loading() {

		this.$(".tbOpeningacceptanceBody tbody").html(App.Project.Settings.loadingTpl);
		this.searchup();
	},


	//模型中显示
	showInModel: function showInModel(event) {
		App.Project.showInModel($(event.target).closest("tr"), 0);
	},
	showDiseaseList: function showDiseaseList(event) {
		App.Project.QualityAttr.showDisease(event, this, 'open', 2); // showDiseaseList
		event.stopPropagation();
	}
});