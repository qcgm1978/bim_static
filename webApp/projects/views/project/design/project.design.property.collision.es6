
//设计属性 碰撞
App.Project.DesignCollision=Backbone.View.extend({

	tagName:"div",

	className:"designCollision",

	initialize:function(){
		this.listenTo(App.Project.DesignAttr.CollisionCollection,"add",this.addOne);
	},

	render:function(){ 
		return this;
	}

});

 