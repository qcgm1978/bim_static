App.Projects.searchView = Backbone.View.extend({

	tagName: 'div',

	className: 'projectSearch',

	//
	events: {
		"click .seniorSearch": "seniorSearch"
	},

	template: _.templateUrl("/projects/tpls/project.search.html", true),


	render: function() {

		this.$el.html(this.template);
		//type=="my-backbone-fast" && this.$el.find(".fast").addClass('selected')|| this.$el.find(".msg").addClass('selected');
		return this;

	},

	//显示隐藏高级收缩
	seniorSearch: function() {
		
		var $advancedQueryConditions = this.$el.find(".advancedQueryConditions");
		if ($advancedQueryConditions.is(":hidden")) {
			this.$el.find(".quickSearch").hide();
			this.$el.find(".advancedQueryConditions").show();
			$("#projectModes").addClass("projectModesDown");
			//当前按钮添加事件
			this.$el.find(".seniorSearch").addClass('down');
			
		} else {
			this.$el.find(".quickSearch").show();
			this.$el.find(".advancedQueryConditions").hide();
			$("#projectModes").removeClass("projectModesDown");
			//当前按钮添加事件
			this.$el.find(".seniorSearch").removeClass('down');
		}
		this.$el.find(".seniorSearch i").toggleClass('icon-angle-down  icon-angle-up');

	}

});