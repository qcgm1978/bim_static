'use strict';

App.INBox = App.INBox || {};
App.INBox.imboxListView = Backbone.View.extend({

	template: _.templateUrl('./imbox/tpls/container.html', true),

	initialize: function initialize() {
		//  this.listenTo(App.IMBox.messageCollection,"reset",this.renderData);
	},

	render: function render() {
		this.$el.html(this.template);
		return this;
	},
	renderData: function renderData(item) {}
});