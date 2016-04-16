//project.cost.property.reference.es6

//陈本清单
App.Project.CostReference=Backbone.View.extend({

	tagName:"div",

	className:"CostReference",

	initialize:function(){
		this.listenTo(App.Project.CostAttr.ReferenceCollection,"add",this.addOne);
		this.listenTo(App.Project.CostAttr.ReferenceCollection,"reset",this.reset);
	},


	events:{},


	//渲染
	render:function(){
		var page=_.templateUrl("/projects/tpls/project/cost/project.cost.property.reference.html",true);
		this.$el.html(page); 
		return this;
	},

	template:_.templateUrl("/projects/tpls/project/cost/project.cost.property.reference.detail.html"),

	//获取数据后处理
	addOne:function(model){
		var data=model.toJSON();
		this.$(".tbReference tbody").html(this.template(data)); 
	},

	reset(){
		this.$(".tbReference tbody").html(App.Project.Settings.loadingTpl); 
	}


});
