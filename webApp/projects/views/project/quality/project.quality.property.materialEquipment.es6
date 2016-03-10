//project.quality.property.materialEquipment.es6


//材料设备
App.Project.QualityMaterialEquipment=Backbone.View.extend({

	tagName:"div",

	className:"QualityMaterialEquipment",

	initialize:function(){
		this.listenTo(App.Project.QualityAttr.MaterialEquipmentCollection,"add",this.addOne);
	},


	events:{},


	//渲染
	render:function(){

		this.$el.html("正在加载，请稍候……");

		return this;

	},

	template:_.templateUrl("/projects/tpls/project/quality/project.quality.property.materialEquipment.html"),

	//获取数据后处理
	addOne:function(model){
		var data=model.toJSON();
		this.$el.html(this.template(data));
	}


});