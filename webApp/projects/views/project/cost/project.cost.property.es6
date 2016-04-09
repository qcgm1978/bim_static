
App.Project.ProjectCostProperty=Backbone.View.extend({

	tagName:"div",

	className:"ProjectCostPropetyContainer",

	template:_.templateUrl("/projects/tpls/project/cost/project.cost.property.html",true),

	events:{
		"click .projectCostNav .item":"navClick"
	},

	render:function(){ 

		this.$el.html(this.template);
		this.$el.find(".planContainer").append(new App.Project.CostReference().render().el);
		this.$el.find(".planContainer").append(new App.Project.CostVerification().render().el); 
		this.$el.find(".planContainer").append(new App.Project.CostChange().render().el);
		this.$el.find(".planContainer").append(new App.Project.CostProperties().render().el);

		return this;
	},

	navClick:function(event){
		var $target = $(event.target),
			type = $target.data("type");
		$target.addClass('selected').siblings().removeClass('selected'); 
		App.Project.Settings.property = type;

		if (type == "reference") {
			//清单
			this.$el.find(".CostReference").show().siblings().hide();

			App.Project.CostAttr.ReferenceCollection.projectId=App.Project.Settings.projectId;
			App.Project.CostAttr.ReferenceCollection.projectVersionId=App.Project.Settings.CurrentVersion.id; 
			App.Project.CostAttr.ReferenceCollection.fetch();

		} else if (type == "change") {
			//变更
			this.$el.find(".CostChange").show().siblings().hide();
			App.Project.CostAttr.ChangeCollection.fetch({
				data:{
					projectId:App.Project.Settings.projectId
				}
			});

		} else if (type == "verification") {
			//检查
			this.$el.find(".CostVerification").show().siblings().hide();
			App.Project.CostAttr.VerificationCollection.fetch();

		}  else if (type == "poperties") {
			//属性
			this.$el.find(".CostProperties").show().siblings().hide();
			//属性渲染
			App.Project.renderProperty();

		}
	}

});