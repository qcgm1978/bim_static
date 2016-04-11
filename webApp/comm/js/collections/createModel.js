App.Comm.createModel = function(options){
  var opt = options;
  var modelBox = $('<div class="modelView"></div>');
  var modelView = $('<div class="model"></div>');
  var modelMap = $('<div class="map"></div>');
  var serverUrl = 'http://bim.wanda.cn'
  var viewer;
  var viewPoint;
  var floorMap;
  modelCollection = {
    sceneCollection:new(Backbone.Collection.extend({
      model: Backbone.Model.extend(),
      urlType:"fetchScene"
    })),
    categoryCollection:new(Backbone.Collection.extend({
      model: Backbone.Model.extend(),
      urlType:"fetchCategory"
    })),
    viewpointCollection: new(Backbone.Collection.extend({
      model: Backbone.Model.extend(),
      urlType:"fetchModelViewpoint"
    })),
    floorsCollection: new(Backbone.Collection.extend({
      model: Backbone.Model.extend(),
      urlType:"fetchFloors"
    }))
  };
  var modelBar = Backbone.View.extend({
    // 加载模型浏览器
    tagName: "div",
    className: "modelBar",
    events: {
      "click .bar-item":"select",
      "click .delete":"delete",
      "click .edit":"edit",
      "click .current-floor":"openFloors",
      "click .selectFloor":"selectFloor"
    },
    template:_.templateUrl('/comm/js/tpls/modelBar.html',true),
    render: function() {
      this.$el.html(this.template);
      this.$el.find(".modelTree").html(new treeView().render().el);
      this.$el.find(".floors").append(new selectFloor().render().el);
      modelCollection.floorsCollection.etag = opt.etag;
      modelCollection.floorsCollection.sourceId = opt.sourceId;
      modelCollection.floorsCollection.fetch();
      return this;
    },
    select:function(event){
      var that = this,
          self = $(event.target),
          fn = self.data('id');
      if(self.is(".bar-filter")){
        self.toggleClass('selected')
        that.filter();
      }else if(self.is(".bar-viewpoint,.bar-comment,.bar-fit")){
        viewer && viewer[fn]();
      }else{
        self.addClass('selected').siblings(":not('.bar-filter')").removeClass('selected');
        viewer && viewer[fn]();
      }
    },
    filter:function(){
      // 加载构件树
      var that = this,
          tree = that.$el.find(".modelTree");
      modelCollection.sceneCollection.etag = modelCollection.categoryCollection.etag = opt.etag;
      modelCollection.sceneCollection.sourceId = modelCollection.categoryCollection.sourceId = opt.sourceId;
      modelCollection.viewpointCollection.projectId = opt.projectId;
      modelCollection.sceneCollection.fetch();
      modelCollection.categoryCollection.fetch();
      modelCollection.viewpointCollection.fetch();
      tree.toggle().parent().toggleClass('open');
    },
    delete:function(){
      new App.Comm.modules.Dialog({
        width:280,
        message:'确认要删除视点“'+viewPoint.model.name+'”？',
        okText:'确定',
        okCallback:function(){
          var data={
            type:'delete',
            URLtype:"deleteViewpointById",
            data:{
              projectId:opt.sourceId,
              viewPointId:viewPoint.model.id
            }
          }
          App.Comm.ajax(data,function(data){
            if (data.message=="success") {
              viewPoint.remove();
            }else{
              alert(data.message);
            }
          });
        }
      })
    },
    edit:function(){
      viewpointDialog({
        title:"将当前窗口保存为视点",
        okText:"保存",
        message:"",
        html:'<input type="text" class="modelInput" id="viewpointName" placeholder="请输入视点名称" value="'+viewPoint.model.name+'" />',
        type:"edit"
      })
    },
    openFloors:function(event){
      var that = this,
          self = $(event.target);
      self.toggleClass("open");
    },
    selectFloor:function(event){
      var that = this,
          self = $(event.target),
          val = self.text(),
          sort = self.data("index"),
          cur = self.parent().prev(),
          mapData;
      $.each(floorMap,function(index,item){
        if(item.sort == sort){
          item.Path=  serverUrl + "/model"+item.path;
          item.BoundingBox = item.boundingBox;
          mapData = item;
        }
      });
      cur.text(val).removeClass("open");
      viewer.setFloorMap(mapData);
    }
  });
  var treeView = Backbone.View.extend({
    tagName: "ul",
    className: "tree",
    events: {
      "click .nodeSwitch":"toggleTree",
      "click .tree-text":"selectTree",
      "change input":"filter"
    },
    template:_.templateUrl('/comm/js/tpls/modelTree.html',true),
    initialize:function(){
      this.listenTo(modelCollection.viewpointCollection,"add",this.addViewpoint);
    },
    render:function(){
      this.$el.html(this.template);
      this.$el.find("#specialitys").append(new sView().render().el);
      this.$el.find("#floors").append(new fView().render().el);
      this.$el.find("#categorys").append(new cView().render().el);
      return this;
    },
    addViewpoint:function(model){
      var data = model.toJSON().data,
          that = this;
      _.forEach(data,function(obj){
        var view = new vView({
          model:obj
        });
        that.$el.find('#viewpoints ul').append(view.render().el);
      });
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
      var data = that.getData(parent);
      if(self.is(".J-viewpoint")){
        var viewpoint = self.data("viewpoint");
        viewer.setCamera(viewpoint);
      }else{
        self.toggleClass("selected");
        parent = parent.next(".subTree").length>0 ? parent.next(".subTree") : parent;
        if(flag){
          parent.find(".tree-text").removeClass("selected");
          viewer.downplay(data);
        }else{
          parent.find(".tree-text").addClass("selected");
          viewer.highlight(data);
        }
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
    // 专业树
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
    // 楼层树
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
    // 构件树
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
  var vView = Backbone.View.extend({
    // 视点树
    tagName: "li",
    className: "itemNode",
    events:{
      "contextmenu .item-content":"menu"
    },
    template:_.templateUrl('/comm/js/tpls/viewpoint.html'),
    render:function(){
      this.$el.html(this.template(this.model));
      return this;
    },
    menu:function(event){
      var that = this,
          self = $(event.target),
          id = self.data('id'),
          left = event.pageX,
          top = self.position().top,
          parent = $(".modelTree");
      if(parent.find(".menu").length>0){
        parent.find(".menu").css({
          left:left,
          top:top
        }).show();
      }else{
        var html = '<div class="menu"><span class="item edit">重命名</span><span class="item delete">删除</span><span class="item addComment">批注</span></div>'
        $(html).css({
          left:left,
          top:top
        }).addClass("in").appendTo($(".modelTree"));
      }
      viewPoint=this;
      $(document).one("click",function(){
        $(".modelTree .menu").hide();
        pointId = '';
      })
      event.preventDefault();
    }
  });
  var selectFloor = Backbone.View.extend({
    // 视点树
    tagName: "ul",
    className:'selectFloor',
    template:'<% _.each(data,function(item){ %><li data-index="<%= item.sort %>"><%= item.name.substr(0,3) %></li><% }) %>',
    initialize:function(){
      this.listenTo(modelCollection.floorsCollection,"add",this.addFloors);
    },
    render:function(){
      this.$el.html("");
      return this;
    },
    addFloors:function(model){
      var data = model.toJSON();
      if(data.message == "success"){
        data.data = data.data.sort(function(a,b){return a.sort<b.sort})
        floorMap = data.data;
        this.$el.html(_.template(this.template)(data));
        this.$el.find("li:eq(0)").trigger("click");
      }
      return this;
    }
  });
  var viewpointDialog = function(option){
   new App.Comm.modules.Dialog({
      width:280,
      title:option.title,
      message:option.message,
      okText:option.okText,
      readyFn:function(){
        this.element.find(".content").html(option.html);
      },
      okCallback:function(){
        var viewpointName = $("#viewpointName"),
            val = viewpointName.val();
        if(val){
          if(option.type == "new"){
            var data = {
              type:'post',
              URLtype:"createViewpointById",
              contentType:"application/json",
              data:JSON.stringify({
                "projectId":opt.sourceId,
                "name": viewpointName.val(),
                "viewPoint": option.point
              })
            }
            App.Comm.ajax(data,function(data){
              if (data.message=="success") {
                var result = data;
                result.data=[result.data];
                modelCollection.viewpointCollection.add(result)
              }else{
                alert(data.message);
              }
            });
          }else{
            var data = {
              type:'put',
              URLtype:"editViewpointById",
              contentType:"application/json",
              data:JSON.stringify({
                "projectId":opt.sourceId,
                "name": viewpointName.val(),
                "viewPointId":viewPoint.model.id
              })
            }
            App.Comm.ajax(data,function(data){
              if (data.message=="success") {
                viewPoint.model.name = data.data.name;
                viewPoint.render();
              }else{
                alert(data.message);
              }
            });
          }
        }else{
          viewpointName.addClass("error");
          viewpointName.on("input",function(){
            $(this).removeClass('error');
          })
          return false;
        }
      }
    })
  }
  var getAxisGrid = function(){
    var data = {
      URLtype:"fetchAxisGrid"
    }
    App.Comm.ajax(data,function(data){
      viewer.setAxisGrid(data)
    });
  }
  var init = function(){
    modelBox.append(modelView);
    opt.element.append(modelBox);
    modelBox.append(new modelBar().render().el);
    viewer = App.Project.Settings.Viewer = new BIM({
      element: modelView[0],
      mapElement:$('.modelMap .map')[0],
      etag: App.Project.Settings.DataModel.etag
    });
    getAxisGrid();
    viewer.on('changeGrid',function(res){
      var axis = res.axis,
          x = axis.infoX,
          y = axis.infoY;
      if(x&&y){
        $('.grid-position').text(x+","+y);
      }
    })
    viewer.on("viewpoint",function(point){
      $('.modelView .bar-filter').not('.selected').trigger('click');
      $('.modelView #viewpoints>.item-content').addClass("open");
      viewpointDialog({
        type:"new",
        title:"将当前窗口保存为视点",
        okText:"保存",
        message:"",
        html:'<input type="text" class="modelInput" id="viewpointName" placeholder="请输入视点名称" />',
        point:point
      })
    })
    return viewer;
  }
  return init();
}

