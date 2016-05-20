/**
  * @require /libsH5/js/bimView.js
*/
'use strict'
;(function($){
  bimView.prototype = {
    on : function(event,fn){//订阅
      this.subscribers[event]?this.subscribers[event].push(fn):(this.subscribers[event] = [])&&this.subscribers[event].push(fn);
      return '{"event":"' + event +'","fn":"' + (this.subscribers[event].length - 1) + '"}';
    },
    pub : function(event,args){//发布
      if(this.subscribers[event]){
        for (var i =0,len = this.subscribers[event].length;i<len;i++) {
          if(typeof(this.subscribers[event][i]) === 'function'){
            this.subscribers[event][i](args);
          }
        }
      }
    },
    off : function(subId){//取消订阅
      try{
        var id = JSON.parse(subId);
        this.subscribers[id.event][id.fn] = null;
        delete this.subscribers[id.event][id.fn];
      }catch(err){
        console.log(err);
      }
    },
    init:function(options){
      var self = this;
      var _opt = options;
      _opt.element.html(_opt._dom.bimBox);
      switch(_opt.type){// 判断类型
        case "model":
          self.viewer = bimView.model.model(_opt,self);
          break;
        case 'singleModel':
          self.viewer = bimView.model.singleModel(_opt);
          break;
        case 'familyModel':
          self.viewer = bimView.model.familyModel(_opt);
          break;
        case 'dwg':
          self.viewer = bimView.model.dwg(_opt);
          break;
        default:
          self.viewer = bimView.model.model(_opt);
          break;
      }
      self.regesiterEvent(_opt);
      self.controll();
      bimView.comm.bindEvent.init();
      self.pub("start");
    },
    regesiterEvent:function(options){
      var self = this;
      var _opt = options;
      var loadEvent = {
        start:function(res){
          _opt._dom.loading.append(_opt._dom.progress);
          _opt._dom.bimBox.append(_opt._dom.loading);
        },
        loading:function(res){
          var total = res.progress.total,
              loaded = res.progress.loaded,
              progress = loaded/total*100;
          _opt._dom.progress.width(progress+'%');
          if(progress == 100){
            _opt._dom.loading.remove();
          }
          self.pub('loading',res);
        },
        loaded:function(res){
          self.viewer.render();
          self.pub('loaded',res);
        },
        click:function(res){
          self.pub('click',res);
        }
      }
      self.on('start',loadEvent.start);
      self.viewer.registerEventListener(CLOUD.EVENTS.ON_SELECTION_CHANGED, loadEvent.click);
      self.viewer.registerEventListener(CLOUD.EVENTS.ON_LOAD_PROGRESS, loadEvent.loading);
      self.viewer.registerEventListener(CLOUD.EVENTS.ON_LOAD_COMPLETE, loadEvent.loaded);
    },
    controll:function(){
      var self = this;
      self._dom.bimBox.on('click','.bar-item',function(){
        // 工具条对应功能
        var $this = $(this),
            fn = $this.data('id'),
            group = $this.data('group'),
            isSelected = $this.is('.selected'),
            type = $this.data('type');
        switch(type){
          case "viewer":
            self[fn]();
            break;
          case "pattern":
            $this.toggleClass('selected');
            $this.closest('.toolsBar').find('[data-group='+group+']').not($this).removeClass('selected');
            if(isSelected){
              self.picker();
            }else{
              self[fn]();
            }
            break;
          case "status":
            $this.toggleClass('selected');
            self[fn](!isSelected);
            break;
          case "selected":
            $this.toggleClass('selected').siblings('[data-group='+group+']').removeClass('selected');
            if(fn)self[fn]();
            break;
          case "filter":
            $this.toggleClass('selected').siblings('[data-group='+group+']').removeClass('selected');
            bimView.sidebar[fn](!isSelected);
            break;
          case "more":
            $this.toggleClass('selected');
            bimView.sidebar[fn](self);
            break;
          case "change":
            $this.toggleClass('bar-hideMap bar-showMap')
            $(bimView.sidebar._dom.sidebar).toggleClass("hideMap");
        }
      }).on('click','.modelSelect .cur',function(){
        // 点击下拉
        var $this = $(this);
        $this.toggleClass('open');
      }).on('click','.modelItem',function(){
        // 点击下拉框选择
        var filterData = bimView.comm.filterData;
        var $this = $(this),
            $list = $this.parent(),
            data = $this.data(),
            text = $this.text(),
            $cur = $list.prev('.cur');
        $cur.removeClass('open').text(text);
        if(data.type == 'familyType'){
          self.filter({
            type:'typeId',
            ids:bimView.comm.removeById(filterData,data.id)
          })
        }else{
          self.setFloorMap(data,"miniMap");
        }
      }).on('click','.m-openTree,.m-closeTree',function(){
        // 展开关闭树
        var $this = $(this),
            data = bimView.sidebar.classCodeData,
            $li = $this.closest('.itemNode'),
            type = $li.data('type'),
            flag = $this.next().find('input').prop('checked');
        $this.toggleClass('m-closeTree m-openTree')
        $li.toggleClass('open');
        if(type == 'classCode' && $li.has(".tree").length ==0){
          var parent = $li.data();
          if(!parent.userData) parent.userData = null;
          var tmpArr = [];
          $.each(data,function(i,item){
            if(item.parentCode == parent.userData){
              tmpArr.push(item);
            }
          });
          var children = bimView.sidebar.viewTree({
            arr:tmpArr,
            type:'classCode',
            name:'name',
            data:'code',
            children:'isChild',
            isChecked:flag
          });
          $li.append(children);
        }
      }).on('change','input',function(){
        //filter变化
        var $this = $(this),
            $li = $this.closest('.itemNode'),
            parents = $this.parents('.itemNode'),
            flag = $this.prop('checked');
        $li.find("input").prop("checked",flag);
        var filter = bimView.comm.getFilters(parents,'ckecked');
        self.filter(filter);
      }).on('click','.treeText',function(){
        // 选中高亮
        var $this = $(this),
            $li = $this.closest('.itemNode'),
            flag = $this.is('.selected'),
            data = $li.data();
        $li.find('.treeText').toggleClass('selected',!flag);
        var filter = bimView.comm.getFilters($li,'all');
        self.highlight(filter);
      });
      $(window).on('resize',function(){
        self.resize();
      });
      self.on('changeGrid',function(res){
        bimView.sidebar._dom.mapBar.find(".axisGrid").text(res.axis.offsetX+","+res.axis.offsetY+","+res.axis.offsetZ)
      })
    },
    // 以下是对模型操作
    resize:function(width,height){
      // 缩放画板大小
      var self = this,
          _viewBox = self._dom.bimBox,
          _width = width || _viewBox.width(),
          _height = height || _viewBox.height();
      self.viewer.resize(_width,_height);
    },
    fit : function () {
      // 缩放到选择构件
      var self = this;
      self.pub('fit');
      self.viewer.zoomToSelection();
    },
    // 模型操作模式
    zoom:function () {
      // 缩放模式
      var self = this;
      self.pub('zoom');
      self.viewer.setZoomMode();
    },
    zoomToBox:function(box){
      // 缩放到指定位置
      var self = this;
      var viewer = self.viewer;
      viewer.zoomToBBox(CLOUD.Utils.computeBBox(box));
      viewer.render();
    },
    fly : function () {
      // 漫游模式
      var self = this;
      self.pub('fly');
      self.viewer.setFlyMode();
    },
    picker:function(){
      // 普通模式
      var self = this;
      self.pub('picker');
      self.viewer.setPickMode();
    },
    home:function(){
      // 普通模式
      var self = this;
      self.pub('home');
      self.viewer.setStandardView(CLOUD.EnumStandardView.ISO);
    },
    // 模型检查点
    markers:function(){
      // 进入添加检查点模式
      var self = this;
      var viewer = self.viewer;
      viewer.setMarkerMode();
      viewer.editMarkerBegin();
    },
    markerEnd : function() {
      // 退出检查点模式
      var self = this;
      var viewer = self.viewer;
      viewer.editMarkerEnd();
    },
    saveMarkers : function() {
      // 保存检查点
      var self = this;
      var viewer = self.viewer;
      var list = viewer.getMarkerInfoList();
      var newList = [];
      $.each(list,function(i,item){
        newList.push(window.btoa(JSON.stringify(item)));
      });
      return newList;
    },
    loadMarkers:function(list){
      // 加载检查点
      var self = this;
      var viewer = self.viewer;
      var newList = [];
      $.each(list,function(i,item){
        newList.push(JSON.parse(window.atob(item)));
      });
      viewer.setMarkerMode();
      viewer.loadMarkers(newList);
    },
    // 批注
    comment:function(){
      // 进入添加检查点模式
      var self = this;
      var viewer = self.viewer;
      viewer.setcommentMode();
      viewer.editcommentBegin();
    },
    commentEnd : function() {
      // 退出检查点模式
      var self = this;
      var viewer = self.viewer;
      viewer.editcommentEnd();
    },
    saveComment : function() {
      // 保存检查点
      var self = this;
      var viewer = self.viewer;
      return viewer.getCommentInfoList();
    },
    loadComment:function(list){
      // 加载检查点
      var self = this;
      var viewer = self.viewer;
      viewer.loadComment(list);
    },
    // 模型过滤器
    filter:function(obj){
      // obj{type:"categoryId",ids:[id,id,id]},type为自定义属性,包括categoryId,classCode,sceneId
      var self = this;
      var viewer = self.viewer;
      var filter = viewer.getFilters();
      filter.removeUserFilter(obj.type);
      $.each(obj.ids,function(i,id){
        filter.addUserFilter(obj.type,id);
      })
      viewer.render();
    },
    highlight:function(obj){
      // 高亮
      var self = this;
      var viewer = self.viewer;
      var filter = viewer.getFilters();
      if(obj.type == "userId"){
        filter.setOverriderByUserIds('highlight',obj.ids);
      }else{
        $.each(obj.ids,function(i,id){
          filter.setUserOverrider(obj.type,id);
        });
      }
      viewer.render();
    },
    collision:function(idA,idB){
      // 碰撞
      var self = this;
      var viewer = self.viewer;
      var filter = viewer.getFilters();
      filter.setOverriderByUserIds('collisionA',[idA],'lightBlue');
      filter.setOverriderByUserIds('collisionB',[idB],'darkRed');
      viewer.render();
    },
    translucent:function(flag){
      // 半透明
      var self = this;
      var viewer = self.viewer;
      var filter = viewer.getFilters();
      filter.enableSceneOverrider(flag);
      viewer.render();
    },
    getTranslucentStatus:function(){
      // 获取半透明状态
      var self = this;
      var viewer = self.viewer;
      var filter = viewer.getFilters();
      return filter.isSceneOverriderEnabled();
    },
    initMap:function(name,element,axisGrid,floorPlane){
      // 初始化小地图
      var self = this,
          viewer = self.viewer,
          _el = element,
          _width = _el.width(),
          _height = _el.height(),
          _css={
            left:'0px',
            bottom:'0px',
            outline:'none'
          };
      viewer.setAxisGridData(axisGrid)
      viewer.createMiniMap(name,_el[0],_width,_height,_css,function(res){
        self.pub('changeGrid',res);
      });
      viewer.generateAxisGrid(name);
    },
    setFloorMap:function(obj,name){
      // 设置小地图
      var viewer = this.viewer;
      viewer.setFloorPlaneData(obj);
      viewer.generateFloorPlane(name);
    },
    load:function(etag){
      // 加载场景
      var viewer = this.viewer;
      var client = viewer.load(etag,bimView.API.baseUrl + bimView.API.fetchModel);
      viewer.render();
      return client;
    },
    showScene:function(client,flag){
      // 显示隐藏场景
      var viewer = this.viewer;
      if(viewer && viewer.showScene){
        viewer.showScene(client,flag);
        viewer.render();
      }
    },
    getCamera : function(){
      var viewer = this.viewer;
      return window.btoa(viewer.getCamera());
    },
    setCamera : function(json){
      var viewer = this.viewer;
      viewer.setCamera(window.atob(json));
    }
  }
})($);
