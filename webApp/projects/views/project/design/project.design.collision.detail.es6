
//设计属性 碰撞
App.Project.DesignCollisionDetail=Backbone.View.extend({

	tagName:"div",

	className:"designCollision",

  events:{
    "click tr":"setCollisionPoint"
  },

	template:_.templateUrl("/projects/tpls/project/design/project.design.collision.detail.html"),

  initialize:function(){
    this.listenTo(App.Project.DesignAttr.CollisionTaskDetail,"add",this.addCollisionDetail);
  },

  render:function(){
    this.$el.html("");
    return this;
  },

  addCollisionDetail:function(model){
    // 加载碰撞点列表
    var data=model.toJSON();
    if(data.message=="success"){
      this.prePage = data.data.page.prePage;
      this.next = data.data.page.nextPage;
    }
    this.$el.html(this.template(data))
    return this;
  },

  setCollisionPoint:function(event){
    var that = $(event.target).closest("tr");
    that.toggleClass("selected").siblings().removeClass("selected");
  }
});


