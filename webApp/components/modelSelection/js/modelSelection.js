(function($,win){
  var ModelSelection = function(options) {

    //强制new
    if (!(this instanceof ModelSelection)) {
      return new ModelSelection(options);
    }

    var defaults = {
      btnText:'确&nbsp;&nbsp;定',
    }

    //合并参数
    this.Settings = $.extend(defaults, options);

    this.init();
  }
  ModelSelection.prototype = {
    init:function(){
      var self = this,
          serverUrl = 'http://bim.wanda-dev.cn/',
          srciptUrl = serverUrl + 'static/dist/libs/libsH5_20160312.js',
          styleUrl = serverUrl + 'static/dist/libs/libsH5_20160312.css',
          $script = '<script src="'+srciptUrl+'"></script>',
          $css = '<link rel="stylesheet" href="'+styleUrl+'" />';
      if(!ModelSelection.isLoad){
        $('head').append($css,$script);
        ModelSelection.isLoad = true;
      }
      self.dialog();
      self.controll();
    },
    controll:function(){
      var self = this;
      self.$dialog.on('click','.toolsBtn',function(){
        self.getSelected();
      }).on('click','.dialogClose',function(){
        self.$dialog.remove();
        self.$dialog = null;
      }).on('click','.dialogOk',function(){
        var setting = self.Settings;
        if (setting.callback && setting.callback.call(this) !== false) {
          self.$dialog.remove();
          self.$dialog = null;
          return self.viewData
        }
      }).on('click','.rightBar .m-openTree,.rightBar .m-closeTree',function(){
        var $this = $(this),
            $li = $this.closest('.itemNode');
        $this.toggleClass('m-openTree m-closeTree');
        $li.toggleClass('open');
      })
    },
    dialog:function(){
      var self = this,
          Settings = this.Settings,
          $dialog;
      if(this.$dialog){
        $dialog = self.$dialog;
      }else{
        $dialog = self.$dialog= $('<div class="modelSelectDialog"></div>');
        var $body = $('<div class="dialogBody"></div>'),
            $header = $('<div class="dialogHeader"/>').html('请选择构件<span class="dialogClose" title="关闭"></span> '),
            $modelView = self.$modelView = $('<div id="modelView" class="model"></div>')
            $content = $('<div class="dialogContent"><div class="rightBar"><div class="tab"><div class="tabItem">已选构件</div></div><div class="tools"><div class="toolsBtn"><i class="m-checked"></i>已选构件</div><span class="isSecleted">已选<span class="num"></span>个构件</span></div><div class="bim" id="modelTree"></div></div></div>'),
            $bottom = $('<div class="dialogFooter"/>').html('<input type="button" class="dialogOk dialogBtn" value="' + this.Settings.btnText + '" />');
        $content.prepend($modelView);
        $body.append($header,$content,$bottom);
      }
      $dialog.append($body);
      $("body").append($dialog);
      setTimeout(function(){
        self.renderModel();
      },10);
    },
    renderModel:function(){
      this.viewer = new bimView({
        type:'model',
        element: this.$modelView,
        sourceId: this.Settings.sourceId,
        etag: this.Settings.etag,
        projectId:this.Settings.projectId,
        projectVersionId: this.Settings.projectVersionId
      })
    },
    getSelected:function(){
      var self = this;
      var viewData = self.viewData || {};
      bimView.sidebar.getSelected(this.viewer,function(ids){
        self.viewData = $.extend(true,{},viewData,ids);
        var tree = self.renderTree(self.viewData);
        var len = tree.find('.noneSwitch').length();
        self.$dialog.find('.num').text(len);
        $('#modelTree').html(tree);
      });
    },
    renderTree:function(data){
      var self = this,
          rootHtml = $('<ul class="tree"></ul>');
      $.each(data,function(i,j){
        var hasChild = typeof j == 'object' ? true :false,
            icon = hasChild ? 'm-openTree':'noneSwitch',
            name = hasChild ? i : j;
        var html = $('<li class="itemNode">\
          <div class="itemContent">\
            <i class="'+icon+'"></i>\
            <span class="treeText">'+name+'</span>\
          </div>\
        </li>');
        if(hasChild){
          var children = self.renderTree(j);
          html.append(children);
        }
        rootHtml.append(html);
      });
      return rootHtml;
    }
  }
  win.ModelSelection = ModelSelection;
})($,window)
