"use strict";

App.Services.SystemCollection = {

	//分类列表
	CategoryCollection: new (Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),
		urlType: "servicesCategoryList",
		parse: function parse(response) {
			if (response.code == 0) {
				return response.data.items;
			}
		}
	}))(),

	//流程列表
	FlowCollection: new (Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),
		urlType: "servicesFlowList",
		parse: function parse(response) {
			if (response.code == 0) {
				if (response.data.length <= 0) {
					$("#systemContainer .flowListBody").html('<li class="loading">无数据</li>');
				}
				return response.data;
			}
		}
	}))(),

	ExtendAttrCollection: new (Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),
		urlType: "extendAttrList",
		parse: function parse(response) {
			if (response.code == 0) {
				if (response.data.length <= 0) {
					$("#systemContainer .extendAttrListBody").html('<li class="loading">无数据</li>');
				}
				return response.data;
			}
		}
	}))()

};