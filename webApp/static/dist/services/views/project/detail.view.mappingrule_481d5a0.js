"use strict";

//项目映射
App.Services.viewMappingRule = Backbone.View.extend({

	tagName: "div",

	className: "MappingRule",

	events: {
		'click .changeTpl': 'changeTpl',
		'click .editSelf': 'editSelf'
	},

	template: _.templateUrl('/services/tpls/project/index.mappingrule.html'),

	initialize: function initialize(model) {
		//this.listenTo(App.Services.ProjectCollection.ProjectMappingRuleCollection,"add",this.addData);
		this.model = model;
		Backbone.on("modelChange", this.modelChange, this);
	},


	modelChange: function modelChange() {
		this.$(".nameBox").text(); //写入名字
	},

	render: function render() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},


	//修改模板
	changeTpl: function changeTpl() {
		var frame = new App.Services.MappingRuleWindow().render().el;
		this.ruleWindow(frame);

		App.Services.ProjectCollection.ProjectMappingRuleModelCollection.reset();
		App.Services.ProjectCollection.ProjectMappingRuleModelCollection.fetch({}, function (response) {});
	},
	//编辑模板
	editSelf: function editSelf() {
		if (App.Services.ProjectMappingRuleId) {
			window.location.href = "#services/project/" + App.Services.ProjectMappingRuleId;
		}
	},
	//获取数量自定义规则数量
	getSelfRule: function getSelfRule() {
		var data = {
			URLtype: "fetchServicesProjectMappingRuleCount",
			data: {
				projectId: App.Services.ProjectMappingRuleId
			}
		};
		App.Comm.ajax(data, function (response) {
			console.log(response);
		});
	},
	//弹窗
	ruleWindow: function ruleWindow(frame) {
		//初始化窗口
		App.Services.maskWindow = new App.Comm.modules.Dialog({
			title: "请选择映射规则标准模板",
			width: 600,
			height: 500,
			isConfirm: false,
			isAlert: false,
			message: frame
		});
		$(".mod-dialog").css({ "min-height": "545px" });
	}

});