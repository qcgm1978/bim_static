App.Project.ProjectDesignPropety = Backbone.View.extend({

	tagName: "div",

	className: "designPropetyBox",

	template: _.templateUrl("/projects/tpls/project/design/project.design.propety.html"),

	events: {
		"click .projectPropetyHeader .item": "navItemClick"
		
	},

	render: function() {
		this.$el.html(this.template);
		this.$el.find(".projectNavContentBox").append(new App.Project.DesignCollision().render().el);
		this.$el.find(".projectNavContentBox").append(new App.Project.DesignVerification().render().el);
		this.$el.find(".projectNavContentBox").append(new App.Project.DesignProperties().render().el);
		return this;
	},

	//切换tab
	navItemClick: function(event) {
		var $target = $(event.target),
			type = $target.data("type");
		$target.addClass('selected').siblings().removeClass('selected');
		App.Project.Settings.property = type;


		if (type == "collision") {
			//碰撞
			this.$el.find(".detailList").show().siblings().hide();

		} else if (type == "verifi") {
			//设计检查

			this.$el.find(".designVerification").show().siblings().hide();
			App.Project.DesignAttr.VerificationCollection.fetch();

		} else if (type == "poperties") {
			//属性

			this.$el.find(".designProperties").show().siblings().hide();

			//属性渲染
			App.Project.renderProperty();

		}


	}

	


});
