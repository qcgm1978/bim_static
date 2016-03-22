
//设计属性 碰撞
App.Project.DesignCollisionDetail=Backbone.View.extend({

	tagName:"div",

	className:"designCollision",

	template:_.templateUrl("/projects/tpls/project/design/project.design.collDetail.html",true),

	render:function(){
		this.$el.html("");
		return this;
	},

  initialize:function(){
    this.listenTo(App.Project.DesignAttr.CollisionCollection,"add",this.addCollisionDetail);
  },

  addCollisionDetail:function(model){
    // 加载碰撞点列表
    var data=model.toJSON();
    this.$el.html(this.template)
    return this;
  }
});


