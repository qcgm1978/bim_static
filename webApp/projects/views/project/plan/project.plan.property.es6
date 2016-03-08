App.Project.ProjectPlanProperty = Backbone.View.extend({

	tagName: "div",

	className: "ProjectPlanPropertyContainer projectNav",

	template: _.templateUrl("/projects/tpls/project/plan/project.plan.nav.html", true),

	events: {
		"click .projectPlanNav .item": "navItemClick"
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
		$target.addClass('selected').siblings().removeClass('selected');

		if (type == "model") {
			//碰撞
			this.$el.find(".planModel").show().siblings().hide();
			
			App.Project.PlanAttr.PlanModelCollection.fetch();

		} else if (type == "analog") {
			//设计检查

			this.$el.find(".planAnalog").show().siblings().hide();
			App.Project.PlanAttr.PlanAnalogCollection.fetch();

		} else if (type == "publicity") {
			//属性

			this.$el.find(".planPublicity").show().siblings().hide();
			App.Project.PlanAttr.PlanPublicityCollection.fetch();

		} else if (type == "inspection") {
			//设计检查

			this.$el.find(".planInterest").show().siblings().hide();
			App.Project.PlanAttr.PlanInspectionCollection.fetch();

		} else if (type == "properties") {
			//属性

			this.$el.find(".planProperties").show().siblings().hide();
			App.Project.PlanAttr.PlanPropertiesCollection.fetch();

		}

	}


});


