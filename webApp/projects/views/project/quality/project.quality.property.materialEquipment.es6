//project.quality.property.materialEquipment.es6


//材料设备
App.Project.QualityMaterialEquipment=Backbone.View.extend({

	tagName:"div",

	className:"QualityMaterialEquipment",

	initialize:function(){
		this.listenTo(App.Project.QualityAttr.MaterialEquipmentCollection,"add",this.addOne);
	},


	events:{
		"click .searchToggle":"searchToggle",
		"click .clearSearch":"clearSearch"
	},


	//渲染
	render:function(){

		var tpl=_.templateUrl("/projects/tpls/project/quality/project.quality.property.materialEquipment.html",true);

		this.$el.html(tpl);

		this.bindEvent();

		return this;

	},

	//显示隐藏搜索
	searchToggle(){
		var $searchDetail=this.$(".searchDetail");
		if ($searchDetail.is(":animated")) {
			return;
		}
		$searchDetail.slideToggle();
	},

	//清空搜索条件
	clearSearch(){

	},

	//事件绑定
	bindEvent:function(){

		 this.$(".specialitiesOption").myDropDown();
		  this.$(".categoryOption").myDropDown();
		   this.$(".statusOption").myDropDown();
	},

	//绑定滚动条
	bindScroll(){

		var $materialequipmentListScroll=this.$(".materialequipmentListScroll");

		if ($materialequipmentListScroll.hasClass('mCustomScrollbar')){
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

	template:_.templateUrl("/projects/tpls/project/quality/project.quality.property.materialEquipment.body.html"),

	//获取数据后处理
	addOne:function(model){

		//移除重复监听
		if (this.$el.closest("body").length<=0) {
			this.remove();
		}
		 
		var data=model.toJSON();
		this.$(".tbMaterialequipmentBody tbody").html(this.template(data));

		this.bindScroll();

	}


});