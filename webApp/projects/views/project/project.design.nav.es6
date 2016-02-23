App.Project.ProjectDesignNav = Backbone.View.extend({

	tagName: 'div',

	id: 'projectDesignNav',

	events: {
		"click .item": "itemClick"
	},

	template: _.templateUrl('/projects/tpls/project/project.nav.html', true),

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
			App.Project.fetchFile();
		} else {
			$("#projectContainer .fileContainer").hide();
			$("#projectContainer .modelContainer").show();
			App.Project.fetchNav();
		} 

	}
});