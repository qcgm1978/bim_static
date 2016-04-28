// 开业验收 project.quality.property.openingAcceptance.es6

//开业验收
App.Project.QualityOpeningAcceptance = Backbone.View.extend({

	tagName: "div",

	className: "QualityOpeningAcceptance",

	initialize: function() {
		this.listenTo(App.Project.QualityAttr.OpeningAcceptanceCollection, "add", this.addOne);
		this.listenTo(App.Project.QualityAttr.OpeningAcceptanceCollection, "reset", this.loading);
	},


	events: {
		"click .searchToggle": "searchToggle",
		"click .clearSearch": "clearSearch",
		"click .tbOpeningacceptanceBody tr": "showInModel"
	},


	//渲染
	render: function(options) {

		this.OpeningAcceptanceOptions = options.OpeningAcceptance;

		var tpl = _.templateUrl("/projects/tpls/project/quality/project.quality.property.openingAcceptance.html");
		this.$el.html(tpl);
		this.bindEvent();
		return this;

	},

	//事件初始化
	bindEvent() {

		var that = this;
		//隐患
		this.$(".riskOption").myDropDown({
			click: function($item) {
				that.OpeningAcceptanceOptions.problemCount = $item.data("status");
			}
		});
		//列别
		this.$(".categoryOption").myDropDown({
			click: function($item) {
				that.OpeningAcceptanceOptions.category = $item.text();
			}
		});

		//专业
		this.$(".specialitiesOption").myDropDown({
			click: function($item) {
				that.OpeningAcceptanceOptions.specialty = $item.text();
			}
		});

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

	template: _.templateUrl("/projects/tpls/project/quality/project.quality.property.openingAcceptance.body.html"),

	//获取数据后处理
	addOne: function(model) {
		var data = model.toJSON();
		this.$(".tbOpeningacceptanceBody tbody").html(this.template(data));
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
	},
	//加载
	loading() {

		this.$(".tbOpeningacceptanceBody tbody").html(App.Project.Settings.loadingTpl);

	},

	//模型中显示
	showInModel(event) {

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
			URLtype: "fetchQualityModelById",
			data: {
				projectId: App.Project.Settings.CurrentVersion.projectId,
				versionId: App.Project.Settings.CurrentVersion.id,
				acceptanceId: $target.data("id")
			}
		};

		App.Comm.ajax(data, function(data) {
			 
			if (data.code == 0) {
				if (data.data) {

					$target.data("cate", data.data.componentId);
					//无构建id 返回
					if (!data.data.componentIde) {
						return;
					}

					$target.parent().find(".selected").each(function() {
						Ids = $.merge(Ids, $(this).data("cate"))
					});

					App.Project.Settings.Viewer.selectIds(Ids);
					App.Project.Settings.Viewer.zoomSelected();
				} 
				// App.Project.Settings.Viewer.highlight({
				// 	type: "userId",
				// 	ids: Ids
				// })
			}
		});


	}



});