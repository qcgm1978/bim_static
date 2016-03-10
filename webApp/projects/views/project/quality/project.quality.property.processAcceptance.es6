//project.quality.property.processAcceptance.es6 过程验收

//过程验收
App.Project.QualityProcessAcceptance=Backbone.View.extend({

	tagName:"div",

	className:"QualityProcessAcceptance",

	initialize:function(){
		this.listenTo(App.Project.QualityAttr.ProcessAcceptanceCollection,"add",this.addOne);
	},


	events:{},


	//渲染
	render:function(){

		this.$el.html("正在加载，请稍候……");

		return this;

	},

	template:_.templateUrl("/projects/tpls/project/quality/project.quality.property.processAcceptance.html"),

	//获取数据后处理
	addOne:function(model){
		var data=model.toJSON();
		this.$el.html(this.template(data));
	}


});