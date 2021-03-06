//流程导航
App.Services.System.ExtendAttrSlideBar = Backbone.View.extend({

	tagName: "div",

	className: "extendAttrSlideBar folwSlideBar",

	//初始化
	initialize() {
		this.listenTo(App.Services.SystemCollection.CategoryCollection, "add", this.addOne);
		this.listenTo(App.Services.SystemCollection.CategoryCollection, "reset", this.reset);
	},

	render() {


		this.$el.html('<ul class="extendAttrSliderUl flowSliderUl"></ul>');

		var that = this;
		//获取数据
		App.Services.SystemCollection.CategoryCollection.reset();
		App.Services.SystemCollection.CategoryCollection.fetch({
			success: function() { 
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
	addOne(model) {

		var view = new App.Services.System.extendAttrSlideBarDetail({
			model: model
		});
		this.$(".flowSliderUl .loading").remove();

		this.$(".flowSliderUl").append(view.render().el);

	},

	//清空重新加载
	reset() {
		this.$(".flowSliderUl").html('<li class="loading">正在加载，请稍候……</li>');
	}


});