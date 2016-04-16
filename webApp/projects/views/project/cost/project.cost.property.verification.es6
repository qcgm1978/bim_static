//project.cost.property.verification.es6

 

//陈本清单
App.Project.CostVerification=Backbone.View.extend({

	tagName:"div",

	className:"CostVerification",

	initialize:function(){
		this.listenTo(App.Project.CostAttr.VerificationCollection,"add",this.addOne);
		this.listenTo(App.Project.CostAttr.VerificationCollection,"reset",this.reset);

		this.listenTo(App.Project.CostAttr.VerificationCollectionCate,"add",this.addOneCate);
		this.listenTo(App.Project.CostAttr.VerificationCollectionCate,"reset",this.resetCate);
	},


	events:{},


	//渲染
	render:function(){
		var page=_.templateUrl("/projects/tpls/project/cost/project.cost.property.verification.html",true);
		this.$el.html(page); 
		return this;

	}, 

	//获取数据后处理
	addOne:function(model){
		var template=_.templateUrl("/projects/tpls/project/cost/project.cost.property.verification.detail.html"),
		 data=model.toJSON();
		this.$el.html(template(data));
	},

	addOneCate(){
		var template=_.templateUrl("/projects/tpls/project/cost/project.cost.property.verification.detail.cate.html"),
		 data=model.toJSON();
		this.$el.html(template(data));
	},

	resetCate(){
		this.$(".tbVerificationCate tbody").html(App.Project.Settings.loadingTpl);
	},

	reset(){
		this.$(".tbTop tbody").html(App.Project.Settings.loadingTpl);
	}


});