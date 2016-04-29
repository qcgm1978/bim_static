//列表详情
App.Services.System.ExtendAttrContainerListDetail = Backbone.View.extend({

	tagName: "li",

	className: "item",

	//初始化
	initialize() {
		this.listenTo(this.model, "change", this.update);
	},

	template: _.templateUrl("/services/tpls/system/flow/flow.container.list.detail.html"),

	render() {
		
		var data = this.model.toJSON(),
			html = this.template(data);

		this.$el.html(html);

		return this;

	},

	//更新
	update() {

	}



});