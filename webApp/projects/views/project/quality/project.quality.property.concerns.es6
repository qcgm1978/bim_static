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
		"click .searchToggle":"searchToggle"
	 
	},


	//渲染
	render:function(options){

		this.ConcernsOptions=options.Concerns;

		var tpl=_.templateUrl("/projects/tpls/project/quality/project.quality.property.concerns.html");

		this.$el.html(tpl);

		this.bindEvent();

		return this;

	},

	//事件初始化
	bindEvent(){

		var that=this;
		//列别
		this.$(".categoryOption").myDropDown({click:function($item){
			that.ConcernsOptions.category=$item.text();
		}});
		//状态
		this.$(".statusOption").myDropDown({click:function($item){
			that.ConcernsOptions.status=$item.data("status");
		}});

		//填报人
		this.$(".operatorOption ").myDropDown({click:function($item){
			that.ConcernsOptions.reporter=$item.text();
		}});
		//等级
		this.$(".gradeOption").myDropDown({click:function($item){
			that.ConcernsOptions.level=$item.data("status");
		}});
		//类型
		this.$(".typeOption").myDropDown({click:function($item){
			that.ConcernsOptions.type=$item.text();
		}}); 
		
		//显示搜索结果对应位置
		this.$(".groupRadio").myRadioCk();


		this.$("#dateStar2").one("mousedown",function() { 
			//日期控件初始化
			$('#dateStar2').datetimepicker({
				language: 'zh-CN',
				autoclose: true,
				format: 'yyyy-mm-dd',
				minView: 'month',
				endDate: new Date()

			}).on("changeDate",function(ev){
				that.MaterialEquipmentOptions.startTime = ev.date.format("yyyy-MM-dd");
			});
		});

		this.$("#dateEnd2").one("mousedown",function() {
			//日期控件初始化
			$('#dateEnd2').datetimepicker({
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

	//显示隐藏搜索
	searchToggle(){
		var $searchDetail=this.$(".searchDetail");
		if ($searchDetail.is(":animated")) {
			return;
		}
		$searchDetail.slideToggle();
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
		 
	}



});