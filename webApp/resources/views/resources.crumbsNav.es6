App.ResourceCrumbsNav = Backbone.View.extend({

	tagName: "div",

	className: "resourceCrumbsNav",

	events: {
		"click .resourcesList": "itemClick"
	},

	template: _.templateUrl('/resources/tpls/resources.crumbsNav.html'),

	render: function() {

		this.$el.html(this.template);

		return this;
	},

	//点击
	itemClick(event) {

		var $projectVersionList = $(event.target).closest('.resourcesList').find(".projectVersionList");
		//标准模型
		if (App.ResourceModel.Settings.type == "standardLibs") {

			App.Comm.ajax({
				URLtype: "fetchStandardLibs"
			}, function(data) {

				var detail = _.templateUrl("/resources/tpls/resources.crumbsNav.navDetail.html");
				$projectVersionList.find(".listResource").html(detail(data));
				$projectVersionList.show();
			});
		}

	}



});