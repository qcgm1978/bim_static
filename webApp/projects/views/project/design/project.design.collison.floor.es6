App.Project.CollisionFloor= Backbone.View.extend({

  tagName:"select",

  className:"labelInput",

  events: {
    "change":"getCategory"
  },

  template:_.templateUrl("/projects/tpls/project/design/project.design.collision.floor.html",true),

  initialize:function(){
    this.listenTo(App.Project.DesignAttr.CollisionFloor,"add",this.addCategory);
  },

  render:function(){
    this.$el.html("<option value='0'>没有楼层</option>");
    return this;
  },

  addCategory:function(model){
    var data = model.toJSON();
    this.$el.html(this.template(this.model))
    return this;
  }
});
