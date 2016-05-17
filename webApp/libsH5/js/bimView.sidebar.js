/**
  * @require /libsH5/js/bimView.js
*/
'use strict'
;(function($){
  bimView.sidebar = {
    _dom:{
      sidebar : $('<div class="modelSidebar"><div class="modelMap"><div class="map"></div></div><div class="modelFilter"><div id="filter" class="modelTab">filter</div><div id="comment" class="modelTab">comment</div><div id="selected" class="modelTab">selected</div></div></div>'),
      modelBar : $('<div class="toolsBar"></div>'),
      mapBar:$('<div class="footBar"><div class="modelSelect"><span class="cur"></span><div class="modelList"></div></div><div class="axisGrid"></div></div>')
    },
    init:function(options,obj){
      var self = this;
      self._opt = options;
      self.obj = obj;
      var bimBox = self._opt._dom.bimBox
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
          return a.sort - b.sort;
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
          item.Path=  serverUrl + "/model"+item.path;
          var tmp = $('<li class="modelItem"></li>').text(item.name).data(item);
          floorSelect.append(tmp);
        });
        self.obj.initMap('nimiMap',self._dom.sidebar.find('.map'),axisGridData,floorsData[0]);
        self._dom.sidebar.find('.modelMap').append(self._dom.mapBar);
      }
    }
  }
})($);
