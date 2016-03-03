/**
 * @require /projects/collections/Project.js
 */
App.Project.DesignAttr={

		// 碰撞collection
	CollisionCollection: new(Backbone.Collection.extend({
		url: "/dataJson/project/project.design.json?a=1",
		debugUrl: "/dataJson/project/project.design.json",
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		})

	})),

		// 设计检查 collection
	VerificationCollection: new(Backbone.Collection.extend({
		url: "/dataJson/project/project.design.json?a=1",
		debugUrl: "/dataJson/project/project.design.json",
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		})

	})),

		// 属性 collection
	PropertiesCollection: new(Backbone.Collection.extend({
		url: "/dataJson/project/project.design.json?a=1",
		debugUrl: "/dataJson/project/project.design.json",
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		})

	}))


}