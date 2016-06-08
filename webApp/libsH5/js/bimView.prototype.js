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
          _opt._dom.bimBox.append(_opt._dom.modelLoading);
        },
        loading:function(res){
          var total = res.progress.total,
              loaded = res.progress.loaded,
              progress = loaded/total*100;
          _opt._dom.progress.width(progress+'%');
          if(progress == 100){
            _opt._dom.loading.remove();
            _opt._dom.modelLoading.remove();
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
      self.viewer.registerEventListener(CLOUD.EVENTS.ON_UPDATE_SELECTION_UI, function (evt) {
        var selectionUI;
        if(!self.selectionStatue){
          selectionUI = $('<div class="selection"></div>');
          self._dom.bimBox.append(selectionUI);
          self.selectionStatue = true;
        }else{
          selectionUI = self._dom.bimBox.find('.selection');
        }
        if (evt.data.visible) {
          var data = evt.data;
          selectionUI.css({
            left:data.left,
            top:data.top,
            width:data.width,
            height:data.height,
            opacity: data.dit ? .5 : .1
          });
        }
        else {
          self.selectionStatue = false;
          selectionUI.remove();
        }
      });
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
          case "view":
            self[fn]();
            break;
          case "pattern":
            $this.toggleClass('selected');
            if($this.closest('.toolsBar').length>0){
              $this.closest('.toolsBar').find('[data-group='+group+']').not($this).removeClass('selected');
            }else{
              $this.siblings().removeClass('selected');
            }
            if(isSelected){
              self.rotateMouse();
            }else{
              self[fn]();
            }
            break;
          case "rotate":
            var className = $this.attr('class'),
                $parent = $this.parent().parent();
            $parent.attr('class',className);
            $this.closest('.toolsBar').find('[data-group='+group+']').not($this).removeClass('selected');
            self[fn]();
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
            bimView.sidebar[fn](!isSelected,self);
            break;
          case "more":
            var flag = self.getTranslucentStatus();
            $this.toggleClass('selected').siblings('[data-group='+group+']').removeClass('selected');
            $this.find('.m-translucent').toggleClass('selected',flag)
            bimView.sidebar[fn](self);
            break;
          case "change":
            $this.toggleClass('m-miniScreen m-fullScreen')
            $(bimView.sidebar.el._dom.sidebar).toggleClass("hideMap");
            break;
          case "comment":
            $this.addClass('selected').siblings().removeClass('selected');
            self.setCommentType(fn);
            break;
          case "color":
            var bar = bimView.model.colorBar;
            var content = $('<div class="colorBar"></div>')
            $.each(bar,function(i,item){
              var tmpHtml = $('<i class="bar-item '+item.icon+'" title="'+item.title+'" data-id="'+item.fn+'" data-type="'+item.type+'" data-group="'+item.group+'"></i>');
              if(fn && fn == item.fn || !fn && i==0){
                tmpHtml.addClass('selected')
              }
              content.append(tmpHtml);
            });
            var type;
            content.on('click','.bar-item',function(){
              var $this = $(this),
                  fn = $this.data('id');
              type = fn;
              $this.addClass('selected').siblings().removeClass('selected');
            })
            bimView.comm.dialog({
              title:"设置背景色",
              content:content,
              callback:function(){
                $this.attr('class','bar-item m-color '+type).data('id',type);
                bimView.comm.setModelBgColor(type);
                self._dom.bimBox.attr('class','bim '+type)
              }
            })
            break;
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
          self.curFloor = text;
          self.curFloorData = data;
          self.setFloorMap(data,"miniMap");
        }
      }).on('click','.m-openTree,.m-closeTree',function(){
        // 展开关闭树
        var $this = $(this),
            data = bimView.sidebar.classCodeData,
            $li = $this.closest('.itemNode'),
            type = $li.data('type'),
            isChecked = $this.next().find('input').prop('checked'),
            isSelected = $this.siblings('.treeText').is('.selected');
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
          var children = bimView.comm.viewTree({
            arr:tmpArr,
            type:'classCode',
            name:'name',
            data:'code',
            children:'isChild',
            isChecked:isChecked,
            isSelected:isSelected
          });
          $li.append(children);
        }
      }).on('change','input',function(){
        //filter变化
        var $this = $(this),
            $li = $this.closest('.itemNode'),
            type = $li.data('type'),
            parents = $this.parents('.itemNode'),
            flag = $this.prop('checked'),
            filter;
        $li.find("input").prop("checked",flag);
        if(type == "sceneId"){
          var filter = bimView.comm.getFilters($("#floors,#specialty"),'uncheck');
          self.fileFilter(filter);
        }else{
          filter = bimView.comm.getFilters(parents,'uncheck');
          self.filter(filter);
        }
      }).on('click','.treeText',function(){
        // 选中高亮
        var $this = $(this),
            $li = $this.closest('.itemNode'),
            flag = $this.is('.selected'),
            data = $li.data();
        $li.find('.treeText').toggleClass('selected',!flag);
        var filter = bimView.comm.getFilters($li,'all');
        flag ? self.downplay(filter) : self.highlight(filter);
      }).on('click','.axisGrid',function(){
        if(!self.bigMap){
          self.bigMap = $('<div id="map"></div>');
        }
        if(!self.footer){
          self.footer = $('<label class="dialogLabel">X：<input type="text" class="dialogInput" id="axisGridX" /></label><label class="dialogLabel">Y：<input type="text" class="dialogInput" id="axisGridY" /></label>');
        }
        var data = self.curFloorData;
        bimView.comm.dialog({
          width:800,
          title:'选择轴网',
          content:self.bigMap,
          footer:self.footer,
          callback:function(){
            var x = self.footer.find('#axisGridX').val(),
                y = self.footer.find('#axisGridY').val();
            self.setAxisGrid('bigMap',y,x);
          }
        });
        self.initMap({
          name:'bigMap',
          element:self.bigMap,
          enable:false,
          callbackMoveOnAxisGrid:function(res){
            self.footer.find('#axisGridX').val(res.numeralName);
            self.footer.find('#axisGridY').val(res.abcName);
          }
        });
        self.showAxisGrid('bigMap');
        self.setFloorMap(data,"bigMap");
      });
      $(window).on('resize',function(){
        self.resize();
      });
      $(document).on('click',function(event){
        var $this = $(event.target);
        if(!$this.is('.bar-item[data-type=more]')){
          $('.bar-item[data-type=more]').removeClass('selected');
        }
      });
      self.on('changeGrid',function(res){
        var floors = self.curFloor;
        var infoX = res.axis.infoX ? res.axis.infoX +"," : "";
        var infoY = res.axis.infoY ? res.axis.infoY +"," : "";
        var infoZ = 'Z('+ floors +','+res.axis.offsetZ+')';
        bimView.sidebar.el._dom.mapBar.find(".axisGrid").text(infoX+infoY+infoZ)
      });
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
      self._dom.bimBox.find(".view").attr('class','view zoom');
      self.pub('zoom');
      self.viewer.setZoomMode();
    },
    zoomToBox:function(box){
      // 缩放到指定位置
      var self = this;
      var viewer = self.viewer;
      viewer.zoomToBBox(CLOUD.Utils.computeBBox(box),0.05);
      viewer.render();
    },
    zoomToSelection:function(box){
      // 缩放到当前选中构件
      var self = this;
      var viewer = self.viewer;
      viewer.zoomToSelection();
      viewer.render();
    },
    rotateCamera : function () {
      // 漫游模式
      var self = this;
      self._dom.bimBox.find(".view").attr('class','view fly');
      self.pub('fly');
      self.viewer.setFlyMode();
    },
    rotateMouse:function(){
      // 普通模式
      var self = this;
      self._dom.bimBox.find(".view").attr('class','view');
      self.pub('rotateMouse');
      self.viewer.setRectPickMode();
    },
    home:function(){
      // 普通模式
      var self = this;
      self.pub('home');
      self.viewer.setStandardView(CLOUD.EnumStandardView.ISO,-0.2);
    },
    front : function () {
      var self = this,
          viewer = self.viewer;
      self.pub('front');
      viewer.setStandardView(CLOUD.EnumStandardView.Front);
    },
    behind : function () {
      var self = this,
          viewer = self.viewer;
      self.pub('behind');
      viewer.setStandardView(CLOUD.EnumStandardView.Back);
    },
    left : function () {
      var self = this,
          viewer = self.viewer;
      self.pub('left');
      viewer.setStandardView(CLOUD.EnumStandardView.Left);
    },
    right : function () {
      var self = this,
          viewer = self.viewer;
      self.pub('right');
      viewer.setStandardView(CLOUD.EnumStandardView.Right);
    },
    top : function () {
      var self = this,
          viewer = self.viewer;
      self.pub('top');
      viewer.setStandardView(CLOUD.EnumStandardView.Top);
    },
    bottom : function () {
      var self = this,
          viewer = self.viewer;
      self.pub('bottom');
      viewer.setStandardView(CLOUD.EnumStandardView.Bottom);
    },
    southEast : function () {
      var self = this,
          viewer = self.viewer;
      self.pub('southEast');
      viewer.setStandardView(CLOUD.EnumStandardView.SouthEast);
    },
    southWest : function () {
      var self = this,
          viewer = self.viewer;
      self.pub('southWest');
      viewer.setStandardView(CLOUD.EnumStandardView.SouthWest);
    },
    northEast : function () {
      var self = this,
          viewer = self.viewer;
      self.pub('northEast');
      viewer.setStandardView(CLOUD.EnumStandardView.NorthEast);
    },
    northWest : function () {
      var self = this,
          viewer = self.viewer;
      self.pub('northWest');
      viewer.setStandardView(CLOUD.EnumStandardView.NorthWest);
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
      self.rotateMouse();
    },
    saveMarkers : function() {
      // 保存检查点
      var self = this;
      var viewer = self.viewer;
      var list = viewer.getMarkerInfoList();
      var newList = [];
      $.each(list,function(i,item){
        newList.push(JSON.stringify(item));
      });
      return newList;
    },
    loadMarkers:function(list){
      // 加载检查点
      var self = this;
      var viewer = self.viewer;
      var newList = [];
      $.each(list,function(i,item){
        newList.push(JSON.parse(item));
      });
      viewer.setMarkerMode();
      viewer.loadMarkers(newList);
    },
    // 批注
    comment:function(data){
      // 进入批注模式
      var self = this;
      var viewer = self.viewer;
      var modelBgColor = self._dom.bimBox.css('background-color');
      self._dom.bimBox.attr('class','bim comment');
      viewer.setCommentMode();
      viewer.editCommentBegin();
      viewer.setCommentBackgroundColor(modelBgColor);
      if(data){
        var newList = [];
        $.each(data.list,function(i,item){
          newList.push(JSON.parse(window.atob(item)));
        });
        viewer.loadComments(newList);
      }
      viewer.setCommentType("0");
      bimView.model.comment(self._dom.bimBox);
    },
    commentEnd : function() {
      // 退出批注模式
      var self = this;
      var viewer = self.viewer;
      self._dom.bimBox.attr('class','bim');
      self._dom.bimBox.find('.commentBar').remove();
      viewer.editCommentEnd();
      self.rotateMouse();
    },
    setCommentType:function(type){
      var self = this;
      var viewer = self.viewer;
      viewer.setCommentType(type);
    },
    saveComment : function() {
      // 保存批注
      var self = this;
      var viewer = self.viewer;
      var list = viewer.getCommentInfoList();
      var newList = [];
      $.each(list,function(i,item){
        newList.push(window.btoa(JSON.stringify(item)));
      });
      var floors = bimView.comm.getFilters($("#floors"),'ckecked');
      var specialty = bimView.comm.getFilters($("#specialty"),'ckecked');
      var category = bimView.comm.getFilters($("#category"),'ckecked');
      var classCode = bimView.comm.getFilters($("#classCode"),'ckecked');
      return {
        camera:self.getCamera(),
        list:newList,
        image:viewer.canvas2image().substr(22),
        filter:{
          floors:floors,
          specialty:specialty,
          category:category,
          classCode:classCode
        }
      };
    },
    loadComment:function(data){
      // 加载批注
      var self = this;
      var viewer = self.viewer;
      var newList = [];
      $.each(data.list,function(i,item){
        newList.push(JSON.parse(window.atob(item)));
      });
      data.filter.floors.ids = data.filter.floors.ids.concat(data.filter.specialty.ids);
      self.filter(data.filter.floors);
      self.filter(data.filter.category);
      self.filter(data.filter.classCode);
      viewer.setCommentMode();
      viewer.loadComments(newList);
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
    fileFilter:function(obj){
      var self = this;
      var viewer = self.viewer;
      var filter = viewer.getFilters();
      viewer.adjustSceneLoD(obj.total);
      filter.removeFileFilter();
      $.each(obj.ids,function(i,id){
        filter.addFileFilter(id)
      });
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
    downplay:function(obj){
      var self = this;
      var viewer = self.viewer;
      var filter = viewer.getFilters();
      if(obj.type == "userId"){
        filter.setOverriderByUserIds('highlight',[]);
      }else{
        $.each(obj.ids,function(i,id){
          filter.removeUserOverrider(obj.type,id);
        });
      }
      viewer.render();
    },
    setSelectedIds:function(){
      var self = this;
      var viewer = self.viewer;
      viewer.setSelectedIds(ids);
    },
    getSelectedIds:function(){
      var self = this;
      var viewer = self.viewer;
      var filters = viewer.getFilters();
      return filters.getSelectionSet();
    },
    collision:function(idA,idB){
      // 碰撞
      var self = this;
      var viewer = self.viewer;
      var filter = viewer.getFilters();
      filter.setOverriderByUserIds('collisionA',[idA],'darkRed');
      filter.setOverriderByUserIds('collisionB',[idB],'lightBlue');
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
    isolate:function(){
      var self = this;
      var viewer = self.viewer;
      var filter = viewer.getFilters();
      filter.setHideUnselected(!filter.isHideUnselected());
      viewer.render();
    },
    initMap:function(options){
      var defaults = {
        element:'',
        name:'defaultMap',
        axisGrid:'',
        enable:true,
        callbackCameraChanged:null,
        callbackMoveOnAxisGrid:null
      },
      _opt = $.extend({},defaults,options);
      // 初始化小地图
      var self = this,
          viewer = self.viewer,
          _el = _opt.element,
          _width = _el.width(),
          _height = _el.height(),
          _css={
            left:'0px',
            bottom:'0px',
            outline:'none',
            position:'relative'
          };
      if(_opt.axisGrid) viewer.setAxisGridData(_opt.axisGrid)
      viewer.createMiniMap(_opt.name,_el[0],_width,_height,_css,_opt.callbackCameraChanged,_opt.callbackMoveOnAxisGrid);
      viewer.enableAxisGridEvent(_opt.name,_opt.enable);
      viewer.generateAxisGrid(_opt.name);
    },
    setAxisGrid:function(name, x, y){
      var viewer = this.viewer;
      viewer.flyBypAxisGridNumber(name, x, y);
    },
    setFloorMap:function(obj,name){
      // 设置小地图
      var viewer = this.viewer;
      viewer.setFloorPlaneData(obj);
      viewer.generateFloorPlane(name);
    },
    showAxisGrid:function(name){
      var viewer = this.viewer;
      viewer.showAxisGrid(name,true);
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
    },
    commentInit:function(){
      console.log($('#comment'))
    }
  }
})($);
