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
      modelCollection.sceneCollection.etag = modelCollection.categoryCollection.etag = opt.etag;
      modelCollection.sceneCollection.sourceId = modelCollection.categoryCollection.sourceId = opt.sourceId;
      modelCollection.sceneCollection.fetch();
      modelCollection.categoryCollection.fetch();
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
    events: {
      "click .nodeSwitch":"toggleTree",
      "click .tree-text":"selectTree",
      "change input":"filter",
    },
    template:_.templateUrl('/comm/js/tpls/modelTree.html',true),
    render:function(){
      this.$el.html(this.template);
      this.$el.find("#specialitys").append(new sView().render().el);
      this.$el.find("#floors").append(new fView().render().el);
      this.$el.find("#categorys").append(new cView().render().el);
      return this;
    },
    toggleTree:function(event){
      var that = this,
          self = $(event.target).closest(".item-content");
      self.toggleClass("open");
    },
    selectTree:function(event){
      var that = this,
          self = $(event.target),
          parent = self.closest(".item-content"),
          flag = self.is(".selected");
      self.toggleClass("selected");
      parent = parent.next(".subTree").length>0 ? parent.next(".subTree") : parent;
      var data = that.getData(parent);
      if(flag){
        parent.find(".tree-text").removeClass("selected");
        viewer.downplay(data);
      }else{
        parent.find(".tree-text").addClass("selected");
        viewer.highlight(data);
      }
    },
    filter:function(event){
      var that = this,
          self = $(event.target),
          parent = self.closest(".item-content"),
          flag = self.is(":checked"),
          type = self.data("type"),
          data= {
            type:type,
            ids:[]
          }
      parent = parent.next(".subTree").length>0 ? parent.next(".subTree") : parent;
      parent.find("input").prop("checked",flag);
      if(type == "sceneId"){
        data.ids = that.getFilter();
        viewer.showScene(data);
      }else{
        data = that.getData(parent);
        flag?viewer.show(data):viewer.hide(data);
      }
    },
    getData:function(element){
      var data = {
            type:'',
            ids:[]
          },
          input = element.find("input");
      data.type = input.eq(0).data("type");
      $.each(input,function(index,item){
        var $item = $(item),
            etag = $item.data('etag');
        etag = etag?etag.toString().split(","):[];
        data.ids = data.ids.concat(etag);
      });
      return data;
    },
    getFilter:function(){
      var sp = getHideEetag("#specialitys");
      var fl = getHideEetag("#floors");
      function getHideEetag(element){
        var data = [];
        $.each($(element).find("input"),function(index,item){
          var $item = $(item),
              flag = $item.is(":checked"),
              etag = $item.data('etag');
          etag = etag?etag.split(","):[];
          if(!flag){
            data = data.concat(etag);
          }
        });
        return data;
      }
      return _.uniq(sp.concat(fl));
    }
  });
  var sView = Backbone.View.extend({
    tagName: "ul",
    className: "subTree",
    template:_.templateUrl('/comm/js/tpls/specialitys.html'),
    initialize:function(){
      this.listenTo(modelCollection.sceneCollection,"add",this.addSpecialitys);
    },
    render:function(){
      this.$el.html("<p>加载中...</p>");
      return this;
    },
    addSpecialitys:function(model){
      var that = this,
          data = model.toJSON();
      if(data.message == "success"){
        var specialitys = data.data.specialties
        that.$el.html(this.template({data:specialitys}));
        return that;
      }
    },
  });
  var fView = Backbone.View.extend({
    tagName: "ul",
    className: "subTree",
    template:_.templateUrl('/comm/js/tpls/floors.html'),
    initialize:function(){
      this.listenTo(modelCollection.sceneCollection,"add",this.addFloors);
    },
    render:function(){
      this.$el.html("<p>加载中...</p>");
      return this;
    },
    addFloors:function(model){
      var that = this,
          data = model.toJSON();
      if(data.message == "success"){
        var floors = data.data.floors
        that.$el.html(this.template({data:floors}));
        return that;
      }
    }
  });
  var cView = Backbone.View.extend({
    tagName: "ul",
    className: "subTree",
    template:_.templateUrl('/comm/js/tpls/category.html'),
    initialize:function(){
      this.listenTo(modelCollection.categoryCollection,"add",this.addCategory);
    },
    render:function(){
      this.$el.html("<p>加载中...</p>");
      return this;
    },
    addCategory:function(model){
      var that = this,
          data = model.toJSON();
      if(data.message == "success"){
        that.$el.html(this.template(data));
        return that;
      }
    }
  });
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
  opt.element.append(modelBox);
  modelBox.append(new modelBar().render().el);
  viewer = App.Project.Settings.Viewer = new BIM({
    element: modelView[0],
    etag: App.Project.Settings.DataModel.etag
  });
  return viewer;
}
