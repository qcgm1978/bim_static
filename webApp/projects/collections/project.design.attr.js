/**
 * @require /projects/collections/Project.js
 */
App.Project.DesignAttr={

		// 碰撞collection
	CollisionCollection: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchDesignCollision"


	})),

	// 碰撞文件列表
	CollisionFloor: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchDesignFloor"

	})),

	// 碰撞构件列表
	CollisionCategory: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchDesignCategory"

	})),

	// 碰撞任务列表
	CollisionTaskList: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchDesignTaskList"


	})),

	// 碰撞任务列表
	CollisionTaskDetail: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchDesignTaskDetail"


	})),

		// 设计检查 collection
	CollisionList: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchDesignCollisionList"

	})),
		// 设计检查 collection
	VerificationCollection: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchDesignFileList"

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

		urlType:"fetchDesignProperties",

		parse:function(response){

			if (response.message == "success") {
                 return response;
             }
		}

	}))


}
