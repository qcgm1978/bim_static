"use strict";

/**
 * @require projects/collections/Project.es6
 */
App.Project.PlanAttr = {

	// 模型  collection
	PlanModelCollection: new (Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),

		urlType: "fetchPlanModel"

	}))(),

	// 模拟 collection
	PlanAnalogCollection: new (Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),

		urlType: "fetchPlanAnalog"
	}))(),

	//关注
	PlanPublicityCollection: new (Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),

		urlType: "fetchPlanPublicity"
	}))(),

	PlanPublicityCollectionMonth: new (Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),

		urlType: "fetchPlanPublicity"

	}))(),

	// 检验
	PlanInspectionCollection: new (Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),

		urlType: "fetchPlanInspection"

	}))(),

	fetchPlanInspectionCate: new (Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),

		urlType: "fetchPlanInspectionCate"

	}))(),

	// 属性 collection
	PlanPropertiesCollection: new (Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),

		urlType: "fetchDesignProperties",

		parse: function parse(response) {
			if (response.message == "success") {
				return response;
			}
		}

	}))()

};