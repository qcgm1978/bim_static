/**
 * @require /BIMperformance/libsH5/js/bimView.js
 */
'use strict';
(function($) {
  bimView.prototype = {
    getAnnotationObject : function(viewer){
      var self = this;
      if (!self.annotationHelper3D)
      {
        self.annotationHelper3D = new CLOUD.Extensions.AnnotationHelper3D(self.viewer||viewer);
      }
      return self.annotationHelper3D;
    },
    
    getMakerObject : function(viewer){
      var self = this;
      self.viewer = self.viewer||viewer;
      if (!self.MarkerHelper)
      {
        self.MarkerHelper = new CLOUD.Extensions.MarkerHelper(self.viewer);
        // render 回调
        var renderCB = function(){
            self.MarkerHelper.renderMarkers();
        }
        self.viewer.addCallbacks("render", renderCB );
        // resize 回调
        var resizeCB = function(){
            self.MarkerHelper.resizeMarkers();
        }
        self.viewer.addCallbacks("render", resizeCB );
      }

      return self.MarkerHelper;
    },

    getMiniMapObject : function(viewer){
      var self = this;
      if (!self.MiniMapHelper)
      {
        self.MiniMapHelper = new CLOUD.Extensions.MiniMapHelper(self.viewer||viewer);
      }
      return self.MiniMapHelper;
    },

    on: function(event, fn) { //订阅
      this.subscribers[event] ? this.subscribers[event].push(fn) : (this.subscribers[event] = []) && this.subscribers[event].push(fn);
      return '{"event":"' + event + '","fn":"' + (this.subscribers[event].length - 1) + '"}';
    },
    pub: function(event, args) { //发布
      if (this.subscribers[event]) {
        for (var i = 0, len = this.subscribers[event].length; i < len; i++) {
          if (typeof(this.subscribers[event][i]) === 'function') {
            this.subscribers[event][i](args);
          }
        }
      }
    },
    off: function(subId) { //取消订阅
      try {
        var id = JSON.parse(subId);
        this.subscribers[id.event][id.fn] = null;
        delete this.subscribers[id.event][id.fn];
      } catch (err) {
        console.log(err);
      }
    },
    init: function(options) {
      var self = this;
      var _opt = options;
      _opt.element.html(_opt._dom.bimBox);

      var url,
        host = window.location.host;
      if (host == "bim.wanda-dev.cn" || host == "bim-uat.wanda-dev.cn" || host == "bim.wanda.cn") {
        url = "/static/dist/js/mpkWorker2.min.js";
      } else {
        url = "http://bim.wanda.cn/static/dist/js/mpkWorker2.min.js";
      } 

      // //外部引用
      // if (window.location.href.indexOf("wanda.") < 0 ) {
      //   url = "http://bim.wanda.cn/static/dist/js/mpkWorker.min.js";
      // } else {
      //   url = "/static/dist/js/mpkWorker.min.js";
      // }

      $.ajax({
        xhrField: {
          withCredentials: true
        },
        url: url,
        async: false


      }).done(function(data) {
        var workerJSBlob = new Blob([data], {
          type: "text/javascript"
        });
        //CLOUD.GlobalData.MpkWorkerUrl = window.URL.createObjectURL(workerJSBlob);
        CLOUD.GlobalData.MpkWorkerUrl = url;
      }).fail(function() {
        console.log("get error " + url);
      });

      CLOUD.GlobalData.SelectionColor = { color: 0x0000FF, opacity: 1, side: THREE.DoubleSide, transparent: false };
      switch (_opt.type) { // 判断类型
        case "model":
          self.viewer = bimView.model.model(_opt, self);
          self.annotationHelper3D= new CLOUD.Extensions.AnnotationHelper3D(self.viewer);
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
    destroy:function(){
        this.viewer.destroy();
    },
    regesiterEvent: function(options) {
      var self = this;
      var _opt = options;
      var loadEvent = {
        start: function(res) {
          _opt._dom.loading.append(_opt._dom.progress);
          _opt._dom.bimBox.append(_opt._dom.loading);
          _opt._dom.bimBox.append(_opt._dom.modelLoading.text('0%'));
        },
        loading: function(res) {
          var total = res.progress.total,
            loaded = res.progress.loaded,
            progress = loaded / total * 100;
          _opt._dom.progress.width(progress + '%');
          _opt._dom.modelLoading.text(parseInt(progress) + '%');
          if (progress == 100) {
            _opt._dom.loading.remove();
            _opt._dom.modelLoading.remove();
          }
          self.pub('loading', res);
        },
        loaded: function(res) {
          self.viewer.render();
          self.pub('loaded', res);
        },
        click: function(res) {
          self.pub('click', res);
        },
        empty: function(res) {
          //非 0  不用处理
          if (res.target.triangleCount>0) {
            return;
          }
          _opt._dom.bimBox.html('<div class="tips"><i class="icon"></i><span>无法三维预览，请下载查看</span></div>');
          self.pub('empty', res);
        }
      }
      self.on('start', loadEvent.start);
      self.viewer.registerEventListener(CLOUD.EVENTS.ON_SELECTION_CHANGED, loadEvent.click);
      self.viewer.registerEventListener(CLOUD.EVENTS.ON_LOAD_PROGRESS, loadEvent.loading);
      self.viewer.registerEventListener(CLOUD.EVENTS.ON_LOAD_COMPLETE, loadEvent.loaded);
      self.viewer.registerEventListener(CLOUD.EVENTS.ON_LOAD_EMPTYSCENE, loadEvent.empty);
      self.viewer.registerEventListener(CLOUD.EVENTS.ON_UPDATE_SELECTION_UI, function(evt) {
        var selectionUI;
        if (!self.selectionStatue) {
          selectionUI = $('<div class="selection"></div>');
          self._dom.bimBox.append(selectionUI);
          self.selectionStatue = true;
        } else {
          selectionUI = self._dom.bimBox.find('.selection');
        }
        if (evt.data.visible) {
          var data = evt.data;
          selectionUI.css({
            left: data.left,
            top: data.top,
            width: data.width,
            height: data.height,
            opacity: data.dit ? .5 : .1
          });
        } else {
          self.selectionStatue = false;
          selectionUI.remove();
        }
      });
    },
    controll: function() {
      var self = this;
      $('#lockAxisZ').click(function(){
        var selected = $(this).is('.selected');
        $(this).toggleClass('selected');
        if(selected){
          $(this).find('span').text('z轴未锁定')
        }else{
          $(this).find('span').text('z轴已锁定')
        }
        self.lockAxisZ(!selected);
      });
      self._dom.bimBox.on('click', '.bar-item', function() {
        // 工具条对应功能
        var $this = $(this),
          fn = $this.data('id'),
          group = $this.data('group'),
          isSelected = $this.is('.selected'),
          type = $this.data('type');
        switch (type) {
          case "viewer":
            self[fn]();
            break;
          case "view":
            self[fn]();
            break;
          case "pattern":
            $this.toggleClass('selected');
            if ($this.closest('.toolsBar').length > 0) {
              $this.closest('.toolsBar').find('[data-group=' + group + ']').not($this).removeClass('selected');
            } else {
              $this.siblings().removeClass('selected');
            }
            if (isSelected) {
              self.rotateMouse();
            } else {
              self[fn]();
            }
            break;
          case "mode":
            $this.toggleClass('selected');
            if ($this.closest('.toolsBar').length > 0) {
              $this.closest('.toolsBar').find('[data-group=' + group + ']').not($this).removeClass('selected');
            } else {
              $this.siblings().removeClass('selected');
            }
            if (isSelected) {
              fn=='setRectZoomMode'?self.rotateMouse():self[fn](false);
            } else {
              self[fn](true);
            }

            break;
          case "rotate":
            var className = $this.attr('class'),
              $parent = $this.parent().parent();
            $parent.attr('class', className);
            $this.closest('.toolsBar').find('[data-group=' + group + ']').not($this).removeClass('selected');
            self[fn]();
            break;
          case "status":
            $this.toggleClass('selected');
            self[fn](!isSelected);
            break;
          case "selected":
            $this.toggleClass('selected').siblings('[data-group=' + group + ']').removeClass('selected');
            if (fn) self[fn]();
            break;
          case "filter":
            $this.toggleClass('selected').siblings('[data-group=' + group + ']').removeClass('selected');
            bimView.sidebar[fn](!isSelected, self);
            break;
          case "more":
            $this.toggleClass('selected').siblings('[data-group=' + group + ']').removeClass('selected');
            if (fn == 'more') {
              var flag = self.getTranslucentStatus();
              $this.find('.m-translucent').toggleClass('selected', flag);
              bimView.sidebar[fn](self);
            }
            break;
          case "change":
            $this.toggleClass('m-miniScreen m-fullScreen')
            $(bimView.sidebar.el._dom.sidebar).toggleClass("hideMap");
            break;
          case "comment":
            $this.addClass('selected').siblings().removeClass('selected');
            self.setCommentType(fn);
            break;
          case "comment-color":
            $this.addClass('selected').siblings().removeClass('selected');
            var  parent= $this.parent().parent(),
                 precolor = parent.data('color'),
              colors = $this.data('color'),
              param = $this.data('param');
            parent.attr('data-color',colors);
            self.setCommentStyle({'stroke-color': param,'fil-color':param });
            break;
          case "color":
            var bar = bimView.model.colorBar;
            var content = $('<div class="colorBar"></div>')
            $.each(bar, function(i, item) {
              var tmpHtml = $('<i class="bar-item ' + item.icon + '" title="' + item.title + '" data-id="' + item.fn + '" data-type="' + item.type + '" data-group="' + item.group + '"></i>');
              if (fn && fn == item.fn || !fn && i == 0) {
                tmpHtml.addClass('selected')
              }
              content.append(tmpHtml);
            });
            var type;
            content.on('click', '.bar-item', function() {
              var $this = $(this),
                fn = $this.data('id');
              type = fn;
              $this.addClass('selected').siblings().removeClass('selected');
            })
            bimView.comm.dialog({
              title: "设置背景色",
              content: content,
              callback: function() {
                $this.attr('class', 'bar-item m-color ' + type).data('id', type);
                bimView.comm.setModelBgColor(type);
                self._dom.bimBox.attr('class', 'bim ' + type);
              }
            })
            break;
        }
      }).on('click', '.modelSelect .cur', function() {
        // 点击下拉
        var $this = $(this);
        $this.toggleClass('open');
      }).on('click', '.modelItem', function(event, flag) {
        // 点击下拉框选择
        var filterData = bimView.comm.filterData;
        var $this = $(this),
          $list = $this.parent(),
          data = $this.data(),
          text = $this.text(),
          $cur = $list.prev('.cur');
        $cur.removeClass('open').text(text);
        if (data.type == 'familyType') {
          self.filter({
            type: 'typeId',
            ids: bimView.comm.removeById(filterData, data.id)
          })
        } else {
          self.curFloor = text;
          self.curFloorData = data;
          self.setFloorMap(data, "miniMap", !flag);
        }
      }).on('click', '.m-openTree,.m-closeTree', function() {
        // 展开关闭树
        var $this = $(this),
          data = bimView.sidebar.classCodeData,
          $li = $this.closest('.itemNode'),
          type = $li.data('type'),
          isChecked = $this.next().find('input').prop('checked'),
          isSelected = $this.siblings('.treeText').is('.selected');
        $this.toggleClass('m-closeTree m-openTree')
        $li.toggleClass('open');
        if (type == 'classCode' && $li.has(".tree").length == 0) {
          var parent = $li.data();
          if (!parent.userData) parent.userData = null;
          var tmpArr = [];
          $.each(data, function(i, item) {
            if (item.parentCode == parent.userData) {
              tmpArr.push(item);
            }
          });
          var children = bimView.comm.viewTree({
            arr: tmpArr,
            type: 'classCode',
            name: 'name',
            data: 'code',
            children: 'isChild',
            isChecked: isChecked,
            isSelected: isSelected
          });
          $li.append(children);
        }
      }).on('change', 'input', function(e) {
        //filter变化
        var $this = $(this),
          $li = $this.closest('.itemNode'),
          type = $li.data('type'),
          parents = $this.parents('.itemNode'),
          flag = $this.prop('checked'),
          filter;
        $li.find("input").prop("checked", flag);
        if (type == "sceneId") {
          var filter = bimView.comm.getFilters($("#floors,#specialty"), 'uncheck');
          self.fileFilter(filter);
        } else {
          filter = bimView.comm.getFilters(parents, 'uncheck');
          self.filter(filter);
        }
        /*add by wuweiwei set filter checkbox state*/
        //console.log($(e.target).next()[0]);
        //console.log(document.defaultView.getComputedStyle($(e.target).next()[0] , "after").content);
        bimView.sidebar.scanFilterTreeCheckState($(e.target).next()[0]);

      }).on('click', '#filter .treeText', function() {
        // 选中高亮
        var $this = $(this),
          $li = $this.closest('.itemNode'),
          flag = $this.is('.selected'),
          data = $li.data();
        $li.find('.treeText').toggleClass('selected', !flag);
        var filter = bimView.comm.getFilters($li, 'all');
        flag ? self.downplay(filter) : self.highlight(filter);
      }).on('click', '.axisGrid', function() {
        if (!self.bigMap) {
          self.bigMap = $('<div id="map"></div>');
        }
        if (!self.footer) {
          self.footer = $('<label class="dialogLabel">X：<input type="text" class="dialogInput" id="axisGridX" /></label><label class="dialogLabel">Y：<input type="text" class="dialogInput" id="axisGridY" /></label>');
        }
        var data = self.curFloorData;
        bimView.comm.dialog({
          width: 800,
          title: '选择轴网',
          content: self.bigMap,
          footer: self.footer,
          callback: function() {
            var x = self.footer.find('#axisGridX').val(),
              y = self.footer.find('#axisGridY').val();
            self.setAxisGrid('bigMap', y, x);
          }
        });
        self.initMap({
          name: 'bigMap',
          element: self.bigMap,
          enable: false,
          callbackMoveOnAxisGrid: function(res) {
            self.footer.find('#axisGridX').val(res.numeralName);
            self.footer.find('#axisGridY').val(res.abcName);
          }
        });
        self.showAxisGrid('bigMap');
        self.setFloorMap(data, "bigMap");
      });
      $(window).on('resize', function() {
        self.resize();
      });
      $(document).on('click', function(event) {
        var $this = $(event.target);
        if (!$this.is('.bar-item[data-type=more]')) {
          $('.bar-item[data-type=more]').removeClass('selected');
        }
      });
      self.on('changeGrid', function(res) {
        var floors = self.curFloor;
        var infoX = res.axis.infoX ? res.axis.infoX + "," : "";
        var infoY = res.axis.infoY ? res.axis.infoY + "," : "";
        var infoZ = 'Z(' + floors + ',' + res.axis.offsetZ + ')';
        bimView.sidebar.el._dom.mapBar.find(".axisGrid").text(infoX + infoY + infoZ)
      });
    },
    // 以下是对模型操作
    resize: function(width, height) {
      // 缩放画板大小
      var self = this,
        _viewBox = self._dom.bimBox,
        _width = width || _viewBox.width(),
        _height = height || _viewBox.height();

        if (!$("#projectContainer .modelContainer").is(":hidden")) {
          self.viewer.renderer?self.viewer.resize(_width, _height):null;
        } 

    },
    fit: function() {
      // 缩放到选择构件
      var self = this;
      self.pub('fit');
      self.viewer.zoomToSelection();
    },
    // 模型操作模式
    zoom: function() {
      // 缩放模式
      var self = this;
      self._dom.bimBox.find(".view").attr('class', 'view zoom');
      self.pub('zoom');
      self.viewer.setZoomMode();
    },
    // 模型操作模式
    lockAxisZ: function(isLock) {
      // Z轴锁定模式
      var self = this;
      self.pub('lockAxisZ');
      self.viewer.lockAxisZ(isLock);
    },
    // 模型操作模式
    setRectZoomMode: function(isLock) {
      // 框选缩放
      var self = this;
      self._dom.bimBox.find(".view").attr('class', 'view');
      self.pub('setRectZoomMode');
      self.viewer.setRectZoomMode();
    },
    zoomToBox: function(box,margin,ratio) {
      // 缩放到指定位置
      var self = this;
      var viewer = self.viewer;
      viewer.zoomToBBox(CLOUD.Utils.computeBBox(box), margin||0.05, ratio||1.2);
      viewer.render();
    },
    zoomToBBoxWithOuterBox: function (box, outerBox, margin, ratio){
      var viewer = this.viewer;
      box=box[0].join(',')+","+ box[1].join(',');
      box=box.split(',');
      viewer.zoomToBBoxWithOuterBox(CLOUD.Utils.box3FromArray(box),
          CLOUD.Utils.mergeBBox(outerBox),margin,ratio);
    },
    setTopView: function(box,isMeger,margin,ratio) {
      var viewer = this.viewer;
      if(isMeger){
        viewer.setTopView(CLOUD.Utils.mergeBBox(box));
      }else{
        viewer.setTopView(CLOUD.Utils.computeBBox(box),margin||1.0,ratio||1);
      }
    },
    setAllView: function(box,margin,ratio) {
      var viewer = this.viewer;
      viewer.setTopView(CLOUD.Utils.mergeBBox(box),margin||1.0,ratio||1);
    },
    zoomToBuilding: function(margin, ratio) {
      // 缩放到指定位置
      var self = this;
      var viewer = self.viewer;
      viewer.zoomToBuilding(margin, ratio);
      viewer.render();
    },
    zoomToSelection: function(box) {
      // 缩放到当前选中构件
      var self = this;
      var viewer = self.viewer;
      viewer.zoomToSelection();
      viewer.render();
    },
    rotateCamera: function() {
      // 漫游模式
      var self = this;
      self._dom.bimBox.find(".view").attr('class', 'view fly');
      self.pub('fly');
      self.viewer.setFlyMode();
    },
    rotateMouse: function() {
      // 普通模式
      var self = this;
      self._dom.bimBox.find(".view").attr('class', 'view');
      self.pub('rotateMouse');
      self.viewer.setRectPickMode();
    },
    rotateObj: function() {
      // 普通模式
      var self = this;
      self._dom.bimBox.find(".view").attr('class', 'view');
      self.pub('rotateMouse');
      self.viewer.setRectPickMode(true);
    },
    home: function() {
      // 普通模式
      var self = this;
      self.pub('home');
      // self.viewer.setStandardView(CLOUD.EnumStandardView.ISO);
      self.viewer.goToInitialView();
      self.zoomToBuilding();

    },
    front: function() {
      var self = this,
        viewer = self.viewer;
      self.pub('front');
      viewer.setStandardView(CLOUD.EnumStandardView.Front);
    },
    behind: function() {
      var self = this,
        viewer = self.viewer;
      self.pub('behind');
      viewer.setStandardView(CLOUD.EnumStandardView.Back);
    },
    left: function() {
      var self = this,
        viewer = self.viewer;
      self.pub('left');
      viewer.setStandardView(CLOUD.EnumStandardView.Left);
    },
    right: function() {
      var self = this,
        viewer = self.viewer;
      self.pub('right');
      viewer.setStandardView(CLOUD.EnumStandardView.Right);
    },
    top: function() {
      var self = this,
        viewer = self.viewer;
      self.pub('top');
      viewer.setStandardView(CLOUD.EnumStandardView.Top);
    },
    bottom: function() {
      var self = this,
        viewer = self.viewer;
      self.pub('bottom');
      viewer.setStandardView(CLOUD.EnumStandardView.Bottom);
    },
    southEast: function() {
      var self = this,
        viewer = self.viewer;
      self.pub('southEast');
      viewer.setStandardView(CLOUD.EnumStandardView.SouthEast);
    },
    southWest: function() {
      var self = this,
        viewer = self.viewer;
      self.pub('southWest');
      viewer.setStandardView(CLOUD.EnumStandardView.SouthWest);
    },
    northEast: function() {
      var self = this,
        viewer = self.viewer;
      self.pub('northEast');
      viewer.setStandardView(CLOUD.EnumStandardView.NorthEast);
    },
    northWest: function() {
      var self = this,
        viewer = self.viewer;
      self.pub('northWest');
      viewer.setStandardView(CLOUD.EnumStandardView.NorthWest);
    },
    // 模型检查点
    markers: function() {
      // 进入添加检查点模式
      var self = this;
      var viewer = self.viewer;
      viewer.editMarkerBegin();
    },
    markerEnd: function() {
      // 退出检查点模式
      var self = this;
      var viewer = self.viewer;
      viewer.editMarkerEnd();
      self.rotateMouse();
    },
    saveMarkers: function() {
      // 保存检查点
      var self = this;
      var viewer = self.viewer;
      var list = viewer.getMarkerInfoList();
      var newList = [];
      $.each(list, function(i, item) {
        newList.push(JSON.stringify(item));
      });
      return newList;
    },
    loadMarkers: function(list) {
      // 加载检查点
      var self = this;
      var viewer = self.viewer;
      var newList = [];
      $.each(list, function(i, item) {
        newList.push(JSON.parse(item));
      });
      //viewer.setMarkerMode();//废弃 by wuweiwei
      self.getMakerObject().loadMarkers(newList);
    },
    // 批注
    comment: function(data) {
      // 进入批注模式
      console.log("批注：",data);
      var self = this;
      var viewer = self.viewer;
      var modelBgColor = self._dom.bimBox.css('background-color');
      //收起属性页
      $('.slideBar .icon-caret-right').click();
      //还原颜色
      self._dom.bimBox.addClass('comment');
      self.getAnnotationObject().editAnnotationBegin();
      //viewer.setCommentStyle({'stroke-color': 'red','fil-color':'red' });

      self.getAnnotationObject().setAnnotationBackgroundColor(modelBgColor);
      if (data) {
        var newList = [];
        $.each(data.list, function(i, item) {
          newList.push(JSON.parse(window.atob(item)));
        });
        self.getAnnotationObject().loadAnnotations(newList);
      }
      self.getAnnotationObject().setAnnotationType("0");
      bimView.model.comment(self._dom.bimBox);
    },
    commentEnd: function() {
      // 退出批注模式 
      var self = this;
      var viewer = self.viewer;
      self._dom.bimBox.removeClass('comment');
      self._dom.bimBox.find('.commentBar').remove();
      self.getAnnotationObject().editAnnotationEnd();
      self.rotateMouse();
    },
    setCommentType: function(type) {
      var self = this;
      // var viewer = self.viewer;
      self.getAnnotationObject().setAnnotationType(type);
    },
    setCommentStyle: function(style) {
      var self = this;
      // var viewer = self.viewer;
      self.getAnnotationObject().setAnnotationStyle(style);
    },
    saveComment: function() {
      // 保存批注
      var self = this;
      var viewer = self.viewer;
      var list = self.getAnnotationObject().getAnnotationInfoList();
      var newList = [];
      $.each(list, function(i, item) {
        newList.push(window.btoa(JSON.stringify(item)));
      });
      var files = bimView.comm.getFilters($("#floors,#specialty"), 'uncheck');
      var category = bimView.comm.getFilters($("#category"), 'uncheck');
      var classCode = bimView.comm.getFilters($("#classCode"), 'uncheck');
      return {
        camera: self.getCamera(),
        list: newList,
        image: viewer.canvas2image().substr(22),
        filter: {
          files: files,
          category: category,
          classCode: classCode
        }
      };
    },
    loadComment: function(data) {
      // 加载批注
      var self = this;
      var viewer = self.viewer;
      var newList = [];
      $.each(data.list, function(i, item) {
        newList.push(JSON.parse(window.atob(item)));
      });
      self.fileFilter(data.filter.files);
      self.filter(data.filter.category);
      self.filter(data.filter.classCode, function() {});
      self.getAnnotationObject().loadAnnotations(newList);
    },
    exitComment: function() {
      var self = this;
      var viewer = self.viewer;
      self.getAnnotationObject().uninitAnnotation();
    },
    // 模型过滤器
    filter: function(obj, callback) {
      // obj{type:"categoryId",ids:[id,id,id]},type为自定义属性,包括categoryId,classCode,sceneId
      var self = this;
      var viewer = self.viewer;
      var filter = viewer.getFilters();
      filter.removeUserFilter(obj.type);
      $.each(obj.ids, function(i, id) {
        filter.addUserFilter(obj.type, id);
      })
      viewer.render();
      callback && callback();
    },
    // 模型过滤器
    filterByUserIds: function(ids, callback) {
      // ids:[id,id,id]
      var self = this;
      var viewer = self.viewer;
      var filter = viewer.getFilters();
      filter.setFilterByUserIds(ids);
      viewer.render();
      callback && callback();
    },
    fileFilter: function(obj) {
      var self = this;
      var viewer = self.viewer;
      var filter = viewer.getFilters();
      //viewer.adjustSceneLoD(obj.total); 已废弃
      filter.removeFileFilter();
      $.each(obj.ids, function(i, id) {
        filter.addFileFilter(id)
      });
      viewer.render();
    },
    highlight: function(obj) {
      // 高亮
      var self = this;
      var viewer = self.viewer;
      var filter = viewer.getFilters();
      if (obj.type == "userId") {
        filter.setOverriderByUserIds('highlight', obj.ids, "lightBlue");
      } else {
        if (obj.ids == undefined) {
          filter.setUserOverrider(obj.type, undefined);
        } else {
          $.each(obj.ids, function(i, id) {
            filter.setUserOverrider(obj.type, id, "lightBlue");
          });
        }

      }
      viewer.render();
    },
    ignoreTranparent: function(obj) {
      // 高亮
      var self = this;
      var viewer = self.viewer;
      var filter = viewer.getFilters();
      if (obj.type == "userId") {
        filter.setOverriderByUserIds('highlight', obj.ids, null);
      } else {
        if (obj.ids == undefined) {
          filter.setUserOverrider(obj.type, undefined);
        } else {
          $.each(obj.ids, function(i, id) {
            filter.setUserOverrider(obj.type, id, null);
          });
        }

      }
      viewer.render();
    },
    downplay: function(obj) {
      var self = this;
      var viewer = self.viewer;
      var filter = viewer.getFilters();
      if (obj.type == "userId") {
        filter.setOverriderByUserIds('highlight', []);
      } else {
        $.each(obj.ids, function(i, id) {
          filter.removeUserOverrider(obj.type, id);
        });
      }
      viewer.render();
    },
    setSelectedIds: function(ids) {
      var self = this;
      var viewer = self.viewer;
      var filters = viewer.getFilters();
      filters.setSelectedIds(ids);
    },
    getSelectedIds: function() {
      var self = this;
      var viewer = self.viewer;
      var filters = viewer.getFilters();
      return filters.getSelectionSet();
    },
    collision: function(idA, idB) {
      // 碰撞
      var self = this;
      var viewer = self.viewer;
      var filter = viewer.getFilters();
      filter.setOverriderByUserIds('collisionA', [idA], 'darkRed');
      filter.setOverriderByUserIds('collisionB', [idB], 'lightBlue');
      viewer.render();
    },
    setOverrider: function(name, ids) {
      var self = this;
      var viewer = self.viewer;
      var filter = viewer.getFilters();
      filter.setOverriderByUserIds(name, ids, name);
      viewer.render();
    },
    translucent: function(flag) {
      // 半透明
      var self = this;
      var viewer = self.viewer;
      var filter = viewer.getFilters();
      filter.enableSceneOverrider(flag);
      viewer.render();
    },
    getTranslucentStatus: function() {
      // 获取半透明状态
      var self = this;
      var viewer = self.viewer;
      var filter = viewer.getFilters();
      return filter.isSceneOverriderEnabled();
    },
    isolate: function() {
      var self = this;
      var viewer = self.viewer;
      var filter = viewer.getFilters();
      //filter.setHideUnselected(!filter.isHideUnselected());
      filter.setHideUnselected(true);
      viewer.render();
    },
    showAll: function() {
      //恢复
      var self = this;
      var viewer = self.viewer;
      var filter = viewer.getFilters();
      if(App.Project){
        if(App.Project.ProjectContainer){
          var ProjectContainer = new App.Project.ProjectContainer;
          ProjectContainer.resetProperNull();
        }else{
          App.Project.resetModelNull();
        }
        // if(App.Project.ProjectContainer){
        //   var ProjectContainer = new App.Project.ProjectContainer;
        //   ProjectContainer.resetProperNull();
        // }else{
        //   var ProjectContainer = new App.Project.ProjectContainer;
        //   ProjectContainer.resetProperNull();
        // }
        
      }
      if(App.Index){
        App.Index.setAttrNull();
      }
      if(App.ResourceModel){
        var ListNav = new App.ResourceModel.ListNav;
        ListNav.resetProperNull();
      }
      filter.revertAll();
      self.filter({
        ids:['10.01'],
        type:"classCode"
      })
      viewer.render();
      $('#isolation').hide();

    },
    setHideSelected: function() {
      //隐藏选中构件
      var self = this;
      var viewer = self.viewer;
      var filter = viewer.getFilters();
      //filter.setHideSelected(!filter.isHideSelected());
      filter.setHideSelected(true);
      viewer.render();
    },
    setTranslucentSelected : function() {
      //半透明选中构件
      var self = this;
      var viewer = self.viewer;
      var filter = viewer.getFilters();
      //filter.setTranslucentSelected(!filter.isTranslucentSelected());
      filter.setTranslucentSelected(true);

      viewer.render();
    },
    setTranslucentUnselected : function() {
      //半透明未选中构件
      var self = this;
      var viewer = self.viewer;
      var filter = viewer.getFilters();
      //filter.setTranslucentUnselected(!filter.isTranslucentUnSelected());
      filter.setTranslucentUnselected(true);
      filter.enableSceneOverrider(true);
      viewer.render();
    },
    initMap: function(options) {
      var defaults = {
          element: '',
          name: 'defaultMap',
          axisGrid: '',
          enable: true,
          callbackCameraChanged: null,
          callbackMoveOnAxisGrid: null
        },
        _opt = $.extend({}, defaults, options);
      // 初始化小地图
      var self = this,
        viewer = self.viewer,
        _el = _opt.element,
        _width = _el.width(),
        _height = _el.height(),
        _css = {
          left: '0px',
          bottom: '0px',
          outline: 'none',
          position: 'relative'
        };
      if (_opt.axisGrid) self.getMiniMapObject().setAxisGridData(_opt.axisGrid)
      //viewer.createMiniMap(_opt.name, _el[0], _width, _height, _css, _opt.callbackCameraChanged, _opt.callbackMoveOnAxisGrid);
      self.getMiniMapObject().createMiniMap(_opt.name, _el[0], _width, _height, _css, _opt.callbackCameraChanged, _opt.callbackMoveOnAxisGrid);
      self.getMiniMapObject().enableAxisGridEvent(_opt.name, _opt.enable);
      self.getMiniMapObject().generateAxisGrid(_opt.name);
    },
    setAxisGrid: function(name, x, y) {
      var viewer = this.viewer;
      viewer.flyBypAxisGridNumber(name, x, y);
    },
    setFloorMap: function(obj, name, flag) {
      // 设置小地图
      var viewer = this.viewer;
      this.getMiniMapObject().setFloorPlaneData(obj);
      this.getMiniMapObject().generateFloorPlane(name, flag);
    },
    showAxisGrid: function(name) {
      var viewer = this.viewer;
      viewer.showAxisGrid(name, true);
    },
    load: function(etag) {
      // 加载场景
      var viewer = this.viewer;
      var client = viewer.load(etag, bimView.API.baseUrl + bimView.API.fetchModel);
      viewer.render();
      return client;
    },
    showScene: function(client, flag) {
      // 显示隐藏场景
      var viewer = this.viewer;
      if (viewer && viewer.showScene) {
        viewer.showScene(client, flag);
        viewer.render();
      }
    },
    getCamera: function() {
      var viewer = this.viewer;
      return window.btoa(viewer.getCamera());
    },
    setCamera: function(json) {
      var viewer = this.viewer;
      viewer.setCamera(window.atob(json));
    },
    commentInit: function() {
      console.log($('#comment'))
    }
  }
})($);