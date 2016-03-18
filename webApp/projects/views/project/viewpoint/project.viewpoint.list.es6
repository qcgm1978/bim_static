
App.Project.viewpoint=Backbone.View.extend({

  tagName: "ul",

  className: "tree-view",

  events: {
    "click .nodeSwitch": "openTree",
    "click .delete":"deleteViewpoint",
    "click .edit":"editViewpoint"
  },

  template:_.templateUrl('/projects/tpls/project/viewpoint/project.viewpoint.html',true),

  initialize:function(){
    this.listenTo(App.Project.ViewpointAttr.ListCollection,"add",this.addOne);
  },

  addOne:function(model){
    var data = model.toJSON().data,
        that = this;
    var Model = Backbone.Model.extend({
      defaults:{
        id:'',
        viewPoint:''
      }
    });
    _.forEach(data,function(obj){
      var view;
      if(obj.id){
        view = new App.Project.viewpointDetail({
          model:obj
        });
      }else{
        view = new App.Project.viewpointEdit({
          model:obj
        });
      }
      that.$el.find('.treeViewSub').append(view.render().el);
    })
    return this;
  },
  render: function() {
    this.$el.html(this.template);
    App.Project.ViewpointAttr.ListCollection.projectId = App.Project.Settings.CurrentVersion.projectId
    App.Project.ViewpointAttr.ListCollection.fetch();
    return this;
  },
  openTree:function(event){
    var that = $(event.target),
        parent = that.parent();
    parent.toggleClass('open');
  },
  editViewpoint:function(){
    var myView = App.Project.Settings.viewPoint;
    var view = new App.Project.viewpointEdit({
      model:App.Project.Settings.viewPoint.model
    })
    $('.tree-view .context-menu').hide();
    myView.$el.replaceWith(view.render().el)
  },
  deleteViewpoint:function(){
    var data={
      type:'delete',
      URLtype:"deleteViewpointById",
      data:{
        projectId:App.Project.Settings.projectId,
        viewPointId:App.Project.Settings.viewPoint.model.id
      }
    }
    App.Comm.ajax(data,function(data){
      if (data.message=="success") {
        $('.tree-view .context-menu').hide();
        App.Project.Settings.viewPoint.remove();
        delete App.Project.Settings.viewPoint;
      }else{
        alert(data.message);
      }
    });
  }
});
