/**
  * @require /libsH5/js/bimView.js
*/
'use strict'
;(function($){
  bimView.model = {
    model:function(options,obj){
      var self = this;
      var _opt = options;
      var viewer = new self.BIM(_opt);
      new bimView.sidebar.init(_opt,obj);
      return viewer;
    },
    singleModel:function(options){
      var self = this;
      var _opt = options;
      var modelBar = $('<div class="modelBar"></div>');
      $.each(self.singleBar,function(i,item){
        var tmpHtml = $('<i class="bar-item '+item.icon+'" title="'+item.title+'" data-id="'+item.fn+'" data-type="'+item.type+'" data-group="'+item.group+'"></i>');
        bimView.comm.bindEvent.on(item.keyCode,tmpHtml);
        modelBar.append(tmpHtml);
      });
      _opt._dom.bimBox.append(modelBar);
      var viewer = new self.BIM(_opt);
      viewer.disableLoD();
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
          var itemHtml = $('<li class="modelItem" data-id="'+item.id+'" data-type="familyType">'+item.name+'</li>');
          modelList.append(itemHtml);
          bimView.comm.filterData.push(item.id);
        });
        modelBar.find('.modelSelect').append(modelList);
        _opt._dom.bimBox.append(modelBar);
        modelBar.find(".modelItem:eq(0)").trigger('click');
      });
      var viewer = new self.BIM(_opt);
      viewer.disableLoD();
      return viewer;
    },
    comment:function(element){
      var self = this;
      var modelBar = $('<div class="commentBar"></div>');
      $.each(self.commentBar,function(i,item){
        var tmpHtml;
        if(i == 0){
          tmpHtml = $('<i class="bar-item '+item.icon+' selected" title="'+item.title+'" data-id="'+item.fn+'" data-type="'+item.type+'"></i>');
        }else{
          tmpHtml = $('<i class="bar-item '+item.icon+'" title="'+item.title+'" data-id="'+item.fn+'" data-type="'+item.type+'"></i>');
        }
        bimView.comm.bindEvent.on(item.keyCode,tmpHtml);
        modelBar.append(tmpHtml);
      });
      element.append(modelBar);
    },
    BIM:function(options){
      var self = this;
      return self.init(options);
    },
    dwg:function(options){

    },
    singleBar:[{
      id:'fit',
      icon:'m-fit',
      title:'适应窗口(I)',
      fn:'fit',
      keyCode:'105',
      type:'click'
    },
    {
      id:'zoom',
      icon:'m-zoom',
      title:'缩放(Z)',
      fn:'zoom',
      keyCode:'122',
      type:'pattern',
      group:'3'
    },
    {
      id:'fly',
      icon:'m-fly',
      title:'漫游(Space)',
      fn:'fly',
      keyCode:'32',
      type:'pattern',
      group:'3'
    }],
    modelBar:[{
      id:'filter',
      icon:'m-filter',
      title:'选择器',
      fn:'filter',
      keyCode:'',
      type:'filter',
      group:'1'
    },
    {
      id:'comment',
      icon:'m-camera',
      title:'快照',
      fn:'commentInit',
      keyCode:'',
      type:'viewer',
      group:'1'
    },
    {
      id:'selected',
      icon:'m-selected',
      title:'已选构件',
      fn:'selected',
      keyCode:'',
      type:'filter',
      group:'1'
    },
    {
      id:'home',
      icon:'m-home',
      title:'Home(I)',
      fn:'home',
      keyCode:'72',
      type:'viewer',
      group:'2'
    },{
      id:'fit',
      icon:'m-fit',
      title:'适应窗口(I)',
      fn:'fit',
      keyCode:'105',
      type:'viewer',
      group:'2'
    },
    {
      id:'fly',
      icon:'m-fly',
      title:'漫游(Space)',
      fn:'fly',
      keyCode:'32',
      type:'pattern',
      group:'3'
    },
    {
      id:'more',
      icon:'m-more',
      title:'更多',
      fn:'more',
      keyCode:'',
      type:'more',
      group:'0',
      subBar:[{
        id:'color',
        icon:'m-color',
        title:'颜色',
        fn:'color-1',
        keyCode:'',
        type:'color',
        group:'0'
      },
      {
        id:'zoom',
        icon:'m-zoom',
        title:'缩放(Z)',
        fn:'zoom',
        keyCode:'122',
        type:'pattern',
        group:'3'
      },
      {
        id:'translucent',
        icon:'m-translucent',
        title:'半透明',
        fn:'translucent',
        keyCode:'',
        type:'status',
        group:'0'
      },
      ]
    },
    {
      id:'hideMap',
      icon:'m-miniScreen',
      title:'',
      fn:'fly',
      keyCode:'',
      type:'change'
    }],
    commentBar:[{
      id:'arrow',
      icon:'m-arrow',
      title:'箭头',
      fn:'1',
      type:'comment'
    },{
      id:'rect',
      icon:'m-rect',
      title:'矩形',
      fn:'2',
      type:'comment'
    },{
      id:'ellipse',
      icon:'m-ellipse',
      title:'圆形',
      fn:'3',
      type:'comment'
    },{
      id:'mark',
      icon:'m-mark',
      title:'标记',
      fn:'4',
      type:'comment'
    },{
      id:'cloud',
      icon:'m-cloud',
      title:'云线',
      fn:'5',
      type:'comment'
    },{
      id:'text',
      icon:'m-text',
      title:'文本',
      fn:'6',
      type:'comment'
    },{
      id:'close',
      icon:'m-mark',
      title:'关闭',
      fn:'exit',
      type:'comment'
    }],
    colorBar:[{
      id:'color-1',
      icon:'color-1',
      fn:'color-1',
      type:'color'
    },{
      id:'color-2',
      icon:'color-2',
      fn:'color-2',
      type:'color'
    },{
      id:'color-3',
      icon:'color-3',
      fn:'color-3',
      type:'color'
    },{
      id:'color-4',
      icon:'color-4',
      fn:'color-4',
      type:'color'
    },{
      id:'color-5',
      icon:'color-5',
      fn:'color-5',
      type:'color'
    },{
      id:'color-6',
      icon:'color-6',
      fn:'color-6',
      type:'color'
    }]
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
