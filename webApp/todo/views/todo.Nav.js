App.Todo.NavView = Backbone.View.extend({

	tagName: 'div',

	className: 'todoNav',

	//代办
	events: {
		'click .already': 'already', //已办
		'click .commission': 'commission' //代办
	},

	//已办
	commission: function() {
		$(".todoNav .commission").addClass("selected");
		$(".todoNav .already").removeClass("selected");

		//显示并清空
		$("#content").find(".alreadyBox").hide().end().find(".commissionBox").show().find(".commissionLists").empty();

		App.Todo.Settings.type = "commission";
		App.Todo.fetch();
	},

	already: function() {
		$(".todoNav .already").addClass("selected");
		$(".todoNav .commission").removeClass("selected");
		//显示并清空
		$("#content").find(".commissionBox").hide().end().find(".alreadyBox").show().find(".alreadyLists").empty();
		App.Todo.Settings.type = "already";
		App.Todo.fetch("complete");
	},

	template:_.templateUrl("./todo/tpls/todo.Nav.html",true),


	render: function() {

		this.$el.html(this.template);
		//type=="my-backbone-fast" && this.$el.find(".fast").addClass('selected')|| this.$el.find(".msg").addClass('selected');
		return this;

	}

});