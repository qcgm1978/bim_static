//项目映射
App.Services.viewMappingRule= Backbone.View.extend({

	tagName:"div",

	className:"MappingRule",

	events:{
		'click .changeTpl':'changeTpl',
		'click .editTpl':'editTpl'
	},

	template:_.templateUrl('/services/tpls/project/index.mappingrule.html'),

	initialize(data){
		this.listenTo(App.Services.ProjectCollection.ProjectMappingRuleCollection,"change",this.render)
	},

	render(data){
		if(data){
			this.$el.html(this.template(this.model.toJSON()));
		}else{
			this.$el.html(this.template)
		}
		return this;
	},
	//修改模板
	changeTpl:function(){

	},
	//编辑模板
	editTpl:function(){
		/*<a href="#resources/artifactsMapRule/library"></a>*/
	},

	//获取数量自定义规则数量
	getSelfRule:function(){
		var data = {
			URLtype:"fetchServicesProjectMappingRuleCount",
			data:{
				projectId: this.projectId
			}
		};
		App.Comm.ajax();
	}

});