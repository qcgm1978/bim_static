//project.cost.property.reference.es6

//陈本清单
App.Project.CostReference=Backbone.View.extend({

	tagName:"div",

	className:"CostReference",

	initialize:function(){
		this.listenTo(App.Project.CostAttr.ReferenceCollection,"add",this.addOne);
	},


	events:{},


	//渲染
	render:function(){

		this.$el.html("正在加载，请稍候……");
		
		return this;
	},

	template:_.templateUrl("/projects/tpls/project/cost/project.cost.property.reference.html"),

	//获取数据后处理
	addOne:function(model){
		var data=model.toJSON();
		this.$el.html(this.template(data));
	}


});