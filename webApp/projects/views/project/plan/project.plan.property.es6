App.Project.ProjectPlanProperty = Backbone.View.extend({

	tagName: "div",

	className: "ProjectPlanPropertyContainer",

	template: _.templateUrl("/projects/tpls/project/plan/project.plan.nav.html", true),

	events: {
		"click .projectPlanNav .item": "navItemClick",
		"change .selDate":"changeDate"
	},

	render: function() {

		this.$el.html(this.template);
		this.$el.find(".planContainer").append(new App.Project.PlanModel().render().el); //模块化
		this.$el.find(".planContainer").append(new App.Project.PlanAnalog().render().el); //模拟
		this.$el.find(".planContainer").append(new App.Project.PlanPublicity().render().el); //关注
		this.$el.find(".planContainer").append(new App.Project.PlanInspection().render().el); //效验
		this.$el.find(".planContainer").append(new App.Project.PlanProperties().render().el); //属性
		return this;
	},

	//切换导航
	navItemClick: function(event) {

		var $target = $(event.target),
			type = $target.data("type");
		$target.addClass('selected').siblings().removeClass('selected'),
		projectId=App.Project.Settings.projectId,
		projectVersionId=App.Project.Settings.CurrentVersion.id;
		 
		App.Project.Settings.property = type;

		if (type == "model") {
			//碰撞
			this.$el.find(".planModel").show().siblings().hide();
			App.Project.PlanAttr.PlanModelCollection.projectId=projectId;
			App.Project.PlanAttr.PlanModelCollection.projectVersionId=projectVersionId; 
			App.Project.PlanAttr.PlanModelCollection.fetch();

		} else if (type == "analog") {
			//设计检查

			this.$el.find(".planAnalog").show().siblings().hide();
			App.Project.PlanAttr.PlanAnalogCollection.fetch();

		} else if (type == "publicity") {
			//属性

			this.$el.find(".planPublicity").show().siblings().hide();
			//计划关注列表
			this.loadPublicityData(projectId,projectVersionId); 

		} else if (type == "inspection") {
			//设计检查

			this.$el.find(".planInterest").show().siblings().hide();
			App.Project.PlanAttr.PlanInspectionCollection.fetch();

		} else if (type == "poperties") {
			//属性

			this.$el.find(".planProperties").show().siblings().hide();
		 	//属性渲染
			App.Project.renderProperty();

		}

	},

	//改变时间 
	changeDate(event){
		 
		var isEnd=$(event.target).val()!=1 && true || false;
		this.loadPublicityData(App.Project.Settings.projectId,App.Project.Settings.CurrentVersion.id,isEnd);
	},

	//加载计划关注列表
	loadPublicityData(projectId,projectVersionId,isEnd){

		var weekType=1,monthType=2;
		if (isEnd) {
			weekType=3;
			monthType=4;
		}

		App.Project.PlanAttr.PlanPublicityCollection.reset(); 
			App.Project.PlanAttr.PlanPublicityCollection.projectId=projectId;
			App.Project.PlanAttr.PlanPublicityCollection.projectVersionId=projectVersionId; 

			App.Project.PlanAttr.PlanPublicityCollection.fetch({
				data:{
					queryType:weekType
				}
			}); 
			
			App.Project.PlanAttr.PlanPublicityCollectionMonth.reset();
			App.Project.PlanAttr.PlanPublicityCollectionMonth.projectId=projectId;
			App.Project.PlanAttr.PlanPublicityCollectionMonth.projectVersionId=projectVersionId; 

			App.Project.PlanAttr.PlanPublicityCollectionMonth.fetch({
				data:{
					queryType:monthType
				}
			});
	}


});


