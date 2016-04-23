//project.quality.property.processAcceptance.es6 过程验收

//过程验收
App.Project.QualityProcessAcceptance = Backbone.View.extend({

	tagName: "div",

	className: "QualityProcessAcceptance",

	initialize: function() {
		this.listenTo(App.Project.QualityAttr.ProcessAcceptanceCollection, "add", this.addOne);
		this.listenTo(App.Project.QualityAttr.ProcessAcceptanceCollection, "reset", this.loading);
	},


	events: {
		"click .searchToggle": "searchToggle",
		"click .clearSearch": "clearSearch",
		"click .tbProcessAccessBody tr":"showInModel"
	},


	//渲染
	render: function(options) {

		this.ProcessAcceptanceOptions=options.ProcessAcceptance;

		var tpl = _.templateUrl("/projects/tpls/project/quality/project.quality.property.processAcceptance.html", true);
		this.$el.html(tpl);
		this.bindEvent();
		return this;

	},

	//事件初始化
	bindEvent() {
		var that=this;
		//隐患
		this.$(".riskOption").myDropDown({click:function($item){
			that.ProcessAcceptanceOptions.problemCount=$item.data("status");
		}});
		//列别
		this.$(".categoryOption").myDropDown({click:function($item){
			that.ProcessAcceptanceOptions.category=$item.text();
		}});
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
	},
	//加载
	loading(){

		this.$(".tbProcessAccessBody tbody").html(App.Project.Settings.loadingTpl);
		 
	},

	//模型中显示
	showInModel(event){ 

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
				Ids.push($(this).data("cate")); 
			}); 
			App.Project.Settings.Viewer.highlight({
				type: "userId",
				ids: Ids
			}) 

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
				$target.data("cate",data.data);

				$target.parent().find(".selected").each(function() {
					Ids.push($(this).data("cate")); 
				});
				  
				App.Project.Settings.Viewer.highlight({
					type: "userId",
					ids: Ids
				})
			}
		});


	}


});