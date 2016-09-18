"use strict";

App.Flow = App.Flow || {};

App.Flow.NavView = Backbone.View.extend({

	tagName: "ul",

	className: "flowTabNav",

	template: _.templateUrl("/flow/tpls/flow.nav.html", true),

	events: {
		'click .flowTabItem': 'switchModel'
	},

	initialize: function initialize() {
		this.listenTo(App.Flow.Controller.flowNavCollection, 'reset', this.load);
	},
	switchModel: function switchModel(e) {
		var $target = $(e.currentTarget);
		if (!$target.hasClass('itemSelected')) {
			$('.itemSelected').removeClass('itemSelected');
			$target.addClass('itemSelected');
			var id = $target.data('id');
			this.$("#flowMoreBtn a").attr('href', $target.data('link'));
			this.loadContent(id);
		}
	},


	load: function load(m) {
		var data = m.toJSON()[0];
		var _html = _.template(this.template);
		this.$el.html(_html(data));
		$("#flowTabNavContainer").html(this.$el);
		this.loadContent(data.data[0].id);
		return this;
	},

	loadContent: function loadContent(id) {
		App.Flow.Controller.flowCollection.phaseId = id;
		App.Flow.Controller.flowCollection.fetch({
			reset: true
		});
	}
});