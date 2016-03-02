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
			//添加样式
			$("#projectContainer").find(".rightProperty").removeClass("showPropety").end().find(".projectCotent").removeClass("showPropety");

			//拖拽和收起
			$("#projectContainer .leftNav").find(".slideBar").hide().end().find(".dragSize").hide();

			//切换时记录大小
			var $projectCotent = $("#projectContainer .projectCotent"),
				mRight = $projectCotent.css("margin-right");
			$projectCotent.css("margin-right", 0);
			$projectCotent.data("mRight", mRight);



		} else {
			//切换导航tab
			$("#projectContainer").find(".projectFileNavContent").hide();
			$("#projectContainer").find(".projectModelNavContent").show();
			//导航内容
			$("#projectContainer .fileContainer").hide();
			$("#projectContainer .modelContainer").show();

			//拖拽和收起
			$("#projectContainer .leftNav").find(".slideBar").show().end().find(".dragSize").show();

			var $projectCotent = $("#projectContainer .projectCotent"),
				mRight = $projectCotent.data("mRight");
			if (mRight) {
				$projectCotent.css("margin-right", mRight);
			}

			$("#projectContainer").find(".projectModelNavContent .mCS_no_scrollbar_y").width(800);
			//渲染模型属性
			App.Project.renderModelContentByType();
			// new BIM({
			// 	element: $("#projectDesignContent .modelContainer")[0],
			// 	projectId: 'n4',
			// 	tools: true
			// });
		}

	}



});