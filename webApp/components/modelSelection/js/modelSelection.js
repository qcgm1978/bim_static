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
      var serverUrl = 'http://bim.wanda-dev.cn/',
          srciptUrl = serverUrl + 'static/dist/libs/libsH5_20160312.js',
          styleUrl = serverUrl + 'static/dist/libs/libsH5_20160312.css',
          $script = '<script src="'+srciptUrl+'"></script>',
          $css = '<link rel="stylesheet" href="'+styleUrl+'" />';
      $('head').append($css,$script);
      this.dialog();
    },
    dialog:function(){
      var self = this,
          $dialog = this.$dialog = $('<div class="modelSelectDialog"></div>'),
          $body = $('<div class="dialogBody"></div>'),
          Settings = this.Settings,
          $header = $('<div class="dialogHeader"/>').html('请选择构件<span class="dialogClose" title="关闭"></span> '),
          $content = $('<div class="dialogContent"><div id="modelView" class="model"></div></div>'),
          $bottom = $('<div class="dialogFooter"/>').html('<input type="button" class="dialogOk dialogBtn" value="' + this.Settings.btnText + '" />');
      $body.append($header,$content,$bottom);
      $dialog.append($body);

      $("body").append($dialog);
      Settings.$dialog = $dialog;
      setTimeout(function(){
        self.renderModel();
      },10);
    },
    renderModel:function(){
      var viewer = new bimView({
        type:'model',
        element: $('#modelView'),
        sourceId: this.Settings.sourceId,
        etag: this.Settings.etag,
        projectId:this.Settings.projectId,
        projectVersionId: this.Settings.projectVersionId
      })
    }
  }
  win.ModelSelection = ModelSelection;
})($,window)