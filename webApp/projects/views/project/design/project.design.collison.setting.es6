App.Project.ProjectDesignSetting= Backbone.View.extend({

  tagName:"div",

  className:"designCollSetting",

  events: {
    "click .itemContent":"openTree"
  },

  template:_.templateUrl("/projects/tpls/project/design/project.design.collision.setting.html",true),

  render:function(){
    this.$el.html(this.template);
    this.$el.find("#addFloor").append(new App.Project.CollisionFloor().render().el);
    App.Project.DesignAttr.CollisionFloor.fetch();
    return this;
  },

  addCategory:function(model){
    var that = this;
    var data = model.toJSON().data;
    var tree = this.$el.find(".treeView");
    that.renderModel(data,tree);
    return this;
  },
  renderModel:function(data,element){
    var that = this;
    _.forEach(data,function(model){
      var view = new App.Project.DesignTreeView({
        model:model
      });
      element.append(view.render().el);
    });
  },
  openTree:function(event){
    $(event.target).closest(".itemContent").toggleClass("open");
  }
});
