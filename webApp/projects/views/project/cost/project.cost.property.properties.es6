//project.cost.property.properties.es6

//陈本清单
App.Project.CostProperties=Backbone.View.extend({

	tagName:"div",

	className:"CostProperties",

	initialize:function(){
		this.listenTo(App.Project.CostAttr.PropertiesCollection,"add",this.addOne);
	},


	events:{},


	//渲染
	render:function(){

		this.$el.html("正在加载，请稍候……");

		return this;

	},

	template:_.templateUrl("/projects/tpls/project/cost/project.cost.property.properties.html"),

	//获取数据后处理
	addOne:function(model){
		var data=model.toJSON();
		this.$el.html(this.template(data));
	}


});