// 业务功能：设置隐患点
// 逻辑功能: 选择隐患点构件
(function(win) {
  var scripts = document.getElementsByTagName('script');
  for (var i = 0, size = scripts.length; i < size; i++) {
    if (scripts[i].src.indexOf('/static/dist/components/modelSelection/js/modelSelection.js') != -1) {
      var a = scripts[i].src.replace('/static/dist/components/modelSelection/js/modelSelection.js', '');
      window.extendUrl = a;
    }
  }
  var strVar3 = "";
    strVar3 += "<% var count=obj.length,item; %>";
    strVar3 += "    <% for(var i=0;i<count;i++){ %>";
    strVar3 += "        <% item=obj[i];if(item.group=='设计'){continue}else if(item.group=='构件名称'){ %>";
    strVar3 += "           <div class=\"modle\">";
    strVar3 += "               <ul class=\"modleList\">";
    strVar3 += "                   <li class=\"modleItem\">";
    strVar3 += "                       <span class=\"modleName\"><div class=\"modleNameText overflowEllipsis\">构件名称<\/div><\/span> <span class=\"modleVal overflowEllipsis\"><%=item.items[0]['value']%><\/span>";
    strVar3 += "                   <\/li>";
    strVar3 += "               <\/ul>";
    strVar3 += "           <\/div>";
    strVar3 += "";
    strVar3 += "        <% }else{%>";
    strVar3 += "";
    strVar3 += "            <div class=\"modle\">";
    strVar3 += "                <div class=\"modleTitleBar\">";
    strVar3 += "                    <i class=\"modleShowHide down\"><\/i>";
    strVar3 += "                    <h1 class=\"modleName overflowEllipsis\"><%= item.group%><\/h1>";
    strVar3 += "                <\/div>";
    strVar3 += "                <ul class=\"modleList\">";
    strVar3 += "                    <% var subItems=item.items,subCount=subItems.length,subItem %>";
    strVar3 += "                        <% for(var j=0;j<subCount;j++){ %>";
    strVar3 += "                            <% subItem=subItems[j];  %>";
    strVar3 += "                                <li class=\"modleItem\">";
    strVar3 += "                                    <span class=\"modleName\"><div title='<%=subItem.name%>' class=\"modleNameText overflowEllipsis\"><%=subItem.name%><\/div><\/span> <span class=\"modleVal overflowEllipsis\"><%=subItem.value%><%=subItem.unit%><\/span>";
    strVar3 += "                                <\/li>";
    strVar3 += "                        <% } %>";
    strVar3 += "                <\/ul>";
    strVar3 += "            <\/div>";
    strVar3 += "        <% } %>";
    strVar3 += "    <% } %>";
    strVar3 += "<div class=\"fordesign\"><\/div>";
    strVar3 += "<div class=\"attrPlanBox\">";
    strVar3 += "    <div class=\"modle\">";
    strVar3 += "        <i class=\"modleShowHide down\"><\/i>";
    strVar3 += "        <h1 class=\"modleName\">计划<\/h1>";
    strVar3 += "        <ul class=\"modleList\">";
    strVar3 += "            <li class=\"modleItem\">";
    strVar3 += "                <span class=\"modleName overflowEllipsis\"><div class=\"modleNameText overflowEllipsis\">业务事项<\/div><\/span> <span class=\"modleVal name\"> <\/span>";
    strVar3 += "            <\/li>";
    strVar3 += "            <li class=\"modleItem\">";
    strVar3 += "                <span class=\"modleName overflowEllipsis\"><div class=\"modleNameText overflowEllipsis\">计划开始<\/div><\/span> <span class=\"modleVal strat\"><\/span>";
    strVar3 += "            <\/li>";
    strVar3 += "            <li class=\"modleItem\">";
    strVar3 += "                <span class=\"modleName overflowEllipsis\"><div class=\"modleNameText overflowEllipsis\">计划结束<\/div><\/span> <span class=\"modleVal end\"><\/span>";
    strVar3 += "            <\/li>";
    strVar3 += "            <li class=\"modleItem\">";
    strVar3 += "                <span class=\"modleName overflowEllipsis\"><div class=\"modleNameText overflowEllipsis\">实际结束<\/div><\/span> <span class=\"modleVal rEnd\"><\/span>";
    strVar3 += "            <\/li>";
    strVar3 += "        <\/ul>";
    strVar3 += "    <\/div>";
    strVar3 += "<\/div>";
    strVar3 += "<div class=\"attrCostBox\">";
    strVar3 += " <div class=\"modle\">";
    strVar3 += "     <i class=\"modleShowHide down\"><\/i>";
    strVar3 += "     <h1 class=\"modleName\">成本<\/h1>";
    strVar3 += " <\/div>";
    strVar3 += " ";
    strVar3 += "<\/div>";
    strVar3 += "<div class=\"attrQualityBox\">";
    strVar3 += "    <div class=\"modle\">";
    strVar3 += "        <i class=\"modleShowHide\"><\/i>";
    strVar3 += "        <h1 class=\"modleName\">质检标准<\/h1>";
    strVar3 += "        <ul class=\"modleList\">";
    strVar3 += "        <\/ul>";
    strVar3 += "    <\/div>";
    strVar3 += "<\/div>";
    strVar3 += "";
    strVar3 += "<div class=\"attrDwgBox\">";
    strVar3 += "    <div class=\"modle\">";
    strVar3 += "        <i class=\"modleShowHide\"><\/i>";
    strVar3 += "        <h1 class=\"modleName\">图纸<\/h1>";
    strVar3 += "        <ul class=\"modleList\">";
    strVar3 += "        <\/ul>";
    strVar3 += "    <\/div>";
    strVar3 += "<\/div>";
    strVar3 += "<div class=\"attrClassBox\"><\/div>";
  var ourl = window.extendUrl;

  //Project模型公共方法
  var Project = {
    Settings: {},
    data: {},
    temp: {},
    currentId: "",
    sceneId: "",
    components: {},
    location:{},
    locationName:{},
    fileIds:{},
    axis:{},
    //转换bounding box数据
    formatBBox: function(data) {
      if (!data) {
        return [];
      }
      var box = [],
        min = data.min,
        minArr = [min.x, min.y, min.z],
        max = data.max,
        maxArr = [max.x, max.y, max.z];
      box.push(minArr);
      box.push(maxArr);
      return box;
    },
    zoomModel: function(ids, box) {
      //定位
      Project.Viewer.zoomToBox(box);
      //半透明
      Project.Viewer.translucent(true);
      //高亮
      Project.Viewer.highlight({
        type: 'userId',
        ids: ids
      });
    },
    del: function(data, key) {
      for (var p in data) {
        if (typeof data[p] === 'string') {
          if (p == key) {
            delete data[p];
          }
        } else {
          Project.del(data[p], key);
        }
      }
    },
    templateCache: [],

    //获取模板根据URL
    templateUrl: function(url, notCompile) {

      if (url.substr(0, 1) == ".") {
        url = ourl + "/static/dist/tpls" + url.substr(1);
      } else if (url.substr(0, 1) == "/") {
        url = ourl + "/static/dist/tpls" + url;
      }

      if (Project.templateCache[url]) {
        return Project.templateCache[url];
      }

      var result;
      $.ajax({
        url: url,
        type: 'GET',
        async: false
      }).done(function(tpl) {
        if (notCompile) {
          result = tpl;

        } else {
          result = _.template(tpl);
        }

      });

      Project.templateCache[url] = result;

      return result;
    },
    renderAttr: function(elementId, sceneId) {
      var url = ourl + "/sixD/" + Project.Settings.projectId + "/" + Project.Settings.projectVersionId + "/property",
        that = this;
      $.ajax({
        url: url,
        data: {
          elementId: elementId,
          sceneId: sceneId,
          token:'123'
        }
      }).done(function(data) {
        var template =_.template(strVar3),
          html = template(data.data);
        $("#propertyPanel .designProperties").html(html);
      });
    }

  }

  var ModelSelection = function(options) {
    var _this=this;
    //强制new
    if (!(this instanceof ModelSelection)) {
      return new ModelSelection(options);
    }
    
    var defaults = {
      btnText: '确&nbsp;&nbsp;定'
    }
    this.Settings = $.extend(defaults, options);
    if(this.Settings.etag){
      Project.Settings = this.Settings;
      this.Project=Project;
      this.init();
    }else{
       $.ajax({
          url: ourl+"/platform/api/project/"+this.Settings.projectCode+"/meta?token=123"
        }).done(function(data){
          if(data.code==0){
            $.ajax({
              url: ourl+"/view/"+data.data.projectId+"/"+data.data.versionId+"/init?token=123"
            }).done(function(data){
              if(data.code==0){
                _this.Settings=$.extend({},_this.Settings,data.data);
                Project.Settings = _this.Settings;
                _this.Project=Project;
                _this.init();
              }
              
            })
          }
        })
    }

   
    /*//合并参数
    this.Settings = $.extend(defaults, options);
    Project.Settings = this.Settings;
    this.Project=Project;
    this.init();*/
  }



  ModelSelection.prototype = {

    //初始化
    init: function() {

      Project.MS = this;
      var self = this,

        styleUrl = ourl + '/static/dist/libs/libsH5_20160313.css',

        $css = '<link rel="stylesheet" href="' + styleUrl + '" />',

        $css2 = '<link rel="stylesheet" href="' + ourl + '/static/dist/projects/projects_20160313.css" />',

        $css3 = '<link rel="stylesheet" href="' + ourl + '/static/dist/comm/comm_20160313.css" />';


      if (!ModelSelection.isLoad) {
        $('head').append($css, $css2, $css3);
        ModelSelection.isLoad = true;
      }


      var srciptUrl = ourl + '/static/dist/libs/libsH5_20160313.js';
      //加载完js后再渲染
      $.getScript(srciptUrl, function() {
        bimView.API.baseUrl = ourl + '/';
        self.dialog();
        self.controll();
      });


    },
    controll: function() {
      if (this.isIE()) {
        return;
      }
      var self = this;
      self.$dialog.on('click', '.toolsBtn', function() {
        self.getSelected();
      }).on('click', '.dialogClose', function() {
        self.$dialog.remove();
        self.$dialog = null;
      }).on('click', '.dialogOk', function() {
        var setting = self.Settings;

        var $n=$('#modelTree .del'),
            c=[];
        $n.each(function(){
          var id=$(this).data('userId');
          c.push({
            id:id,
            fileUniqueId:Project.fileIds[id]+id.slice(id.indexOf('.')),
            axis:Project.axis[id],
            location:Project.location[id],
            locationName:Project.locationName[id]
          })
        })
        if(Project.Settings.type=='single'){
          c=c[0];
        }
        if (setting.callback && setting.callback.call(this, c, Project.Settings.markers) !== false) {
          self.$dialog.remove();
          self.$dialog = null;
        }
      }).on('click', '.rightBar .m-openTree,.rightBar .m-closeTree', function() {
        var $this = $(this),
          $li = $this.closest('.itemNode');
        $this.toggleClass('m-openTree m-closeTree');
        $li.toggleClass('open');
      }).on('click', '.itemContent', function() {
        var id = $(this).data('userid');
        var box = Project.components[id];
        if (box && id) {
          Project.zoomModel([id], Project.formatBBox(box));
          Project.renderAttr(id, Project.sceneId);
        }
      }).on('click', '.del', function(e) {
        //删除已选构件
        e.stopPropagation();
        var id = $(this).closest('.itemContent').data('userid');
        Project.del(self.viewData, id);
        var tree = self.renderTree(self.viewData);
        var len = tree.find('.noneSwitch').length;
        self.$dialog.find('.num').text(len);
        $('#modelTree').html(tree);
        self.viewer.viewer.getFilters().removeSelectedId(id);
      }).on('mouseover', '.itemContent', function() {
        $(this).find('.del').css('display', 'inline-block');
      }).on('mouseout', '.itemContent', function() {
        $(this).find('.del').css('display', 'none');
      }).on('click', '.tabItem', function() {
        //切换属性面板、构件列表
        $('.tabItem').removeClass('selected');
        $(this).addClass('selected');
        if ($(this).hasClass('propertyPanel')) {
          $("#modelTree").hide();
          $("#propertyPanel").show();
        } else {
          $("#modelTree").show();
          $("#propertyPanel").hide();
        }
      })
    },
    dialog: function() {
      var self = this,
        Settings = this.Settings,
        $dialog;
      if (this.$dialog) {
        $dialog = self.$dialog;
      } else {
        $dialog = self.$dialog = $('<div class="modelSelectDialog"></div>');
        var strVar = "";
        strVar += "<div class=\"projectPropetyContainer projectNavContentBox\">";
        strVar += "                                <div class=\"designProperties\">";
        strVar += "                                    <div class=\"nullTip\">请选择构件<\/div>";
        strVar += "                                <\/div>";
        strVar += "                            <\/div>";
        var $body = $('<div class="dialogBody"></div>'),
          $header = $('<div class="dialogHeader"/>').html('请选择构件<span class="dialogClose" title="关闭"></span> '),
          $modelView = self.$modelView = $('<div id="modelView" class="model"></div>'),
        $content = $('<div class="dialogContent"><div class="rightBar"><div class="tab"><div class="tabItem selected">已选构件</div><div class="tabItem propertyPanel">属性</div></div><div class="tools"><div class="toolsBtn"><i class="m-checked"></i>选择构件</div><span class="isSecleted">已选<span class="num">0</span>个构件</span></div><div class="bim" id="modelTree"></div><div class="bim" id="propertyPanel" style="display:none;">' + strVar + '</div></div></div>'),
          $bottom = $('<div class="dialogFooter"/>').html('<input type="button" class="dialogOk dialogBtn" value="' + this.Settings.btnText + '" />');
        $content.prepend($modelView);
        $body.append($header, $content, $bottom);
      }
      $dialog.append($body);
      $("body").append($dialog);
      //单选模式视图操作
      if (Project.Settings.type == 'single') {
        $('.tools').hide();
        $('.propertyPanel').hide();
      }

      if (self.isIE()) {
        this.activeXObject();
        $dialog.find(".rightBar").remove();
        this.ieDialogEvent();
        return;
      }

      self.renderModel();

    },

    //ie事件
    ieDialogEvent: function() {

      var self = this,
        $dialog = this.$dialog;

      $dialog.on('click', '.dialogClose', function() {
        this.$dialog.remove();
        this.$dialog = null;
      })

      $dialog.on('click', '.dialogOk', function() {

        //获取数据
        WebView.runScript('getData()', function(val) {
          var data = {};
          if (val) {
            data = JSON.parse(val);
          }
          var setting = self.Settings;
          if (setting.callback && setting.callback.call(this, data.components, data.markers) !== false) {
            self.$dialog.remove();
            self.$dialog = null;
            return self.viewData
          }

        });

      })
    },

    renderModel: function() {
      var _this = this;
      var viewer = new bimView({
        type: 'model',
        element: this.$modelView,
        sourceId: this.Settings.sourceId,
        etag: this.Settings.etag,
        projectId: this.Settings.projectId,
        projectVersionId: this.Settings.projectVersionId
      })
      this.viewer = viewer;
      Project.Viewer = viewer;
      var _url=ourl+'/doc/internal/'+this.Settings.projectId+'/'+this.Settings.projectVersionId+'?token=123&modelId=';
      //  window.BIV=viewer;
      //模型click事件、选择构件、编辑标记
      viewer.on("click", function(model) {
        var _userId=model.intersect.userId;
        Project.location[_userId]=JSON.stringify({
          boundingBox:model.intersect.object.boundingBox,
          position:model.intersect.object.position
        });
        Project.locationName[_userId]='轴'+model.intersect.axisGridInfo.abcName+'-'+model.intersect.axisGridInfo.numeralName;
        Project.axis[_userId]=JSON.stringify(model.intersect.axisGridInfo);
        Project.components[_userId] = model.intersect.object.boundingBox;

        $.get(_url+_userId.slice(0,_userId.indexOf('.')),function(data){
          Project.fileIds[_userId]=data.data.id;
        })

        if (Project.Settings.type == 'single') {
          // viewer.zoomToSelection();
          _this.getSelected();
          viewer.markers();
          viewer.viewer.setMarkerState(3);
          //  var p={"id":new Date().getTime(),"userId":model.intersect.userId,"shapeType":1,"position":model.intersect.point,"boundingBox":model.intersect.object.boundingBox,"state":3}
          //  viewer.loadMarkers([JSON.stringify(p)]);
        }
        //debugger
        //渲染属性面板
        Project.sceneId = model.intersect.object.userData.sceneId;
        Project.renderAttr(model.intersect.userId, Project.sceneId);
      });
      $('.view').on('click', function() {
        if (Project.Settings.type == 'single') {
          var m = viewer.saveMarkers();
          if (m && 　m.length > 0) {
            viewer.loadMarkers([m.pop()]);
            Project.Settings.markers = viewer.saveMarkers();
          }
        }
        $(this).mouseup(function(e) {
          if (3 == e.which) {
            viewer.loadMarkers(null);
            viewer.markerEnd();
          }
        });
      })
    },
    getSelected: function() {
      var self = this;
      var viewData = {};
      if (Project.Settings.type == 'multi') {
        viewData = self.viewData || {};
      }
      bimView.sidebar.getSelected(this.viewer, function(ids) {
        self.viewData = $.extend(true, {}, viewData, ids);
        Project.viewData=self.viewData;
        var tree = self.renderTree(self.viewData);
        var len = tree.find('.noneSwitch').length;
        self.$dialog.find('.num').text(len);
        $('#modelTree').html(tree);
      });
    },
    renderTree: function(data) {
      var self = this,
        rootHtml = $('<ul class="tree"></ul>');
      $.each(data, function(i, j) {
        var hasChild = typeof j == 'object' ? true : false,
          icon = hasChild ? 'm-openTree' : 'noneSwitch',
          name = hasChild ? i : j,
          isDel = hasChild ? 'nodel' : 'del';
        var html = $('<li class="itemNode">\
          <div class="itemContent" data-userId="' + i + '">\
            <i class="' + icon + '"></i>\
            <span class="treeText">' + name + '</span>\
            <i class="' + isDel + '"></i>\
          </div>\
        </li>');
        if (hasChild) {
          var children = self.renderTree(j);
          html.append(children);
        }else{
          html.find('.del').data('userId',i);
        }
        rootHtml.append(html);
      });
      return rootHtml;
    },

    //是否是IE浏览器
    isIE: function() {
      if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
      else
        return false;
    },

    //activeXObject 渲染模型
    activeXObject: function() {
      WebView = document.createElement("object");
      WebView.classid = "CLSID:15A5F85D-A81B-45D1-A03A-6DBC69C891D1";

      var viewport = document.getElementById('modelView');
      viewport.appendChild(WebView);

      function resizeWebView() {
        WebView.width = viewport.offsetWidth;
        WebView.height = viewport.offsetHeight;
      }
      resizeWebView();

      WebView.url = ourl + "/static/dist/components/modelSelection/model.html?type="+this.Settings.type+"&sourceId="+this.Settings.sourceId+"&etag="+
      this.Settings.etag+"&projectId="+ this.Settings.projectId+"&projectVersionId="+this.Settings.projectVersionId;
      WebView.height = "510px";
      WebView.width = "960px";
      //window.addEventListener('resize', resizeWebView, false);
    }
  }
  win.ModelSelection = ModelSelection;
})(window)