//属性 project.quality.property.properties.es6


//过程检查
App.Project.QualityProperties=Backbone.View.extend({

	tagName:"div",

	className:"QualityProperties",

	initialize:function(){
		this.listenTo(App.Project.QualityAttr.PropertiesCollection,"add",this.addOne);
	},


	events:{},


	//渲染
	render:function(){

		this.$el.html("正在加载，请稍候……");

		return this;

	},

	template:_.templateUrl("/projects/tpls/project/quality/project.quality.property.properties.html"),

	//获取数据后处理
	addOne:function(model){
		var data=model.toJSON();
		this.$el.html(this.template(data));
	}


});