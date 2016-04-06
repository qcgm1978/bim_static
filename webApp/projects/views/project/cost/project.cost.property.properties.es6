//project.cost.property.properties.es6

//陈本清单
App.Project.CostProperties=Backbone.View.extend({

	tagName:"div",

	className:"CostProperties",

	initialize:function(){
		//this.listenTo(App.Project.CostAttr.PropertiesCollection,"add",this.addOne);
		this.listenTo(App.Project.DesignAttr.PropertiesCollection,"add",this.addOne);
	},


	events:{},


	//渲染
	render:function(){

		this.$el.html('<div class="nullTip">请选择构件</div>');

		return this;

	},

	template:_.templateUrl("/projects/tpls/project/design/project.design.property.properties.html"), 

	//获取数据后处理
	addOne:function(model){
		var data=model.toJSON().data;
		this.$el.html(this.template(data));
	}


});