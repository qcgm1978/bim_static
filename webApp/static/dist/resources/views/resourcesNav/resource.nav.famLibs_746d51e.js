"use strict";

App.ResourcesNav.FamLibs = Backbone.View.extend({

	tagName: "div",

	id: "famLibs",

	template: _.templateUrl("/resources/tpls/resourcesNav/resource.nav.standardlibs.html"),

	//初始化
	initialize: function initialize() {
		this.listenTo(App.ResourcesNav.FamLibsCollection, "add", this.addOne);
		this.listenTo(App.ResourcesNav.FamLibsCollection, "reset", this.emptyContent);
		Backbone.on('FamlibNullData', this.nullData, this);
	},


	render: function render() {
		this.$el.html(this.template());
		return this;
	},

	templateDetail: _.templateUrl("/resources/tpls/resourcesNav/resource.nav.standardlibs.detail.html"),

	//添加单个
	addOne: function addOne(model) {

		var $standar = this.$el.find(".standarBody .standar"),
		    $loading = $standar.find(".loading");

		if ($loading.length > 0) {
			$loading.remove();
		}
		var data = model.toJSON();

		$standar.append(this.templateDetail(data));
	},


	//清空内容
	emptyContent: function emptyContent() {
		this.$el.find(".standarBody .standar").html(' <li class="loading">正在加载，请稍候……</li>');
	},
	nullData: function nullData() {
		this.$el.find(".standarBody .standar").html('<li class="loading"><img src="/static/dist/images/projects/images/emptyProject.png"><div>暂无可访问族库</div></li>');
	}
});