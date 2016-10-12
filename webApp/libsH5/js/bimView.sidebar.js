
/**
  * @require /libsH5/js/bimView.js
*/
'use strict'
;(function($){
  bimView.sidebar = {
    init:function(options,obj){
      var self = this;
      var modelBgColor = bimView.comm.getModelBgColor();
      self._dom={
        sidebar : $('<div class="modelSidebar"> <div class="modelMap"> <div class="map"></div> </div> <div class="modelFilter"> <div id="filter" class="modelTab"> <ul class="tree"> <li class="itemNode" id="specialty" data-type="sceneId"> <div class="itemContent"> <i class="m-openTree"></i> <label class="treeCheckbox"> <input type="checkbox" checked="true"> <span class="m-lbl"></span> </label> <span class="treeText">专业</span> </div> </li> <li class="itemNode" id="floors" data-type="sceneId"> <div class="itemContent"> <i class="m-openTree"></i> <label class="treeCheckbox"> <input type="checkbox" checked="true"> <span class="m-lbl"></span> </label> <span class="treeText">楼层</span> </div> </li> <li class="itemNode" id="category" data-type="categoryId"> <div class="itemContent"> <i class="m-openTree"></i> <label class="treeCheckbox"> <input type="checkbox" checked="true"> <span class="m-lbl"></span> </label> <span class="treeText">构件类型</span> </div> </li> <li class="itemNode" id="classCode" data-type="classCode"> <div class="itemContent"> <i class="m-openTree"></i> <label class="treeCheckbox"> <input type="checkbox" checked="true"> <span class="m-lbl"></span> </label> <span class="treeText">分类编码</span> </div> </li> </ul> </div> <div id="comment" class="modelTab"></div> <div id="selected" class="modelTab"><div class="headTab"><div class="tabItem cur">当前选中</div></div><div class="selectTree"></div></div> </div> </div>'),
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
      bimBox.addClass(modelBgColor);
      bimBox.append(self._dom.sidebar);
      bimView.isLoad = false;
      bimView.sidebar.filter();
      bimView.sidebar.loadMap();
    },
    filter:function(isSelected,viewer){

      var self = this;
      self.fileData = self.fileData || {};
      if(isSelected){
        self.el._dom.sidebar.addClass('open')
        self.el._dom.sidebar.find('#filter').show().siblings().hide();
        if(viewer){

          if(App.Project.currentQATab=="process"||
              App.Project.currentQATab=="open"||
              App.Project.currentQATab=="dis")
          {
            return
          }

          var specialty = bimView.comm.getFilters($("#specialty,#floors"),'uncheck');
          var category = bimView.comm.getFilters($("#category"),'uncheck');
          var classCode = bimView.comm.getFilters($("#classCode"),'uncheck');
          viewer.fileFilter(specialty);
          viewer.filter(category);
          viewer.filter(classCode);
          viewer.exitComment();
          viewer.filter({
            ids: ['10.01'],
            type: "classCode"
          })
        }
      }else{
        self.el._dom.sidebar.removeClass('open');
      }
      if(!bimView.isLoad){
        bimView.isLoad = true;
        bimView.comm.ajax({
          type:'get',
          url:bimView.API.fetchFloors,
          etag:self._opt.etag,
          sourceId:self._opt.sourceId
        },function(data){
          var data = data.data,
              _temp=[];
          var floors = bimView.comm.viewTree({
            arr:data,
            type:'sceneId',
            name:'floor',
            data:'fileEtags',
            id:'floors',
          });
          $.each(data,function(i,item){
            _temp=_temp.concat(item.fileEtags);
          })
          bimView.prototype.FloorsData=data;
          bimView.prototype.FloorFilesData=_temp;
          $('#floors').append(floors);
        });
        bimView.comm.ajax({
          type:'get',
          url:bimView.API.fetchSpecialty,
          etag:self._opt.etag,
          sourceId:self._opt.sourceId
        },function(data){
          var data = data.data,
              _temp={},_temp2={};
          $.each(data,function(i,item){
            var _t=[],_t2=[];
            $.each(item.files,function(j,file){
              self.fileData[file.fileEtag] = item.specialty;
              _t.push(file.fileEtag);
              _t2.push(file);
            })
            _temp[item.specialty]=_t;
            _temp2[item.specialty]=_t2;
          })
          bimView.prototype.SpecialtyFilesData=_temp;
          bimView.prototype.SpecialtyFileObjData=_temp2;
          bimView.prototype.SpecialtyFileSrcData=data;
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
          bimView.prototype.ComponentTypeFilesData=data;
          $('#category').append(category);
        });
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
          bimView.prototype.ClassCodeData= data.data;
          $('#classCode').append(classCode);
        });
      }
    },
    comment:function(isSelected,viewer){ 
      var self = this;
      self.el._dom.sidebar.find('#comment').show().siblings().hide();
      isSelected ? self.el._dom.sidebar.addClass('open') && viewer.commentInit() : self.el._dom.sidebar.removeClass('open');
    },
    selected:function(isSelected,viewer){
      var self = this;
      if(isSelected){
        self.el._dom.sidebar.addClass('open')
        self.el._dom.sidebar.find('#selected').show().siblings().hide();
        self.getSelected(viewer);
      }else{
        self.el._dom.sidebar.removeClass('open');
      }
      viewer.on('click',function(){
        if(!$("#selected").is(":hidden")){
          self.getSelected(viewer);
        }
      });
    },
    more:function(viewer){
      var self = this;
      var status = viewer.getTranslucentStatus();
      var modelBgColor = bimView.comm.getModelBgColor()
      self.el._dom.sidebar.find('.bar-translucent').toggleClass('selected',status);
      self.el._dom.sidebar.find('.m-color').attr('class','bar-item m-color '+modelBgColor).data('id',modelBgColor);
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
          item.Path=  bimView.API.baseUrl + "model"+item.path;
          item.BoundingBox = item.boundingBox;
          var tmp = $('<li class="modelItem" data-type="miniMap"></li>').text(item.name).data(item);
          floorSelect.append(tmp);
        });
        self.obj.initMap({
          name:'miniMap',
          element:self.el._dom.sidebar.find('.map'),
          axisGrid:axisGridData,
          callbackCameraChanged:function(res){
            self.obj.pub('changeGrid',res);
          }
        });
        self.el._dom.sidebar.find('.modelMap').append(self.el._dom.mapBar);
        self.el._dom.sidebar.find(".modelItem:eq(0)").trigger('click',true);
      }
    },
    getSelected:function(viewer,callback){
      var self = this;
      var selection = viewer.getSelectedIds();
      var data = []
      $.each(selection,function(i,item){
        data.push(i);
        if(data.length >1000)return false;
      });
      if(data.length>0){
        bimView.comm.ajax({
          type:'post',
          url:bimView.API.fetchComponentById,
          projectId:self._opt.projectId,
          projectVersionId:self._opt.projectVersionId||self._opt.projectId,
          data:"token=123&elementId="+data.join(',')
        },function(data){
          if(data.message == 'success' && data.data.length){
            bimView.comm.renderSelected(data.data);
            var viewData = {};
            var fileData = bimView.sidebar.fileData;
            $.each(data.data,function(i,item){
              var modelName = fileData[item.modelId]
              if(viewData[modelName]){
                if(viewData[modelName][item.cateName]){
                  viewData[modelName][item.cateName][item.id] = item.name;
                }else{
                  var __obj={};
                  __obj[item.id]=item.name;
                  viewData[modelName][item.cateName] = __obj;
                }
              }else{
                var __obj={},__obj2={};
                  __obj[item.id]=item.name;
                  __obj2[item.cateName]=__obj;
                viewData[modelName] = __obj2;
              }
            });
            if(callback)callback(viewData);
          }
        });
      }else{
        bimView.comm.renderSelected();
      }
    }
  }
})($);
