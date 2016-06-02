/**
 * @require /projects/collections/Project.js
 */
App.Project.PlanAttr={

    // 模型  collection
	PlanModelCollection: new(Backbone.Collection.extend({
	 
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchPlanModel"


	})),

	// 模拟 collection
	PlanAnalogCollection: new(Backbone.Collection.extend({
	 
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchPlanAnalog"
	})),

	//关注
    PlanPublicityCollection: new(Backbone.Collection.extend({
	 
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		srcUrl:'http://10.199.200.219:8010/api/BIM/CurrentDateStartAndEndForProject/{type}/{projectCode}'
		 
	})),

	  PlanPublicityCollectionMonth: new(Backbone.Collection.extend({
	 
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchPlanPublicity",

		 

	})),

	// 检验
    PlanInspectionCollection: new(Backbone.Collection.extend({
	 
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchPlanInspection"

	})),

	 fetchPlanInspectionCate: new(Backbone.Collection.extend({
	 
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchPlanInspectionCate"
 

	})),


		// 属性 collection
	PlanPropertiesCollection: new(Backbone.Collection.extend({
	 
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchDesignProperties",

		parse:function(response){
			if (response.message == "success") {
                 return response;
             }
		}

	}))


}