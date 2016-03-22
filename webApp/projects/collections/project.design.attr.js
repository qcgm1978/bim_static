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
	CollisionFilesList: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchDesignFileList"


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
