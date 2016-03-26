App.Comm.viewpointView = function(options){
  var self = this;
  self.opt = options;
  var init = function(){
    self.opt.element.append(new listView().render().el);
  };

  var listCollection = new(Backbone.Collection.extend({
    model: Backbone.Model.extend(),
    urlType:"fetchModelViewpoint"
  }));

  var listView = Backbone.View.extend({
    tagName: "ul",
    className: "tree-view",
    events: {
      "click .nodeSwitch": "openTree",
      "click .edit":"editViewpoint",
      "click .delete":"deleteViewpoint",
      "click .setCamera":"setCamera"
    },
    template:_.templateUrl('/comm/js/tpls/viewpointList.html',true),
    initialize:function(){
      this.listenTo(listCollection,"add",this.addOne);
    },
    render: function() {
      this.$el.html(this.template);
      listCollection.projectId = self.opt.projectId;
      listCollection.fetch();
      self.opt.viewer.on('viewpoint', function(point) {
        self.opt.element.find('.tree-view:eq(1) .item-content:eq(0)').addClass('open');
        listCollection.add({
          data: [{
            id: '',
            name: '新建视点',
            viewPoint: point
          }]
        })
      })
      return this;
    },
    addOne:function(model){
      var data = model.toJSON().data,
          that = this;
      _.forEach(data,function(obj){
        var view;
        if(obj.id){
          view = new detailView({
            model:obj
          });
        }else{
          view = new editView({
            model:obj
          });
        }
        that.$el.find('.treeViewSub').append(view.render().el);
      })
      return this;
    },
    openTree:function(event){
      var that = $(event.target),
          parent = that.parent();
      parent.toggleClass('open');
    },
    editViewpoint:function(){
      var myView = that.data.viewPoint;
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
          projectId:self.opt.projectId,
          viewPointId:self.opt.viewPointId
        }
      }
      App.Comm.ajax(data,function(data){
        if (data.message=="success") {
          $('.tree-view .context-menu').hide();
          self.opt.viewPoint.remove();
          delete self.opt.viewPoint;
        }else{
          alert(data.message);
        }
      });
    },
    setCamera:function(event){
      var that = $(event.target),
          point = that.data('viewpoint');
      self.opt.viewer.setCamera(point);
    }
  });
  var detailView = Backbone.View.extend({
    tagName: "li",
    events:{
      "contextmenu .item-content":"menu"
    },
    className: "itemNode",
    template: _.template('<div class="item-content"> <span class="viewpoint"></span> <span class="tree-text setCamera" data-id="<%= id %>" data-viewpoint="<%= viewPoint %>"><%= name %></span> </div>'),
    render: function() {
      this.$el.html(this.template(this.model));
      return this;
    },
    menu:function(event){
      var that = $(event.target),
          contextMenu = that.parents('.tree-view').find(".context-menu"),
          viewPointId = that.data('id'),
          index = that.closest('.itemNode').index();
      self.opt.viewPoint = this;
      self.opt.viewPointId = viewPointId;
      contextMenu.css({
        left:100,
        top:(index+1)*22-34
      }).show();
      $('body').one('click',function(event){
        if(!$(event.target).is('.delete,.edit')){
          if(self.opt.viewPoint){
            delete self.opt.viewPoint;
          }
          $('.tree-view .context-menu').hide();
        }
      })
      event.preventDefault();
    }
  });
  var editView = Backbone.View.extend({
    tagName: "li",
    className: "itemNode",
    events:{
      "blur .eidt-input":"saveViewpoint"
    },
    template:_.template('<div class="item-content"> <span class="viewpoint"></span> <input type="text" class="eidt-input" value="<%=name%>" autofocus="autofocus"> </div>'),
    render: function() {
      this.$el.html(this.template(this.model));
      return this;
    },
    saveViewpoint:function(event){
      var that = this,
          myModel = that.model,
          name = event.target.value;
      if(myModel.name == name && myModel.id){
        that.$el.replaceWith(new detailView({
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
          data:JSON.stringify({
            projectId:self.opt.projectId,
            viewPointId:self.opt.viewPoint.model.id,
            name:event.target.value
          })
        }
      }else{
        data = {
          type:'post',
          URLtype:"createViewpointById",
          contentType:"application/json",
          data:JSON.stringify({
            "projectId":self.opt.projectId,
            "name": name,
            "viewPoint": myModel.viewPoint
          })
        }
      }
      App.Comm.ajax(data,function(data){
        if (data.message=="success") {
          myModel.id = data.data.id;
          that.$el.replaceWith(new detailView({
            model:myModel
          }).render().el);
          delete self.opt.viewPoint;
        }else{
          alert(data.message);
        }
      });
    }
  });
  init();
}



