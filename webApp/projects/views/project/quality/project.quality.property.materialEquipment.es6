//project.quality.property.materialEquipment.es6


//材料设备
App.Project.QualityMaterialEquipment = Backbone.View.extend({

	tagName: "div",

	className: "QualityMaterialEquipment",

	initialize: function() {

		this.listenTo(App.Project.QualityAttr.MaterialEquipmentCollection, "add", this.addOne);
		this.listenTo(App.Project.QualityAttr.MaterialEquipmentCollection, "reset", this.loading);
	},


	events: {
		"click .searchToggle": "searchToggle"

	},


	//渲染
	render: function(options) {

		this.MaterialEquipmentOptions = options.MaterialEquipmentOptions;

		var tpl = _.templateUrl("/projects/tpls/project/quality/project.quality.property.materialEquipment.html", true);

		this.$el.html(tpl);

		this.bindEvent();

		return this;

	},

	//显示隐藏搜索
	searchToggle() {
		var $searchDetail = this.$(".searchDetail");
		if ($searchDetail.is(":animated")) {
			return;
		}
		$searchDetail.slideToggle();
	},

	//事件绑定
	bindEvent: function() {

		var that = this;
		//专业
		this.$(".specialitiesOption").myDropDown({
			click: function($item) {

				that.MaterialEquipmentOptions.specialty = $item.text();
			}
		});

		//类别
		this.$(".categoryOption").myDropDown({
			click: function($item) {
				that.MaterialEquipmentOptions.category = $item.text();
			}
		});


		this.$(".statusOption").myDropDown({
			click: function($item) {
				that.MaterialEquipmentOptions.status = $item.data("status");
			}
		});

		this.$(".txtSearchName").blur(function() {
			that.MaterialEquipmentOptions.name = $(this).val().trim();
		});

		this.$("#dateStar").one("mousedown",function() { 
			//日期控件初始化
			$('#dateStar').datetimepicker({
				language: 'zh-CN',
				autoclose: true,
				format: 'yyyy-mm-dd',
				minView: 'month',
				endDate: new Date()

			}).on("changeDate",function(ev){
				that.MaterialEquipmentOptions.startTime = ev.date.format("yyyy-MM-dd");
			});
		});

		this.$("#dateEnd").one("mousedown",function() {
			//日期控件初始化
			$('#dateEnd').datetimepicker({
				language: 'zh-CN',
				autoclose: true,
				format: 'yyyy-mm-dd',
				minView: 'month',
				endDate: new Date()

			}).on("changeDate",function(ev){
				that.MaterialEquipmentOptions.endTime = ev.date.format("yyyy-MM-dd");
			});
		});



		this.$(".dateBox .iconCal").click(function() {
			$(this).next().focus();
		});

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
	},

	template: _.templateUrl("/projects/tpls/project/quality/project.quality.property.materialEquipment.body.html"),

	//获取数据后处理
	addOne: function(model) {


		//移除重复监听
		if (this.$el.closest("body").length <= 0) {
			this.remove();
		}

		var data = model.toJSON();
		this.$(".tbMaterialequipmentBody tbody").html(this.template(data));

		this.bindScroll();

	},
	//加载
	loading() {

		this.$(".tbMaterialequipmentBody tbody").html(App.Project.Settings.loadingTpl);

	}


});