App.Project.leftNav = Backbone.View.extend({

	tagName: "div",

	className: "leftNav",

	events: {
		"click .item": "itemClick"
	},

	template: _.templateUrl('/projects/tpls/project/project.leftNav.html', true),


	render: function() {
		this.$el.html(this.template);
		return this;
	},

	//切换tab
	itemClick: function(event) {
		//切换选中项 返回type
		App.Project.Settings.fetchNavType = $(event.target).addClass("selected").siblings().removeClass("selected").end().data("type");
		if (App.Project.Settings.fetchNavType == "file") {

			//切换导航tab
			$("#projectContainer").find(".projectFileNavContent").show(); 
			$("#projectContainer").find(".projectModelNavContent").hide();

			//导航内容
			$("#projectContainer .fileContainer").show();
			$("#projectContainer .modelContainer").hide();


		} else {

				//切换导航tab
			$("#projectContainer").find(".projectFileNavContent").hide(); 
			$("#projectContainer").find(".projectModelNavContent").show();

			//导航内容
			$("#projectContainer .fileContainer").hide();
			$("#projectContainer .modelContainer").show();
			$("#projectDesignContent .modelContainer").html("无数据");
			// new BIM({
			// 	element: $("#projectDesignContent .modelContainer")[0],
			// 	projectId: 'n4',
			// 	tools: true
			// });
		}
	}


});