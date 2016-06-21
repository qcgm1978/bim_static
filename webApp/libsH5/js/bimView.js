'use strict'
;(function($){
  var bimView = window.bimView = function(options){
    var self = this,
        defaults = {
          type:'model',//文件类型 singleModel:单文件模型,model:多文件模型,带小地图,familyModel:族文件,dwg:dwg文件,预留
          element:'', //模型渲染DOM节点
          etag:'',//模型ID
          sourceId:'',
          projectId:'',//模型关联项目ID
        },
        serverUrl = "";//模型后端接口服务地址
    self.subscribers = {};// 私有订阅对象
    var _opt = $.extend({},defaults,options);
    if((typeof _opt.element) == 'string'){
      _opt.element = $(_opt.element);
    }
    if(!_opt.element){
      console.error('element is not found!')
      return false;
    }
    _opt._dom = self._dom = {
      bimBox:$('<div class="bim"></div>'),
      loading:$('<div class="loading"></div>'),
      progress:$('<div class="progress"></div>'),
      modelLoading:$('<div class="modelLoading"></div>')
    };
    self.init(_opt);
  }
})($);
