/**
 * @require /projects/collections/Project.js
 */
App.Project.QualityAttr = {

	// 材料设备  collection
	MaterialEquipmentCollection: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType: "fetchQualityMaterialEquipment"


	})),

	// 过程验收 collection
	ProcessAcceptanceCollection: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType: "fetchQualityProcessAcceptance"

	})),

	//过程检查
	ProcessCheckCollection: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType: "fetchQualityProcessCheck",

		parse: function(response) {
			if (response.message == "success") {
				return response.data;
			}
		}

	})),

	// 开业验收
	OpeningAcceptanceCollection: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType: "fetchQualityOpeningAcceptance",

		parse: function(response) {
			if (response.message == "success") {
				return response.data;
			}
		}

	})),


	//隐患
	ConcernsCollection: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType: "fetchQualityConcerns",

		parse: function(response) {
			if (response.message == "success") {
				return response.data;
			}
		}

	})),

	// 属性 collection
	PropertiesCollection: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType: "fetchQualityProperties",

		parse: function(response) {
			if (response.message == "success") {
				return response.data;
			}
		}

	}))


}