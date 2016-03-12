
//设计属性 碰撞
App.Project.DesignCollision=Backbone.View.extend({

	tagName:"div",

	className:"designCollision",

	initialize:function(){
		this.listenTo(App.Project.DesignAttr.CollisionCollection,"add",this.addOne);
	},

	template:_.templateUrl("/projects/tpls/project/design/project.design.property.collision.html"),

	render:function(){ 
		this.$el.html("");
		return this;
	},

	//添加数据
	addOne:function(model){ 
		var data=model.toJSON();
		this.$el.html(this.template(data));
	}

});

 