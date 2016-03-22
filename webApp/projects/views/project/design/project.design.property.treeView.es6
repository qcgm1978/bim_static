
//设计属性 碰撞
App.Project.DesignTreeView=Backbone.View.extend({

  tagName:"li",

  className:"itemNode",

  events:{},

  template:_.templateUrl("/projects/tpls/project/design/project.design.treeView.html"),

  render:function(){
    var model = this.model;
    this.$el.html(this.template(this.model));
    return this;
  }
})
