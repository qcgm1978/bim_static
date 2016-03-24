App.Project.viewpointDetail = Backbone.View.extend({

  tagName: "li",

  className: "itemNode",
  events:{
    "contextmenu .item-content":"menu",
    "click .tree-text":"setCamera"
  },

  template:_.templateUrl('/projects/tpls/project/viewpoint/project.viewpoint.detail.html'),

  render: function() {
    this.$el.html(this.template(this.model));
    return this;
  },
  menu:function(event){
    var that = $(event.target),
        contextMenu = that.parents('.tree-view').find(".context-menu"),
        viewPointId = that.data('id'),
        index = that.closest('.itemNode').index();
    App.Project.Settings.viewPoint = this;
    contextMenu.css({
      left:100,
      top:(index+1)*22-34
    }).show();
    $('body').one('click',function(event){
      if(!$(event.target).is('.delete,.edit')){
        if(App.Project.Settings.viewPoint){
          $('.tree-view .context-menu').hide();
          delete App.Project.Settings.viewPoint;
        }
      }
    })
    event.preventDefault();
  },
  setCamera:function(event){
    var that = $(event.target),
        point = that.data('viewpoint');
    App.Project.Settings.Viewer.setCamera(point);
  }
});
