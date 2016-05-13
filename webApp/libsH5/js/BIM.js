/**
  * @require /libsH5/js/bimView.js
*/
'use strict'
;(function($){
  bimView.model = {
    model:function(options){
      var self = this;
      var _opt = options;
      var viewer = new self.BIM(_opt);
      bimView.sidebar(_opt,viewer);
      return viewer;
    },
    singleModel:function(options){
      var self = this;
      var _opt = options;
      var modelBar = $('<div class="modelBar"></div>');
      $.each(self.singleBar,function(i,item){
        var tmpHtml = $('<i class="bar-item '+item.icon+'" title="'+item.title+'" data-id="'+item.fn+'" data-type="'+item.type+'"></i>');
        bimView.comm.bindEvent.on(item.keyCode,tmpHtml);
        modelBar.append(tmpHtml);
      });
      _opt._dom.bimBox.append(modelBar);
      var viewer = new self.BIM(_opt);
      return viewer;
    },
    familyModel:function(options){
      var self = this;
      var _opt = options;
      bimView.comm.ajax({
        type:'get',
        url:bimView.API.fetchFamilyType,
        etag:_opt.etag
      },function(res){
        var data = JSON.parse(res);
        var modelBar = $('<div class="modelBar"><div class="modelSelect"><span class="cur"></span></div></div>');
        var modelList = $('<ul class="modelList"></ul>');
        if(_opt.callback)_opt.callback(data.id);
        bimView.comm.filterData = [];
        $.each(data.types,function(i,item){
          var itemHtml = $('<li class="modelItem" data-id="'+item.id+'">'+item.name+'</li>');
          modelList.append(itemHtml);
          bimView.comm.filterData.push(item.id);
        });
        modelBar.find('.modelSelect').append(modelList);
        _opt._dom.bimBox.append(modelBar);
        modelBar.find(".modelItem:eq(0)").trigger('click');
      });
      var viewer = new self.BIM(_opt);
      return viewer;
    },
    BIM:function(options){
      var self = this;
      return self.init(options);
    },
    dwg:function(options){

    },
    singleBar:[{
      id:'fit',
      icon:'bar-fit',
      title:'适应窗口(I)',
      fn:'fit',
      keyCode:'105',
      type:'click'
    },
    {
      id:'zoom',
      icon:'bar-zoom',
      title:'缩放(Z)',
      fn:'zoom',
      keyCode:'122',
      type:'selected'
    },
    {
      id:'fly',
      icon:'bar-fly',
      title:'漫游(Space)',
      fn:'fly',
      keyCode:'32',
      type:'selected'
    }],
    modelBar:[{
      id:'filter',
      icon:'bar-filter',
      title:'选择器',
      fn:'filter',
      keyCode:'',
      type:'selected'
    },
    {
      id:'comment',
      icon:'bar-comment',
      title:'快照',
      fn:'comment',
      keyCode:'',
      type:'selected'
    },
    {
      id:'selected',
      icon:'bar-selected',
      title:'已选构件',
      fn:'selected',
      keyCode:'',
      type:'selected'
    },
    {
      id:'home',
      icon:'bar-home',
      title:'Home(I)',
      fn:'home',
      keyCode:'72',
      type:'click'
    },{
      id:'fit',
      icon:'bar-fit',
      title:'适应窗口(I)',
      fn:'fit',
      keyCode:'105',
      type:'click'
    },
    {
      id:'zoom',
      icon:'bar-zoom',
      title:'缩放(Z)',
      fn:'zoom',
      keyCode:'122',
      type:'selected'
    },
    {
      id:'fly',
      icon:'bar-fly',
      title:'漫游(Space)',
      fn:'fly',
      keyCode:'32',
      type:'selected'
    },
    {
      id:'more',
      icon:'bar-more',
      title:'更多',
      fn:'more',
      keyCode:'',
      type:'selected',
      subBar:[{
        id:'fly',
        icon:'bar-fly',
        title:'漫游(Space)',
        fn:'fly',
        keyCode:'32',
        type:'selected'
      },
      ]
    }
    ]
  }
  bimView.model.BIM.prototype = {
    init:function(options){
      var _opt = options;
      var viewer = new CloudViewer();
      var viewBox = $('<div class="view"></div>');
      _opt._dom.bimBox.append(viewBox);
      viewer.init(viewBox[0]);
      viewer.load(_opt.etag,bimView.API.baseUrl + bimView.API.fetchModel);
      return viewer;
    }
  }
})($)
