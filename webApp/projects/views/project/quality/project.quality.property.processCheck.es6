//project.quality.property.processCheck.es6  过程检查

//过程检查
App.Project.QualityProcessCheck=Backbone.View.extend({

	tagName:"div",

	className:"QualityProcessCheck",

	initialize:function(){
		this.listenTo(App.Project.QualityAttr.ProcessCheckCollection,"add",this.addOne);
	},


	events:{},


	//渲染
	render:function(){

		this.$el.html("正在加载，请稍候……");

		return this;

	},

	template:_.templateUrl("/projects/tpls/project/quality/project.quality.property.processCheck.html"),

	//获取数据后处理
	addOne:function(model){
		var data=model.toJSON();
		this.$el.html(this.template(data));
	}


});