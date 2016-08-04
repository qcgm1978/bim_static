; /* dwg viewer */
'use strict';
var dwgViewer = function(options) {
  var self = this;
  var defaults = {
    element: '',
    maxLevel: 11,
    ext: 'jpg',
    sourceId: ''
  };
  self._opt = $.extend({}, defaults, options);
  var serverUrl = '/model/' + self._opt.sourceId + '/manifest.json';
  $.ajax({
    url: serverUrl,
    success: function(res) {
      var data = JSON.parse(res);
      data.Views && getDwg(data.Views);
    }
  });
  var getDwg = function(res) {
    var modelTab = [],
      currentFile,
      container = $('<div class="bim"></div>');
    $.each(res, function(i, item) {
      modelTab.push({
        name: item.Name,
        id: item.ID,
        res: item.Representations
      });
    });
    self._opt.element.append(container);
    self.addControll(modelTab, container);
  }
  var dwgView = self.dwgView = {

    __container: null,

    __options: null,

    __unit: 512,

    __state: 'none', //none:无状态，rectzoom:窗口缩放

    __rect: null,

    __defaultTileURL: '//static.glodon.com/yun/resources/images/databag/tile-default.jpg',

    __curLevel: 1,

    __zoomFact: 1.6, //缩放因子

    __zoomScale: 1, //当前缩放规模

    __canMove: false,

    __startPos: null,

    __startPoint: null,

    __endPoint: null,

    __startDistance: null, //缩放开始距离

    __endDistance: null, //缩放结束距离

    __startScale: null, //缩放开始时的比例

    __moveLevel: null, //移动中记录下计算好的level值

    __viewWidth: 0,

    __viewHeight: 0,

    __viewLeft: 0, //视口的left，这个是当前视口的left偏移量，和视口中心点的坐标要区分，view panel设置的是中心的点left,top

    __viewTop: 0, //解释如上

    __sceneInViewPoint: {}, //场景在view点的坐标，left，top百分比

    __mouseInViewPoint: {
      left: 0,
      top: 0
    }, //以鼠标哪个位置来进行缩放，如果是屏幕中间，就直接设置下

    __imgObjCache: [],

    __zoomStart: null,

    __zoomDelta: 800,

    __zoomTimer: null,

    __pinchStart: null,

    __pinchDelta: 2000,

    __pinchTimer: null,

    init: function(container, options) {
      var self = this
      self.__container = container
      self.__options = $.extend({
        lod: {
          maxLevel: 11,
          ext: '',
          url: ''
        }
      }, options)

      self.__panel && self.__panel.remove()

      self.__panel = $(self.__tpl).appendTo(self.__container)

      self.__rect = self.__panel.find('.rect')

      self.__viewWidth = container.width()
      self.__viewHeight = container.height()

      var lod = self.__options.lod
      self.__firstImgUrl = lod.url + '/L1/Model_0_0.' + lod.ext,
        self.fit()
      self.__bindEvent()
      self.__initComment();
    },

    //初始化批注
    __initComment: function() { 
    
      var  toolBarHtml;

      if (App.Project.templateUrl) {
        toolBarHtml = App.Project.templateUrl('/libsH5/tpls/comment/dwgCommentToolBar.html')
      }

      $("#modelBox .bim").append(toolBarHtml);

      //设置批注容器
      var dwgHelper = this.dwgHelper = new CLOUD.Extensions.DwgHelper();

      dwgHelper.setDomContainer($("#modelBox .bim")[0]);

      //初始化批注事件
      this.__initCommentEvent();

    },

    //开始批注
    commentInit() {

      //清空批注
      var dwgHelper = this.dwgHelper,
        $view = $("#modelBox .view"),
        pos = {
          y: parseInt($view.css("top")),
          x: parseInt($view.css("left")),
        };
      //清空数据重新开始
      dwgHelper.clearAnnotations();
      dwgHelper.editAnnotationBegin(pos);
      this.pos = pos; 
     
      $("#modelBox .bim .commentBar").removeClass("hide");


    },

    //工具类型
    __commentToolBarType: {
      0: CLOUD.Extensions.Annotation.shapeTypes.ARROW,
      1: CLOUD.Extensions.Annotation.shapeTypes.RECTANGLE,
      2: CLOUD.Extensions.Annotation.shapeTypes.CIRCLE,
      3: CLOUD.Extensions.Annotation.shapeTypes.CROSS,
      4: CLOUD.Extensions.Annotation.shapeTypes.CLOUD,
      5: CLOUD.Extensions.Annotation.shapeTypes.TEXT
    },

    //批注事件初始化
    __initCommentEvent: function() {

      var that = this;
      //设置不同的工具
      $("#modelBox .bim .commentBar").on("click", ".bar-item", function() {

        var $this = $(this);

        $this.addClass("selected").siblings().removeClass("selected");

        that.dwgHelper.setAnnotationType(that.__commentToolBarType[$this.data("id")]);

      })
    },

    //获取批注数据
    getCommentData: function(callback) {

      var that = this,
        dwgHelper = this.dwgHelper;

      //获取图片data
      dwgHelper.canvas2image(function(imgData) {

        //相机位置
        var camera = JSON.stringify({
          pos: that.pos,
          zoomScale: that.__zoomScale
        });

        var data = {
          image: imgData,
          camera: camera
        }

        if ($.isFunction(callback)) {
          callback(data);
        }

      });

    },

    getPanel: function() {
      return this.__panel
    },

    setState: function(state) {
      this.__state = state
    },

    getViewInfo: function() {
      var self = this
      var zoomScale = self.__zoomScale
      var unit = self.__unit
      return {
        view: {
          width: self.__viewWidth,
          height: self.__viewHeight,
          top: self.__viewTop,
          left: self.__viewLeft
        },
        scene: {
          width: unit * zoomScale,
          height: unit * zoomScale,
          scale: self.__zoomScale
        }
      }
    },

    windowResize: function() {
      var self = this
      var container = self.__container
      self.__viewWidth = container.width()
      self.__viewHeight = container.height()
      self.zoom(self.__zoomScale)
    },

    //画缩放框
    drawRect: function(width, height) {
      var self = this;

      self.__rect.css({
        width: width,
        height: height
      })
    },

    //窗口缩放
    rectZoom: function() {
      var self = this
      var rect = self.__rect

      if (rect.is(':hidden')) return false
      var position = rect.position()
      var tw = self.__viewWidth
      var th = self.__viewHeight
      var w = rect.width()
      var h = rect.height()
      var zoomScale = self.__zoomScale
      var fact = 1

      if (w < 10 || h < 10) {
        rect.css({
          width: 0,
          height: 0
        }).hide()
        return false
      }

      if (tw / th > w / h) {
        fact = th / h
      } else {
        fact = tw / w
      }

      zoomScale = zoomScale * fact
      var o
      var point = {
        top: position.top + h / 2,
        left: position.left + w / 2
      }


      rect.css({
        width: 0,
        height: 0
      }).hide()

      self.zoom(zoomScale, point)
    },

    pan: function(x, y) {
      var self = this
      var panel = self.__panel

      self.__viewLeft = self.__startPos.left - x
      self.__viewTop = self.__startPos.top - y

      //self.__removeLast()

      self.__resetSceneInViewPoint()
      self.__changeViewPos()

      /*$.jps.publish('dwg-pan', {
        width: self.__viewWidth,
        height: self.__viewHeight,
        top: self.__viewTop,
        left: self.__viewLeft
      })*/
    },

    //放大
    zoomIn: function(mousePoint) {

      var self = this

      var zoomScale = (self.__zoomScale * self.__zoomFact) //.toFixed(2)

      self.zoom(zoomScale, mousePoint)
    },

    //缩小
    zoomOut: function(mousePoint) {
      var self = this
      var zoomScale = (self.__zoomScale / self.__zoomFact) //.toFixed(2)

      self.zoom(zoomScale, mousePoint)
    },

    //回到第一层并自适应
    fit: function() {
      var self = this
      self.__curLevel = 1
      self.__zoomScale = 1

      self.__viewLeft = 0
      self.__viewTop = 0

      self.__viewPoint()

      self.__genTiles()
    },
    zoom: function(zoomScale, mousePoint) {
      var self = this
      var panel = self.__panel
      var options = self.__options
      var viewPanel = panel.find('.view')
      var unit = self.__unit
      var curLevel = self.__curLevel
      var lod = options.lod
      var minisite = self.__minisite

      if (zoomScale <= 1) {
        zoomScale = 1
        curLevel = 1
      } else {
        //如果放大比例比当前的比例大
        var level = Math.log(zoomScale) / Math.log(2)
        var curLevel = parseInt(level, 10) + 2
      }

      //如果增加后的比最大的还大
      if (curLevel >= lod.maxLevel) {
        var maxScale = Math.pow(2, lod.maxLevel - 1)
        if (zoomScale >= maxScale) {
          zoomScale = maxScale
        }
        curLevel = lod.maxLevel
      }

      //正在的缩放比例，主要是放大到最大的时候可能不是zoomFact(1.6)的倍数
      var scaleFact = zoomScale / self.__zoomScale


      //先把原始图片放大，产生模糊的效果
      viewPanel.find('.tile').each(function() {
        var item = $(this)

        var level = item.data('level')
          //计算当前比例下图片的大小
        var unitScale = self.__zoomScale / Math.pow(2, level - 1)
        item.css({
          width: unit * unitScale * scaleFact,
          height: unit * unitScale * scaleFact
        })
      })

      //如果是缩小则添加第一级的图片
      if (!minisite && zoomScale < self.__zoomScale) {
        var tile = $(_.template(self.__tileTpl)({
          tile: {
            row: 0,
            col: 0,
            level: 1,
            src: self.__firstImgUrl
          }
        })).css({
          width: unit * zoomScale,
          height: unit * zoomScale,
          'z-index': 0
        })
        viewPanel.append(tile)
      }

      //调整缩放参照点
      if (mousePoint) {
        self.__mouseInViewPoint = mousePoint
      } else {
        self.__mouseInViewPoint = {
          left: self.__viewWidth / 2,
          top: self.__viewHeight / 2
        }
      }

      self.__resetSceneInViewPoint()

      self.__zoomScale = zoomScale

      self.__viewPoint(true)

      if (minisite) {
        self.__moveLevel = curLevel
        return
      }

      self.__curLevel = curLevel

      //状态已经改变，没有加载完成的图片不进行处理
      self.__stateChange()

      var zoomStart = self.__zoomStart
      var zoomDelta = self.__zoomDelta
      var now = new Date()
      window.clearTimeout(self.__zoomTimer)

      if (!zoomStart) {
        zoomStart = new Date()
      } else {
        if (now.getTime() - zoomStart.getTime() >= zoomDelta) {
          self.__zoomEvent()
        } else {
          self.__zoomTimer = window.setTimeout(function() {
            self.__zoomEvent()
          }, zoomDelta)
        }
      }

      self.__zoomStart = zoomStart
        // $.jps.publish('dwg-zoom')
    },

    __zoomEvent: function() {
      var self = this
      self.__genTiles()

      self.__viewPoint(true)

      self.__zoomStart = null
    },

    __removeLast: function() {
      var self = this
      var viewPanel = self.__panel.find('.view')

      viewPanel.find('.tile.past').remove()
    },

    __bindEvent: function() {
      var self = this
      var panel = self.__panel
      var rect = self.__rect
      var scale = self.__zoomScale

      $(window).resize(function() {
        self.windowResize()
      })

      //point是外面触发了mousedown传给该事件的值
      panel.mousedown(function(evt, point) {
        var state = self.__state
        scale = self.__zoomScale
        evt = point || evt
        self.__canMove = true
        panel.css({
          cursor: 'pointer'
        })

        var point = self.__startPoint = self.__getEventPoint(evt)
        self.__startPos = {
          top: self.__viewTop,
          left: self.__viewLeft
        }

        if (state == 'rectzoom') {
          var position = self.__container.offset();
          rect.css({
            top: point.y - position.top,
            left: point.x - position.left
          }).show()
        }
        return false
      }).mouseup(function(evt) {
        var state = self.__state
        self.__canMove = false
        panel.css({
          cursor: 'default'
        })

        self.__startPoint = null
        self.__endPoint = null

        switch (state) {
          case 'none':
            //状态已经改变，没有加载完成的图片不进行处理
            self.__stateChange()
            self.__genTiles()
            break
          case 'rectzoom':
            self.rectZoom()
            break;
        }
        return false
      }).mouseleave(function(evt) {
        $(this).trigger('mouseup')
      }).mousemove(function(evt) {
        var state = self.__state
        if (!self.__canMove) return false
        var endPoint = self.__endPoint = self.__getEventPoint(evt)
        var startPoint = self.__startPoint
        var w = endPoint.x - startPoint.x
        var h = endPoint.y - startPoint.y
        if ((Math.abs(w) > 10) || (Math.abs(h) > 10)) {
          switch (state) {
            case 'none':
              self.pan(w, h)
              break
            case 'rectzoom':
              self.drawRect(w, h)
              break
            case 'zoom':
              if (h > 20 || h < -20) {
                var newScale = -h / 200 + scale
                newScale = newScale < 1 ? 1 : newScale;
                self.zoom(newScale);
              }
              break
          }

        }

        return false
      }).mousewheel(function(evt, point) {
        if (typeof point == 'object') {
          evt = point
        }
        self.__wheelEvent(evt)
      })
    },

    __wheelEvent: function(evt) {
      var self = this
      var offsetX = evt.offsetX
      var offsetY = evt.offsetY
      var scale = self.__zoomScale;
      self.zoom(scale + evt.deltaY);
    },

    /**
     * 在改变view位置的时候先调整view的位置到鼠标点位置，默认是屏幕中心
     * @param isInited,是否初始化完成了。
     * @private
     */
    __viewPoint: function(isInited) {
      var self = this
      var unit = self.__unit
      var zoomScale = self.__zoomScale

      var viewWidth = self.__viewWidth
      var viewHeight = self.__viewHeight
      var tileWidth = unit * zoomScale
      var tileHeight = tileWidth


      if (!isInited) {
        //第一次加载
        self.__viewLeft = (tileWidth - viewWidth) / 2
        self.__viewTop = (tileHeight - viewHeight) / 2

        self.__mouseInViewPoint = {
            left: viewWidth / 2,
            top: viewHeight / 2
          }
          //初始化场景在视口中间点的坐标百分比
        self.__resetSceneInViewPoint()

        self.__changeViewPos()
        return false
      }

      var viewLeft = self.__viewLeft
      var viewTop = self.__viewTop

      var sceneInViewPoint = self.__sceneInViewPoint
      var mouseInViewPoint = self.__mouseInViewPoint

      var scenePointLeft = zoomScale * unit * sceneInViewPoint.left
      var scenePointTop = zoomScale * unit * sceneInViewPoint.top

      viewLeft = scenePointLeft - mouseInViewPoint.left
      viewTop = scenePointTop - mouseInViewPoint.top


      self.__viewLeft = viewLeft
      self.__viewTop = viewTop
      self.__changeViewPos()
    },

    /**
     * 改变view的位置
     * @private
     */
    __changeViewPos: function() {
      var self = this
      var panel = self.__panel
      var zoomScale = self.__zoomScale
      var curLevel = self.__curLevel
      var unit = self.__unit

      var viewPanel = panel.find('.view')
      var viewLeft = self.__viewLeft
      var viewTop = self.__viewTop

      var viewCenterTop = self.__viewHeight / 2 + viewTop
      var viewCenterLeft = self.__viewWidth / 2 + viewLeft
        //把view的位置设置到屏幕中间，view的top,left是视口的左上角的坐标。特别注意
      viewPanel.css({
        top: viewCenterTop,
        left: viewCenterLeft
      })

      var scenePanel = panel.find('.scene')

      //为了让view在可视范围，需要调整场景的位置。
      scenePanel.css({
        top: -viewTop,
        left: -viewLeft
      })


      //改变图片的位置
      viewPanel.find('.tile').each(function(idx, item) {
        var item = $(item)
        var factUnit = unit * zoomScale / Math.pow(2, item.data('level') - 1)
        var col = item.data('col')
        var row = item.data('row')
        var top = row * factUnit - viewCenterTop
        var left = col * factUnit - viewCenterLeft

        item.css({
          top: top,
          left: left
        })
      })
    },

    /**
     * 生成tile视图
     * @param level 需要生成的层级
     * @param needKeep  是否需要保留原tiles
     * @private
     */
    __genTiles: function() {
      var self = this
      var level = self.__curLevel
      var zoomScale = self.__zoomScale
      var panel = self.__panel
      var options = self.__options
      var viewPanel = panel.find('.view')

      var images = self.__getShowTiles(level, self.__viewLeft, self.__viewTop, self.__viewWidth, self.__viewHeight, options.lod.maxLevel)

      //为了解决换图片闪的问题，决定不清除图片,而是再初始化完以后来进行删除
      var tileImgs = viewPanel.find('.tile')
      tileImgs.addClass('past')

      var imgLength = images.length
      var loadCount = 0

      function imagesLoaded(item, stateChange) {
        //如果已经缩放或者平移
        if (stateChange) return false

        if (loadCount === imgLength) {
          viewPanel.find('.tile.past').remove()
        }

        var tile = $(_.template(self.__tileTpl)({
          tile: item
        }))
        viewPanel.append(tile)
          //加载完成需要根据zoomScale来计算当前显示的大小
        var unit = self.__unit
        var scale = zoomScale / Math.pow(2, self.__curLevel - 1)
        tile.css({
          width: unit * scale,
          height: unit * scale
        })
      }

      $.each(images, function(idex, item) {
        var img = new Image()

        img.onload = function() {
          loadCount++
          imagesLoaded(item, this.stateChange)
        }
        img.onerror = function() {
          item.src = self.__defaultTileURL
          loadCount++
          imagesLoaded(item, this.stateChange)
        }
        img.onabort = function() {
          item.src = self.__defaultTileURL
          loadCount++
          imagesLoaded(item, this.stateChange)
        }

        img.src = item.src

        self.__imgObjCache.push(img)
      })
    },

    /**
     * 重置场景中需要在视口中鼠标的点
     * @private
     */
    __resetSceneInViewPoint: function() {
      var self = this
      var unit = self.__unit
      var zoomScale = self.__zoomScale
      var viewLeft = self.__viewLeft
      var viewTop = self.__viewTop
      var sceneInViewPointer = self.__sceneInViewPoint
      var mouseInViewPoint = self.__mouseInViewPoint

      sceneInViewPointer.left = (viewLeft + mouseInViewPoint.left) / (unit * zoomScale)
      sceneInViewPointer.top = (viewTop + mouseInViewPoint.top) / (unit * zoomScale)
    },

    /**
     * 获得当前视口下需要显示的图片
     * @param level 当前级别
     * @param viewLeft     视口x坐标
     * @param viewTop     视口y坐标
     * @param viewWidth 视口宽度
     * @param viewHeight 视口高度
     * @param maxLevel 最大的级别
     * @private
     */
    __getShowTiles: function(level, viewLeft, viewTop, viewWidth, viewHeight, maxLevel) {
      var self = this
      var url = self.__options.lod.url
      var ext = self.__options.lod.ext
      var images = []
      var unit = self.__unit * self.__zoomScale / Math.pow(2, self.__curLevel - 1)

      var startTile = {
        row: parseInt(viewTop / unit, 10),
        col: parseInt(viewLeft / unit, 10)
      }

      var cols = 1
      var offsetLeft = unit - viewLeft % unit

      if (offsetLeft === 0) {
        offsetLeft += unit
      }

      while (offsetLeft < viewWidth) {
        offsetLeft += unit

        cols++
      }

      var rows = 1
      var offsetTop = unit - viewTop % unit

      if (offsetTop === 0) {
        offsetTop += unit
      }

      while (offsetTop < viewHeight) {
        offsetTop += unit

        rows++
      }

      var viewCenterLeft = viewLeft + viewWidth / 2
      var viewCenterTop = viewTop + viewHeight / 2

      var maxCount = Math.pow(2, level - 1)

      for (var i = 0; i < rows; i++) {
        var row = startTile.row + i
        if (row >= maxCount || row < 0) continue
        for (var j = 0; j < cols; j++) {
          var col = startTile.col + j
          if (col >= maxCount || col < 0) continue
          images.push({
            row: row,
            col: col,
            src: url + '/L' + level + '/Model_' + row + '_' + col + '.' + ext,
            top: row * unit - viewCenterTop,
            left: col * unit - viewCenterLeft,
            level: self.__curLevel
          })
        }
      }

      return images

    },

    __stateChange: function() {
      var self = this
      var imgs = self.__imgObjCache

      $.each(imgs, function(idx, item) {
        item.stateChange = true
          //item.abort()
      })

      self.__imgObjCache = []
    },

    __getEventPoint: function(evt) {
      var result = {
        x: evt.clientX || evt.pageX || (evt.originalEvent && (evt.originalEvent.clientX || evt.originalEvent.pageX)),
        y: evt.clientY || evt.pageY || (evt.originalEvent && (evt.originalEvent.clientY || evt.originalEvent.pageY)),
        offsetX: evt.offsetX || (evt.originalEvent && evt.originalEvent.layerX),
        offsetY: evt.offsetY || (evt.originalEvent && evt.originalEvent.layerY)
      }
      return result
    },

    __showInfo: function(message) {
      var self = this
      self.debugPanel.html(self.debugPanel.html() + '<br/>' + message).scrollTop(self.debugPanel[0].scrollHeight)
    }
  }

  dwgView.__tpl = '' +
    '<div class="mod-dwg">' +
    '    <div class="scene">' +
    '        <div class="view"></div>' +
    '    </div>' +
    '    <div class="rect"></div>' +
    '</div>';

  dwgView.__tileTpl = '' +
    '<img class="tile" data-row="<%= tile.row %>" data-col="<%= tile.col %>" data-level="<%= tile.level %>" src="<%= tile.src %>" style="top:<%= tile.top %>px;left:<%= tile.left %>px;" />'
}
dwgViewer.prototype = {
  render: function(model, element) {
    var self = this,
      currentFile;
    $.each(model, function(i, file) {
      if (file.MIME == "image/tiles") {
        return currentFile = file;
      }
    });
    self.dwgView.init(element, {
      lod: {
        maxLevel: parseInt(currentFile.Attributes.DwgLevel, 10),
        ext: currentFile.Attributes.DwgExt || 'jpg',
        url: "/model/" + self._opt.sourceId + '/' + currentFile.Path
      }
    });
  },
  fit: function() {
    var self = this;
    self.dwgView.fit();
  },
  pan: function() {
    var self = this;
    self.dwgView.setState('none');
  },
  zoom: function() {
    var self = this;
    // self.dwgView.zoom();
    self.dwgView.setState('zoom');
  },
  zoomIn: function() {
    var self = this;
    self.dwgView.zoomIn();
  },
  zoomOut: function() {
    var self = this;
    self.dwgView.zoomOut();
  },
  rectZoom: function() {
    var self = this,
      state = self.dwgView.__state;
    self.dwgView.setState('rectzoom');
  },

  addControll: function(model, container) {
    var self = this;
    var list = $('<ul class="modelList"></ul>');
    $.each(model, function(i, item) {
      var tmp = $('<li class="modelItem"></li>').text(item.name).data(item.res);
      list.append(tmp);
      if (i == 0) {
        tmp.trigger('click');
      }
    });

    var modBar = $('<div class="modelBar">' +
      '  <i class="bar-item m-fit2d" data-fn="fit"></i>' +
      '  <i class="bar-item m-zoom" data-fn="zoom"></i>' +
      '  <i class="bar-item m-zoomRect" data-fn="rectZoom"></i>' +
      (this._opt.isComment && '<i class="bar-item m-camera" title="快照" data-fn="comment" ></i>' || '') +
      '  <div class="modelSelect">' +
      '    <span class="cur"></span>' +
      '  </div>' +
      '</div>');
    modBar.find('.modelSelect').append(list);
    container.append(modBar);
    modBar.on("click", '.modelSelect .cur', function() {
      $(this).toggleClass('open');
    }).on("click", '.modelSelect .modelItem', function() {
      var $this = $(this),
        val = $this.text(),
        $cur = $this.parent().prev(),
        data = $this.data();
      self.render(data, container);
      $cur.text(val).removeClass('open');
    }).on('click', ".bar-item", function() {
      var $this = $(this),
        fn = $this.data('fn');
      if ($this.is('.m-fit2d')) {
        self[fn]();
      } else {
        $this.toggleClass('selected').siblings().removeClass('selected');
        if ($this.is('.selected')) {
          self[fn]();
        } else {
          self.pan();
        }
      }
    });
    this.__initCommentEvent();
    modBar.find(".modelItem:last").trigger("click");
  },

  __initCommentEvent: function() {

    var that = this;
    //设置不同的工具
    $("#modelBox .bim").on("click", ".commentBar .btnSave", function() {

       $("#modelBox .bim .commentBar").addClass("hide");
      //保存批注
      if ($.isFunction(that.saveCommentDwg)) {
        that.saveCommentDwg();
      }

      that.commentEnd();

    }).on("click", ".commentBar .btnCanel", function() {

      //取消保持
      if ($.isFunction(that.canelComment)) {
        that.canelComment();
      }

      that.commentEnd();

    });
  },

  //结束批注
  commentEnd: function() {
     
    $("#modelBox .modelBar .m-camera").removeClass("selected");
    this.dwgView.dwgHelper.editAnnotationEnd(); 
    $("#modelBox .bim .commentBar").addClass("hide");
  }


}