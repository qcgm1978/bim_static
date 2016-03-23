App.Project.CollisionFloor= Backbone.View.extend({

  tagName:"select",

  className:"labelInput",

  events: {
    "change":"getCategory"
  },

  template:_.templateUrl("/projects/tpls/project/design/project.design.collision.floor.html"),

  initialize:function(){
    this.listenTo(App.Project.DesignAttr.CollisionFloor,"add",this.addFloor);
  },

  render:function(){
    this.$el.html("<option value='0'>没有楼层</option>");
    return this;
  },

  addFloor:function(model){
    var data = model.toJSON();
    this.$el.html(this.template(data))
    return this;
  },

  getCategory:function(event){
    floor = $(event.target).val();
    App.Project.DesignAttr.CollisionCategory.projectId = 793465949626592//App.Project.Settings.projectId;
    App.Project.DesignAttr.CollisionCategory.floor = floor;
    App.Project.DesignAttr.CollisionCategory.fetch();
  }
});
