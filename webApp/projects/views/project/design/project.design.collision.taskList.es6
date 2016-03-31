
//设计属性 碰撞
App.Project.DesignCollisionTaskList=Backbone.View.extend({

  tagName:"div",

  className:"collSelect",

  template:_.templateUrl("/projects/tpls/project/design/project.design.collision.taskList.html"),

  initialize:function(){
    this.listenTo(App.Project.DesignAttr.CollisionTaskList,"add",this.addList);
  },

  render:function(){
    this.$el.html('<p class="tips">加载中...</p>');
    return this;
  },

  addList:function(model){
    // 加载碰撞点列表
    var data=model.toJSON();
    if(data.data.length == 0){
      return false;
    }else{
      this.$el.html(this.template(data))
      return this;
    }
  }

});
