App.Project.viewpointEdit = Backbone.View.extend({

  tagName: "li",

  className: "itemNode",

  events:{
    "blur .eidt-input":"saveViewpoint"
  },

  template:_.templateUrl('/projects/tpls/project/viewpoint/project.viewpoint.edit.html'),

  render: function() {
    this.$el.html(this.template(this.model));
    return this;
  },
  saveViewpoint:function(event){
    var that = this,
        myModel = that.model,
        name = event.target.value;
    if(myModel.name == name && myModel.id){
      that.$el.replaceWith(new App.Project.viewpointDetail({
        model:myModel
      }).render().el);
      return;
    }else{
      myModel.name = name;
    }
    var data;
    if(myModel.id){
      data = {
        type:'put',
        URLtype:"editViewpointById",
        contentType:"application/json",
        data:{
          projectId:App.Project.Settings.projectId,
          viewPointId:App.Project.Settings.viewPoint.model.id,
          name:event.target.value
        }
      }
    }else{
      data = {
        type:'post',
        URLtype:"createViewpointById",
        contentType:"application/json",
        data:JSON.stringify({
          "projectId":App.Project.Settings.projectId,
          "name": name,
          "viewPoint": myModel.viewPoint
        })
      }
    }
    App.Comm.ajax(data,function(data){
      if (data.message=="success") {
        myModel.id = data.data.id;
        that.$el.replaceWith(new App.Project.viewpointDetail({
          model:myModel
        }).render().el);
        delete App.Project.Settings.viewPoint;
      }else{
        alert(data.message);
      }
    });
  }
});
