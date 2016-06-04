// 隐患 project.quality.property.concerns.es6 
 


//隐患
App.Project.QualityConcerns=Backbone.View.extend({

	tagName:"div",

	className:"QualityConcerns",

	initialize:function(){
		this.listenTo(App.Project.QualityAttr.ConcernsCollection,"add",this.addOne);
		this.listenTo(App.Project.QualityAttr.ConcernsCollection,"reset",this.loading);
	},


	events:{
		"click .searchToggle":"searchToggle",
		"click .tbConcernsBody tr": "showInModel",
		"click .clearSearch": "clearSearch"
	 
	},


	//渲染
	render:function(options){

		this.ConcernsOptions=options.Concerns;

		var tpl=_.templateUrl("/projects/tpls/project/quality/project.quality.property.concerns.html");

		this.$el.html(tpl);

		this.bindEvent();

		return this;

	},

	//隐患过滤条件change事件
	changeHC(key,val){
		Backbone.trigger('qualityFilterDataChange','ConcernsOptions',key,val);
	},

	//事件初始化
	bindEvent(){

		var that=this;
		//列别
		this.$(".categoryOption").myDropDown({
			zIndex: 9,
			click: function($item) {
				//	that.ConcernsOptions.category=$item.text();
				that.changeHC('category', $item.attr('data-val'))
			}
		});
		//状态
		this.$(".statusOption").myDropDown({
			zIndex: 8,
			click: function($item) {
				//	that.ConcernsOptions.status=$item.data("status");
				that.changeHC('status', $item.data("status"))
			}
		});

		//填报人
		this.$(".operatorOption").myDropDown({
			zIndex: 7,
			click: function($item) {
				//	that.ConcernsOptions.reporter=$item.text();
				that.changeHC('reporter', $item.attr('data-val'))
			}
		});
		//等级
		this.$(".gradeOption").myDropDown({
			zIndex:6,
			click: function($item) {
				//	that.ConcernsOptions.level=$item.data("status");
				that.changeHC('level', $item.data("status"))
			}
		});
		//类型
		this.$(".typeOption").myDropDown({
			zIndex:5,
			click: function($item) {
				//	that.ConcernsOptions.type=$item.text();
				that.changeHC('type', $item.attr('data-val'))
			}
		});
		
		//显示搜索结果对应位置
		this.$(".groupRadio").myRadioCk();


	//	this.$("#dateStar2").one("mousedown",function() { 
			//日期控件初始化
			this.$('#dateStar2').datetimepicker({
				language: 'zh-CN',
				autoclose: true,
				format: 'yyyy-mm-dd',
				minView: 'month',
				endDate: new Date()

			}).on("changeDate",function(ev){
			//	that.MaterialEquipmentOptions.startTime = ev.date.format("yyyy-MM-dd");
				that.changeHC('startTime',new Date(ev.date.format("yyyy-MM-dd")+ ' 00:00:00').getTime())
			});
	//	});

//		this.$("#dateEnd2").one("mousedown",function() {
			//日期控件初始化
			this.$('#dateEnd2').datetimepicker({
				language: 'zh-CN',
				autoclose: true,
				format: 'yyyy-mm-dd',
				minView: 'month',
				endDate: new Date()

			}).on("changeDate",function(ev){
			//	that.MaterialEquipmentOptions.endTime = ev.date.format("yyyy-MM-dd");
				that.changeHC('endTime',new Date(ev.date.format("yyyy-MM-dd")+ ' 23:59:59').getTime())
			});
//		});



		this.$(".dateBox .iconCal").click(function() {
			$(this).next().focus();
		});
	},

	//显示隐藏搜索
	searchToggle(e){
		var $searchDetail=this.$(".searchDetail");
		if ($searchDetail.is(":animated")) {
			return;
		}
		$(e.currentTarget).toggleClass('expandArrowIcon');
		$searchDetail.slideToggle();
	},
	searchup() {
 		var $searchDetail = this.$(".searchDetail");
 		if ($searchDetail.is(":animated")) {
 			return;
 		}
 		this.$('.searchToggle').removeClass('expandArrowIcon');
 		$searchDetail.slideUp();
 	},
	
	//清空搜索条件
	clearSearch() {
		this.$(".categoryOption .text").html('全部')
		this.$(".statusOption .text").html('全部')
		this.$(".operatorOption .text").html('全部')
		this.$(".gradeOption .text").html('全部')
		this.$(".typeOption .text").html('全部')
		this.$("#dateStar2").val('')
		this.$("#dateEnd2").val('')
		Backbone.trigger('qualityFilterDataClear');
	},

	template:_.templateUrl("/projects/tpls/project/quality/project.quality.property.concerns.body.html"),

	//获取数据后处理
	addOne:function(model){
		var data=model.toJSON();
		this.$(".tbConcernsBody tbody").html(this.template(data));
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

		this.$(".tbConcernsBody tbody").html(App.Project.Settings.loadingTpl);
		this.searchup();
		 
	},

	//在模型中显示
	showInModel(){
		App.Project.showInModel($(event.target).closest("tr"),2);  
	}



});