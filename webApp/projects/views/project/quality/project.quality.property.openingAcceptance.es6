// 开业验收 project.quality.property.openingAcceptance.es6

//开业验收
App.Project.QualityOpeningAcceptance=Backbone.View.extend({

	tagName:"div",

	className:"QualityOpeningAcceptance",

	initialize:function(){
		this.listenTo(App.Project.QualityAttr.OpeningAcceptanceCollection,"add",this.addOne);
	},


	events:{},


	//渲染
	render:function(){

		this.$el.html("正在加载，请稍候……");

		return this;

	},

	template:_.templateUrl("/projects/tpls/project/quality/project.quality.property.openingAcceptance.html"),

	//获取数据后处理
	addOne:function(model){
		var data=model.toJSON();
		this.$el.html(this.template(data));
	}


});