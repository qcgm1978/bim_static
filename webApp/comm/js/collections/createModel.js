App.Comm.createModel = function(options){
  var opt = options;
  var modelBox = $('<div class="modelView"></div>');
  var modelView = $('<div class="model"></div>');
  var viewer;
  var modelBar = Backbone.View.extend({
    tagName: "div",
    className: "modelBar",
    events: {
      "click .bar-item":"select"
    },
    template:_.templateUrl('/comm/js/tpls/modelBar.html',true),
    render: function() {
      this.$el.html(this.template);
      this.$el.find(".modelTree").html(new treeView().render().el);
      return this;
    },
    select:function(event){
      var that = this,
          $el = $(event.target),
          fn = $el.data('id');
      $el.addClass('selected').siblings().removeClass('selected');
      if(fn){
        if(fn == 'filter'){
          that.filter();
        }else{
          viewer && viewer[fn]();
        }
      }
    },
    filter:function(){
      var that = this,
          tree = that.$el.find(".modelTree");
      tree.toggle();
    }
  });
  var treeView = Backbone.View.extend({
    tagName: "ul",
    className: "tree",
    events: {},
    template:_.templateUrl('/comm/js/tpls/modelTree.html',true),
    render:function(){
      this.$el.html(this.template);
      return this;
    }
  })
  var modelCollection = {
    sceneCollection:new(Backbone.Collection.extend({
      model: Backbone.Model.extend(),
      urlType:"fetchScene"
    })),
    categoryCollection:new(Backbone.Collection.extend({
      model: Backbone.Model.extend(),
      urlType:"fetchCategory"
    }))
  };
  modelBox.append(modelView);
  modelBox.append(new modelBar().render().el);
  viewer = App.Project.Settings.Viewer = new BIM({
    element: modelView[0],
    etag: App.Project.Settings.DataModel.etag
  });
  opt.element.append(modelBox);
  return viewer;
}
