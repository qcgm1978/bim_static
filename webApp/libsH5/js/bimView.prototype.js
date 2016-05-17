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
      _opt.element.append(_opt._dom.bimBox);
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
        var $this = $(this),
            fn = $this.data('id'),
            type = $this.data('type');
        switch(type){
          case "click":
            self[fn]();
            break;
          case "selected":
            $this.toggleClass('selected').siblings().removeClass('selected');
            if($this.is('.selected')){
              self[fn]();
            }else{
              self.picker();
            }
        }
      }).on('click','.modelSelect .cur',function(){
        var $this = $(this);
        $this.toggleClass('open');
      }).on('click','.modelItem',function(){
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
            ids:bimView.comm.getFilter(filterData,data.id)
          })
        }else{

        }
      });
      $(window).on('resize',function(){
        self.resize();
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
      // 适应窗口
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
    fly : function () {
      // 漫游模式
      var self = this;
      self.pub('fly');
      self.viewer.setFlyMode();
    },
    picker:function(){
      // 普通模式
      var self = this;
      self.viewer.setPickMode();
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
    initMap:function(name,element,axisGrid,floorPlane){
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
    viewer.setFloorPlaneData(floorPlane);
    viewer.createMiniMap(name,_el[0],_width,_height,_css,function(res){
      BIM.util.pub('changeGrid',res);
    });
    viewer.generateFloorPlane(name);
    viewer.generateAxisGrid(name);
    }
  }
})($);
