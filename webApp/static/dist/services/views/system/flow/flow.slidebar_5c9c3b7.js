"use strict";

//流程导航
App.Services.System.FolwSlideBar = Backbone.View.extend({

	tagName: "div",

	className: "folwSlideBar",

	//初始化
	initialize: function initialize() {
		this.listenTo(App.Services.SystemCollection.CategoryCollection, "add", this.addOne);
		this.listenTo(App.Services.SystemCollection.CategoryCollection, "reset", this.reset);
	},
	render: function render() {

		this.$el.html('<ul class="flowSliderUl"></ul>');

		var that = this;
		//获取数据
		App.Services.SystemCollection.CategoryCollection.reset();
		App.Services.SystemCollection.CategoryCollection.fetch({
			success: function success() {
				var $first = that.$(".flowSliderUl .item:first");

				if ($first.length > 0) {
					$first.click();
				} else {
					$(".folwContainer .flowListBody").html('<li class="loading">无数据</li>');
				}
			}
		});

		return this;
	},


	//新增
	addOne: function addOne(model) {

		var view = new App.Services.System.FolwSlideBarDetail({
			model: model
		});

		this.$(".flowSliderUl .loading").remove();

		this.$(".flowSliderUl").append(view.render().el);
	},


	//清空重新加载
	reset: function reset() {
		this.$(".flowSliderUl").html('<li class="loading">正在加载，请稍候……</li>');
	}
});