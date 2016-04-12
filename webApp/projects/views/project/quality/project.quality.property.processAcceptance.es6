//project.quality.property.processAcceptance.es6 过程验收

//过程验收
App.Project.QualityProcessAcceptance = Backbone.View.extend({

	tagName: "div",

	className: "QualityProcessAcceptance",

	initialize: function() {
		this.listenTo(App.Project.QualityAttr.ProcessAcceptanceCollection, "add", this.addOne);
	},


	events: {
		"click .searchToggle": "searchToggle",
		"click .clearSearch": "clearSearch"
	},


	//渲染
	render: function() {

		var tpl = _.templateUrl("/projects/tpls/project/quality/project.quality.property.processAcceptance.html", true);
		this.$el.html(tpl);
		this.bindEvent();
		return this;

	},

	//事件初始化
	bindEvent() {
		//隐患
		this.$(".riskOption").myDropDown();
		//列别
		this.$(".categoryOption").myDropDown();
		//显示搜索结果对应位置
		this.$(".groupRadio").myRadioCk();
	},

	//显示隐藏搜索
	searchToggle() {
		var $searchDetail = this.$(".searchDetail");
		if ($searchDetail.is(":animated")) {
			return;
		}
		$searchDetail.slideToggle();
	},

	//清空搜索条件
	clearSearch() {

	},

	template: _.templateUrl("/projects/tpls/project/quality/project.quality.property.processAcceptance.body.html"),

	//获取数据后处理
	addOne: function(model) {
		var data = model.toJSON();
		this.$(".tbProcessAccessBody tbody").html(this.template(data));
		this.bindScroll();
	},

	//绑定滚动条
	bindScroll() {

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
	}


});