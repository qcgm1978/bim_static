App.Comm.createModel = function(options){
  var opt = options;
  var modelBox = $('<div class="modelView"></div>');
  var modelView = $('<div class="model"></div>');
  var modelMap = $('<div class="map"></div>');
  var serverUrl = 'http://bim.wanda-dev.cn'
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
    })),
    classCodeCollection: new(Backbone.Collection.extend({
      model: Backbone.Model.extend(),
      urlType:"fetchCoding"
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
      "click .selectFloor li":"selectFloor",
      "click .modelTabItem":"modelTab",
      "click .modelTabBtn":"modelComment"
    },
    template:_.templateUrl('/comm/js/tpls/modelBar.html',true),
    initialize:function(){
      this.listenTo(modelCollection.viewpointCollection,"add",this.addViewpoint);
    },
    render: function() {
      this.$el.html(this.template);
      this.$el.find(".modelTree .modelFilter").html(new treeView().render().el);
      modelCollection.floorsCollection.etag = opt.etag;
      modelCollection.floorsCollection.sourceId = opt.sourceId;
      modelCollection.floorsCollection.fetch();
      return this;
    },
    addViewpoint:function(model){
      var data = model.toJSON().data,
          that = this;
      _.forEach(data,function(obj){
        var view = new vView({
          model:obj
        });
        that.$el.find('#public ul').html(view.render().el);
      });
      return that;
    },
    select:function(event){
      var that = this,
          self = $(event.target),
          fn = self.data('id'),
          type = self.data('type');
      if(type == 'filter'){
        self.toggleClass('selected').siblings().removeClass('selected');
        that.filter(fn,self.is('.selected'));
      }else if(type == "more"){
        self.toggleClass('selected').siblings().removeClass('selected');
      }else if(type == "change"){
        self.toggleClass('selected').siblings().removeClass('selected');
        if(self.is(".selected")){
          viewer && viewer[fn]();
        }else{
          viewer.picker();
        }
      }else if(type == "map"){
        if(modelBox.find('.modPop').length==0){
          modelBox.append(new modDialog().render().el);
          $(".modPop").show();
          viewer.initMap('bigMap',$("#map")[0]);
          viewer.showAxisGrid("bigMap");
        }else{
          $(".modPop").show();
        }
      }else{
        viewer && viewer[fn]();
      }
    },
    filter:function(type,isShow){
      // 加载构件树
      var that = this,
          tree = that.$el.find(".modelTree");
      modelCollection.sceneCollection.etag = modelCollection.categoryCollection.etag = opt.etag;
      modelCollection.sceneCollection.sourceId = modelCollection.categoryCollection.sourceId = opt.sourceId;
      modelCollection.viewpointCollection.projectId = opt.projectId;
      modelCollection.classCodeCollection.etag = opt.etag;
      if(type == "filter"){
        if(!that.filter.fetchTree){
          modelCollection.sceneCollection.fetch();
          modelCollection.categoryCollection.fetch();
          modelCollection.classCodeCollection.fetch();
          that.filter.fetchTree = true;
        }
        tree.find('.modelFilter').show().siblings().hide();
      }else{
        if(!that.filter.fetchPoint){
          modelCollection.viewpointCollection.fetch();
          that.filter.fetchPoint = true;
        }
        tree.find('.modeSnapshot').show().siblings().hide();
      }
      if(isShow){
        tree.show().parent().addClass('open');
      }else{
        tree.hide().parent().removeClass('open');
      }
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
      });
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
      viewer.setFloorMap(mapData,"initMap");
    },
    modelTab:function(event){
      var self = $(event.target),
          target = self.data('target');
      $(target).show().siblings().hide();
    },
    modelComment:function(){
      $(".modelBar").hide();
      App.Comm.navBarToggle($(".rightProperty"),$(".projectCotent"),"right",App.Project.Settings.Viewer);
      setTimeout(function(){
        var comment = new App.Comm.modules.Comment({
          element:$('.modelContainerContent')
        });
      },600)
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
      this.listenTo(modelCollection.classCodeCollection,"add",this.addClassCode);
    },
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
      if(self.parents("#classCode")){
        var flag = self.next(".subTree").length;
        if(flag == 0){
          var data = that.classCodeData,
              isChecked = self.find("input").prop("checked"),
              isSelected = self.find(".tree-text").is(".selected"),
              parentCode = self.data("parent") || null,
              tmpData = {
                isChecked:isChecked,
                isSelected:isSelected,
                data:[]
              }
          $.each(data,function(i,item){
            if(item.parentCode == parentCode){
              tmpData.data.push(item);
            }
          });
          self.after(new classView({
            model:tmpData
          }).render().el);
        }
      }
    },
    addClassCode:function(model){
      var data = model.toJSON();
      if(data.message == "success"){
        this.classCodeData = data.data;
      }
    },
    selectTree:function(event){
      var that = this,
          self = $(event.target),
          parent = self.closest(".item-content"),
          flag = self.is(".selected"),
          data = that.getData(parent);
      self.toggleClass("selected");
      parent = parent.next(".subTree").length>0 ? parent.next(".subTree") : parent;
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
          type = parent.data("type");
      parents = parent.next(".subTree").length>0 ? parent.next(".subTree") : parent;
      parents.find("input").prop("checked",flag);
      viewer.hideScene(that.getFilter(type));
    },
    getData:function (element){
      var type = element.data("type");
      var parent = element.next(".subTree").length>0 ? element.next(".subTree") : element;
      var data = {
        type:type,
        ids:[]
      }
      if(type != "classCode"){
        var input = parent.find("input");
        $.each(input,function(index,item){
          var $item = $(item),
              etag = $item.data('etag');
          if(!etag && etag !==0){
            etag = []
          }else{
            etag = etag.toString().split(",")
          }
          data.ids = data.ids.concat(etag);
        });
      }else{
        var codeData = this.classCodeData;
        var code = parent.data('parent');
        var reg = new RegExp("^"+code);
        $.each(codeData,function(i,item){
          if(!code){
            data.ids.push(item.code);
          }else if(reg.test(item.code)){
            data.ids.push(item.code);
          }
        });
      }
      return data;
    },
    getFilter:function(type){
      var that = this;
      var data = {
        type:type,
        ids:[]
      }
      switch(type){
        case "sceneId":
          var sp = getHideEetag("#specialitys");
          var fl = getHideEetag("#floors");
          data.ids = _.uniq(sp.concat(fl));
          break;
        case "categoryId":
          data.ids = getHideEetag("#categorys");
          break;
        case "classCode":
          data.ids = getHideClassCode("#classCode");
          break;
      }
      return data;
      function getHideEetag(element){
        var data = [];
        var input = $(element).find("input");
        $.each(input,function(index,item){
          var $item = $(item),
              flag = $item.prop("checked"),
              etag = $item.data('etag');
          if(etag || etag == 0 || etag == -1){
            etag = typeof etag == "number" ? [etag]:etag.split(",");
          }
          if(!flag){
            data = data.concat(etag);
          }
        });
        return data;
      }
      function getHideClassCode(element){
        var element = $(element);
        var codeData = that.classCodeData;
        var input = element.find("input");
        var data = []
        var regData = [];
        $.each(input,function(index,item){
          var $item = $(item),
              etag = $item.data('etag'),
              isChecked = $item.prop('checked'),
              hasChildren = $item.closest(".item-content").find(".noneSwitch").length;
              isOpen = $item.closest(".item-content").next(".subTree").length;
          if(!isChecked){
            if(hasChildren || isOpen){
              data.push(etag);
            }else{
              if(etag == undefined){
                regData = "all";
              }else{
                regData.push(etag);
              }
            }
          }
        });
        var reg = new RegExp("^["+regData.toString()+"]");
        $.each(codeData,function(i,item){
          if(regData == "all" || reg.test(item.code)){
            data.push(item.code);
          }
        });
        return data;
      }
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
  var classView = Backbone.View.extend({
    // 分类构件编码
    tagName: "ul",
    className: "subTree",
    template:_.templateUrl('/comm/js/tpls/classCode.html'),
    render:function(){
      this.$el.html(this.template(this.model));
      return this;
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
        data.data = _.sortBy(data.data,function(num){return -num.sort})
        floorMap = data.data;
        this.$el.html(_.template(this.template)(data));
        this.$el.find("li:eq(0)").trigger("click");
      }
      return this;
    }
  });
  var modDialog = Backbone.View.extend({
    // 视点树
    tagName: "div",
    className:'modPop',
    events:{
      "click .modClose":"hideMode",
      "click .submit":"submit",
      "input .modInput":"reset"
    },
    template:_.templateUrl('/comm/js/tpls/modDialog.html',true),
    render:function(){
      this.$el.html(this.template);
      return this;
    },
    hideMode:function(event){
      $(event.target).closest(".modPop").hide();
    },
    submit:function(event){
      var that = this,
          self = $(event.target),
          parent = that.$el,
          x = parent.find("#x").val(),
          y = parent.find("#y").val();
      if(x&&y){
        parent.hide();
      }else{
        !x&&parent.find("#x").addClass('error');
        !y&&parent.find("#y").addClass('error');
      }
    },
    reset:function(event){
      $(event.target).removeClass('error');
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
      URLtype:"fetchAxisGrid",
      data:{
        etag:opt.etag
      }
    }
    App.Comm.ajax(data,function(data){
      viewer.setAxisGrid(data,"initMap")
    });
  }
  var init = function(){
    modelBox.append(modelView);
    opt.element.append(modelBox);
    modelBox.append(new modelBar().render().el);
    $('body').on("keypress",function(event){
      var event = event || window.event;
      if(event.keyCode==32){
        $(".bar-fly").trigger('click');
      }
    })
    viewer = new BIM({
      element: modelView[0],
      etag: opt.etag
    });
    $(".modelMap .floors").append(new selectFloor().render().el);
    getAxisGrid();
    viewer.initMap('initMap',$('.modelMap .map')[0]);
    viewer.on('changeGrid',function(res){
      if(!res) return false;
      var axis = res.axis,
          x = axis.infoX,
          y = axis.infoY;
      if(x&&y){
        $('.grid-position').text(x+","+y);
      }else{
        $('.grid-position').text("--,--");
      }
      $('.modPop').hide();
    })
    viewer.on("viewpoint",function(point){
      $('.modelView .bar-eye').not('.selected').trigger('click');
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

