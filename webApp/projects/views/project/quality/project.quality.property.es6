App.Project.ProjectQualityProperty=Backbone.View.extend({

	tagName:"div",

	className:"ProjectQualityNavContainer",

	template:_.templateUrl("/projects/tpls/project/quality/project.quality.property.html",true),

	events:{
		"click .projectQualityNav .item":"navClick"
	},

	render:function(){

		this.$el.html(this.template);

		this.$el.find(".qualityContainer").append(new App.Project.QualityMaterialEquipment().render().el); 
		this.$el.find(".qualityContainer").append(new App.Project.QualityProcessAcceptance().render().el);
		this.$el.find(".qualityContainer").append(new App.Project.QualityProcessCheck().render().el);
		this.$el.find(".qualityContainer").append(new App.Project.QualityOpeningAcceptance().render().el);
		this.$el.find(".qualityContainer").append(new App.Project.QualityConcerns().render().el);
		this.$el.find(".qualityContainer").append(new App.Project.QualityProperties().render().el);

		return this;
	},

	//切换tab
	navClick:function(event){
		var $target = $(event.target),
			type = $target.data("type");
		$target.addClass('selected').siblings().removeClass('selected'); 
			App.Project.Settings.property = type;

		if (type == "materialequipment") {
			//材料设备
			this.$el.find(".QualityMaterialEquipment").show().siblings().hide();
			
			App.Project.QualityAttr.MaterialEquipmentCollection.fetch();

		} else if (type == "processacceptance") {
			//过程验收
			this.$el.find(".QualityProcessAcceptance").show().siblings().hide();
			App.Project.QualityAttr.ProcessAcceptanceCollection.fetch();

		} else if (type == "processcheck") {
			//过程检查
			this.$el.find(".QualityProcessCheck").show().siblings().hide();
			App.Project.QualityAttr.ProcessCheckCollection.fetch();

		}  else if (type == "openingacceptance") {
			//开业验收
			this.$el.find(".QualityOpeningAcceptance").show().siblings().hide();
			App.Project.QualityAttr.OpeningAcceptanceCollection.fetch();

		}else if (type == "concerns") {
			//隐患
			this.$el.find(".QualityConcerns").show().siblings().hide();
			App.Project.QualityAttr.ConcernsCollection.fetch();

		}else if (type == "poperties") {
			//属性
			this.$el.find(".QualityProperties").show().siblings().hide();
			//属性渲染
			App.Project.renderProperty();

		}
	}


});