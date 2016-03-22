App.Project.ProjectDesignSetting= Backbone.View.extend({

  tagName:"div",

  className:"designCollSetting",

  events: {
    "click .itemContent":"openTree"
  },

  template:_.templateUrl("/projects/tpls/project/design/project.design.property.collSetting.html",true),

  initialize:function(){
    this.listenTo(App.Project.DesignAttr.CollisionFilesList,"add",this.addFilesList);
  },

  render:function(){
    this.$el.html(this.template);
    return this;
  },

  addFilesList:function(model){
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
