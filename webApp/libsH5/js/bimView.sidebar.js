/**
  * @require /libsH5/js/bimView.js
*/
'use strict'
;(function($){
  bimView.sidebar = {
    _dom:{
      sidebar : $('<div class="modelSidebar"><div class="modelMap"><div class="map"></div></div><div class="modelFilter"><div id="filter" class="modelTab"><div class="tree"></div></div><div id="comment" class="modelTab">comment</div><div id="selected" class="modelTab">selected</div></div></div>'),
      modelBar : $('<div class="toolsBar"></div>'),
      mapBar:$('<div class="footBar"><div class="modelSelect"><span class="cur"></span><div class="modelList"></div></div><div class="axisGrid"></div></div>')
    },
    init:function(options,obj){
      var self = this;
      self._opt = options;
      self.obj = obj;
      var bimBox = self._opt._dom.bimBox;
      $.each(bimView.model.modelBar,function(i,item){
        var tmpHtml = $('<i class="bar-item '+item.icon+'" title="'+item.title+'" data-id="'+item.fn+'" data-type="'+item.type+'" data-group="'+item.group+'"></i>');
        bimView.comm.bindEvent.on(item.keyCode,tmpHtml);
        self._dom.modelBar.append(tmpHtml);
        if(item.subBar&&item.subBar.length>0){
          var subBar = $('<div class="subBar"></div>')
          $.each(item.subBar,function(index,barItem){
            var subItem = $('<i class="bar-item '+barItem.icon+'" title="'+barItem.title+'" data-id="'+barItem.fn+'" data-type="'+barItem.type+'" data-group="'+item.group+'"></i>');
            bimView.comm.bindEvent.on(barItem.keyCode,tmpHtml);
            subBar.append(subItem);
          });
          self._dom.modelBar.append(subBar);
        }
      });
      self._dom.sidebar.find('.modelMap').prepend(self._dom.modelBar);
      bimBox.append(self._dom.sidebar);
      self.loadMap();
    },
    filter:function(isSelected){
      var self = this;
      isSelected ? self._dom.sidebar.addClass('open') : self._dom.sidebar.removeClass('open');
      self._dom.sidebar.find('#filter').show().siblings().hide();
      if(!self.sceneStatue){
        bimView.comm.ajax({
          type:'get',
          url:bimView.API.fetchScene,
          etag:self._opt.etag,
          sourceId:self._opt.sourceId
        },function(data){
          self.sceneStatue = true;
          var data = data.data;
          var floors = self.viewTree({
            arr:data.floors,
            type:'sceneId',
            name:'floor',
            data:'fileEtags',
            rootName:'楼层'
          });
          var specialties = self.viewTree({
            arr:data.specialties,
            type:'sceneId',
            name:'specialty',
            children:'files',
            childrenName:'fileName',
            data:'fileEtag',
            rootName:'专业'
          });
          $('#filter>.tree').append(floors,specialties);
        });
      }
      if(!self.categoryStatue){
        bimView.comm.ajax({
          type:'get',
          url:bimView.API.fetchCategory,
          etag:self._opt.etag,
          sourceId:self._opt.sourceId
        },function(data){
          self.categoryStatue = true;
          var data = data.data;
          var category = self.viewTree({
            arr:data,
            type:'categoryId',
            name:'specialty',
            code:'specialtyCode',
            children:'categories',
            childrenType:'json',
            rootName:'构件类型'
          });
          $('#filter>.tree').append(category);
        });
      }
      if(!self.classCodeStatue){
        bimView.comm.ajax({
          type:'get',
          url:bimView.API.fetchCoding,
          etag:self._opt.etag,
          sourceId:self._opt.sourceId
        },function(data){
          self.categoryStatue = true;
          self.classCodeData = data.data;
          var classCode = self.viewTree({
            type:'classCode',
            rootName:'分类编码'
          });
          $('#filter>.tree').append(classCode);
        });
      }
    },
    comment:function(isSelected){
      var self = this;
      isSelected ? self._dom.sidebar.addClass('open') : self._dom.sidebar.removeClass('open');
      self._dom.sidebar.find('#comment').show().siblings().hide();
    },
    selected:function(isSelected){
      var self = this;
      isSelected ? self._dom.sidebar.addClass('open') : self._dom.sidebar.removeClass('open');
      self._dom.sidebar.find('#selected').show().siblings().hide();
    },
    more:function(){
      setTimeout(function(){
        $(document).one('click',function(){
          bimView.sidebar._dom.sidebar.find('.bar-more').removeClass('selected');
        });
      },10);
    },
    toggleMap:function(el){
      var self = this;
      el.toggleClass('bar-hideMap bar-showMap')
      self._dom.sidebar.toggleClass('hideMap');
    },
    loadMap:function(){
      var self = this,
          floorsStatue = axisGridStatue = false,
          floorsData,
          axisGridData;
      bimView.comm.ajax({
        type:'get',
        url:bimView.API.fetchFloors,
        etag:self._opt.etag,
        sourceId:self._opt.sourceId
      },function(res){
        floorsData = res.data.sort(function(a,b){
          return b.sort - a.sort;
        });
        floorsStatue = true;
        if(axisGridStatue){
          renderMap();
        }
      });
      bimView.comm.ajax({
        type:'get',
        url:bimView.API.fetchAxisGrid,
        etag:self._opt.etag
      },function(res){
        axisGridData = JSON.parse(res);
        axisGridStatue = true;
        if(floorsStatue){
          renderMap();
        }
      });
      function renderMap(){
        var floorSelect = self._dom.mapBar.find('.modelList');
        $.each(floorsData,function(i,item){
          item.Path=  bimView.API.baseUrl + "/model"+item.path;
          item.BoundingBox = item.boundingBox;
          var tmp = $('<li class="modelItem" data-type="miniMap"></li>').text(item.name).data(item);
          floorSelect.append(tmp);
        });
        self.obj.initMap('miniMap',self._dom.sidebar.find('.map'),axisGridData);
        self._dom.sidebar.find('.modelMap').append(self._dom.mapBar);
        self._dom.sidebar.find(".modelItem:eq(0)").trigger('click');
      }
    },
    viewTree:function(options){
      var defualts = {
        arr:[],
        name:'',
        code:'',
        type:'',
        dataType:'arr',
        children:'',
        childrenName:'',
        childrenType:'arr',
        data:'',
        rootName:'',
        isChecked:true
      },
      _opt = $.extend({},defualts,options),
      rootElement = $('<li class="itemNode" data-type="'+_opt.type+'">\
        <div class="itemContent">\
          <i class="m-openTree"></i>\
          <label class="treeCheckbox">\
            <input type="checkbox" checked="true">\
            <span class="m-lbl"></span>\
          </label>\
          <span class="treeText">'+_opt.rootName+'</span>\
        </div></li>');
      if(_opt.rootName){
        return rootElement.append(renderTree(_opt.arr,_opt.name,_opt.dataType));
      }else{
        return renderTree(_opt.arr,_opt.name,_opt.dataType);
      }
      function renderTree(arr,name,dataType,prefix){
        if(arr.length == 0) return;
        var tree = $('<div class="tree"></div>');
        $.each(arr,function(i,item){
          var type = _opt.type,
              itemName,data,iconStatus,input;
          if(dataType == 'arr'){
            itemName = item[name];
            data = item[_opt.data] ? item[_opt.data].toString() :'';
          }else{
            itemName = item;
            if(prefix!=null){
              data = prefix +"_"+ i;
            }else{
              data = i;
            }
          };
          if(item[_opt.children]){
            iconStatus = 'm-openTree';
          }else{
            iconStatus = 'noneSwitch';
          }
          if(_opt.isChecked){
           input = '<input type="checkbox" checked="checkde" />'
          }else{
            input = '<input type="checkbox" />'
          }
          var tmpHtml = $('<li class="itemNode" data-type="'+type+'">\
            <div class="itemContent">\
            <i class="'+iconStatus+'"></i>\
            <label class="treeCheckbox">'+input+'<span class="m-lbl"></span></label>\
            <span class="treeText">'+itemName+'</span>\
          </div></li>');
          tmpHtml.data('userData',data);
          if(item[_opt.children]&&typeof item[_opt.children] =="object"){
            var children = renderTree(item[_opt.children],_opt.childrenName,_opt.childrenType,item[_opt.code]);
            tmpHtml.append(children);
          }
          tree.append(tmpHtml);
        });
        return tree;
      }
    }
  }
})($);
