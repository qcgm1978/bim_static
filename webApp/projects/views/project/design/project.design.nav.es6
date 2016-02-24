App.Project.ProjectDesignNav = Backbone.View.extend({

	tagName: 'div',

	id: 'projectDesignNav',

	events: {
		"click .item": "itemClick"
	},

	template: _.templateUrl('/projects/tpls/project/design/project.design.nav.html', true),

	render: function() {
		this.$el.html(this.template);
		return this;
	},

	itemClick: function(event) {
		//切换选中项 返回type
		App.Project.Settings.fetchNavType = $(event.target).addClass("selected").siblings().removeClass("selected").end().data("type");
		if (App.Project.Settings.fetchNavType == "file") {
			$("#projectContainer .fileContainer").show();
			$("#projectContainer .modelContainer").hide();
			App.Project.fetchDesignFileNav();
		} else {
			$("#projectContainer .fileContainer").hide();
			$("#projectContainer .modelContainer").show();
			App.Project.fetchDesignModelNav();
			new BIM({
				element: $("#projectDesignContent .modelContainer")[0],
				projectId: 'n4',
				tools: true
			});
		}


	}
});