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
		this.listenTo(App.Services.ProjectCollection.ProjectMappingRuleCollection,"change",this.render);
		Backbone.on("modelChange",this.modelChange,this);
	},

	modelChange:function(){
		this.$(".nameBox").text();//写入名字
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
		var frame = new App.Services.MappingRuleWindow().render().el;
		this.ruleWindow(frame);

		App.Services.ProjectCollection.ProjectMappingRuleModelCollection.reset();
		App.Services.ProjectCollection.ProjectMappingRuleModelCollection.fetch({},function(response){});
	},
	//编辑模板
	editTpl:function(){
		/*<a href="#resources/artifactsMapRule/library"></a>*/
		//需要添加公共 参数，projectId
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
	},
	//弹窗
	ruleWindow:function(frame){
		//初始化窗口
		App.Services.maskWindow = new App.Comm.modules.Dialog({
			title:"请选择映射规则标准模板",
			width:600,
			height:500,
			isConfirm:false,
			isAlert:false,
			message:frame
		});
		$(".mod-dialog").css({"min-height": "545px"});
	}

});