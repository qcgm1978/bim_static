// 隐患 project.quality.property.concerns.es6 
 


//隐患
App.Project.QualityConcerns=Backbone.View.extend({

	tagName:"div",

	className:"QualityConcerns",

	initialize:function(){
		this.listenTo(App.Project.QualityAttr.ConcernsCollection,"add",this.addOne);
	},


	events:{},


	//渲染
	render:function(){

		this.$el.html("正在加载，请稍候……");

		return this;

	},

	template:_.templateUrl("/projects/tpls/project/quality/project.quality.property.concerns.html"),

	//获取数据后处理
	addOne:function(model){
		var data=model.toJSON();
		this.$el.html(this.template(data));
	}


});