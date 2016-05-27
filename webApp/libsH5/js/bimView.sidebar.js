/**
  * @require /libsH5/js/bimView.js
*/
'use strict'
;(function($){
  bimView.sidebar = {
    init:function(options,obj){
      var self = this;
      self._dom={
        sidebar : $('<div class="modelSidebar"> <div class="modelMap"> <div class="map"></div> </div> <div class="modelFilter"> <div id="filter" class="modelTab"> <ul class="tree"> <li class="itemNode" id="specialty" data-type="sceneId"> <div class="itemContent"> <i class="m-openTree"></i> <label class="treeCheckbox"> <input type="checkbox" checked="true"> <span class="m-lbl"></span> </label> <span class="treeText">专业</span> </div> </li> <li class="itemNode" id="floors" data-type="sceneId"> <div class="itemContent"> <i class="m-openTree"></i> <label class="treeCheckbox"> <input type="checkbox" checked="true"> <span class="m-lbl"></span> </label> <span class="treeText">楼层</span> </div> </li> <li class="itemNode" id="category" data-type="categoryId"> <div class="itemContent"> <i class="m-openTree"></i> <label class="treeCheckbox"> <input type="checkbox" checked="true"> <span class="m-lbl"></span> </label> <span class="treeText">构件类型</span> </div> </li> <li class="itemNode" id="classCode" data-type="classCode"> <div class="itemContent"> <i class="m-openTree"></i> <label class="treeCheckbox"> <input type="checkbox" checked="true"> <span class="m-lbl"></span> </label> <span class="treeText">分类编码</span> </div> </li> </ul> </div> <div id="comment" class="modelTab">comment</div> <div id="selected" class="modelTab">selected</div> </div> </div>'),
        modelBar : $('<div class="toolsBar"></div>'),
        mapBar:$('<div class="footBar"><div class="modelSelect"><span class="cur"></span><div class="modelList"></div></div><div class="axisGrid"></div></div>')
      }
      bimView.sidebar._opt = options;
      bimView.sidebar.obj = obj;
      bimView.sidebar.el = self;
      var bimBox = bimView.sidebar._opt._dom.bimBox;
      $.each(bimView.model.modelBar,function(i,item){
        var tmpHtml;
        if(item.type == 'more'){
          tmpHtml = $('<div class="bar-item '+item.icon+'" title="'+item.title+'" data-id="'+item.fn+'" data-type="'+item.type+'" data-group="'+item.group+'"></div>');
        }else{
          tmpHtml = $('<i class="bar-item '+item.icon+'" title="'+item.title+'" data-id="'+item.fn+'" data-type="'+item.type+'" data-group="'+item.group+'"></i>');
        }
        item.keyCode&&bimView.comm.bindEvent.on(item.keyCode,tmpHtml);
        self._dom.modelBar.append(tmpHtml);
        if(item.subBar&&item.subBar.length>0){
          var subBar = $('<div class="subBar"></div>')
          $.each(item.subBar,function(index,barItem){
            var subItem = $('<i class="bar-item '+barItem.icon+'" title="'+barItem.title+'" data-id="'+barItem.fn+'" data-type="'+barItem.type+'" data-group="'+barItem.group+'"></i>');
            barItem.keyCode&&bimView.comm.bindEvent.on(barItem.keyCode,subItem);
            subBar.append(subItem);
          });
          tmpHtml.append(subBar);
        }
      });
      self._dom.sidebar.find('.modelMap').prepend(self._dom.modelBar);
      bimBox.append(self._dom.sidebar);
      bimView.sidebar.loadMap();
    },
    filter:function(isSelected){
      var self = this;
      isSelected ? self.el._dom.sidebar.addClass('open') : self.el._dom.sidebar.removeClass('open');
      self.el._dom.sidebar.find('#filter').show().siblings().hide();
      if(!self.floorsStatue){
        self.floorsStatue = true;
        bimView.comm.ajax({
          type:'get',
          url:bimView.API.fetchFloors,
          etag:self._opt.etag,
          sourceId:self._opt.sourceId
        },function(data){
          var data = data.data;
          var floors = bimView.comm.viewTree({
            arr:data,
            type:'sceneId',
            name:'floor',
            data:'fileEtags',
            id:'floors',
          });
          $('#floors').append(floors);
        });
      }
      if(!self.specialtyStatue){
        self.specialtyStatue = true;
        bimView.comm.ajax({
          type:'get',
          url:bimView.API.fetchSpecialty,
          etag:self._opt.etag,
          sourceId:self._opt.sourceId
        },function(data){
          var data = data.data;
          var specialties = bimView.comm.viewTree({
            arr:data,
            type:'sceneId',
            name:'specialty',
            children:'files',
            childrenName:'fileName',
            data:'fileEtag',
            id:'specialty',
          });
          $('#specialty').append(specialties);
        });
      }
      if(!self.categoryStatue){
        self.categoryStatue = true;
        bimView.comm.ajax({
          type:'get',
          url:bimView.API.fetchCategory,
          etag:self._opt.etag,
          sourceId:self._opt.sourceId
        },function(data){
          var data = data.data;
          var category = bimView.comm.viewTree({
            arr:data,
            type:'categoryId',
            name:'specialty',
            code:'specialtyCode',
            children:'categories',
            childrenType:'json',
          });
          $('#category').append(category);
        });
      }
      if(!self.classCodeStatue){
        self.classCodeStatue = true;
        bimView.comm.ajax({
          type:'get',
          url:bimView.API.fetchCoding,
          etag:self._opt.etag,
          sourceId:self._opt.sourceId
        },function(data){
          self.classCodeData = data.data;
          var classCode = bimView.comm.viewTree({
            type:'classCode',
            rootName:'分类编码'
          });
          $('#classCode').append(classCode);
        });
      }
    },
    comment:function(isSelected){
      var self = this;
      isSelected ? self.el._dom.sidebar.addClass('open') : self.el._dom.sidebar.removeClass('open');
      self.el._dom.sidebar.find('#comment').show().siblings().hide();
    },
    selected:function(isSelected){
      var self = this;
      isSelected ? self.el._dom.sidebar.addClass('open') : self.el._dom.sidebar.removeClass('open');
      self.el._dom.sidebar.find('#selected').show().siblings().hide();
    },
    more:function(viewer){
      var self = this;
      var status = viewer.getTranslucentStatus();
      self.el._dom.sidebar.find('.bar-translucent').toggleClass('selected',status);
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
        url:bimView.API.fetchFloorsMap,
        etag:self._opt.etag,
        sourceId:self._opt.sourceId
      },function(res){
        if(res.message == "success"){
          floorsData = res.data.sort(function(a,b){
            return b.sort - a.sort;
          });
          floorsStatue = true;
          if(axisGridStatue){
            renderMap();
          }
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
        var floorSelect = self.el._dom.mapBar.find('.modelList');
        $.each(floorsData,function(i,item){
          item.Path=  bimView.API.baseUrl + "/model"+item.path;
          item.BoundingBox = item.boundingBox;
          var tmp = $('<li class="modelItem" data-type="miniMap"></li>').text(item.name).data(item);
          floorSelect.append(tmp);
        });
        self.obj.initMap({
          name:'miniMap',
          element:self.el._dom.sidebar.find('.map'),
          axisGrid:axisGridData,
          callback:function(res){
            self.obj.pub('changeGrid',res);
          }
        });
        self.el._dom.sidebar.find('.modelMap').append(self.el._dom.mapBar);
        self.el._dom.sidebar.find(".modelItem:eq(0)").trigger('click');
      }
    }
  }
})($);
