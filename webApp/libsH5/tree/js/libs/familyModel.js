var familyModel = function(options){
  var self = this;
  self._opt = options;
  self.model = null;
  self.init();
  self.model = self.render()
  return self.model;
}
familyModel.prototype = {
  init:function(){
    var self = this;
    self.getInfo();
  },
  getInfo:function(){
    var self = this;
    $.ajax({
      type:'get',
      url:'/model/'+self._opt.etag+'/metadata/familyInfo.json',
      success:function(res){
        var data = JSON.parse(res);
        self.addControll(data.types,self._opt.element);
      }
    });
  },
  render:function(){
    var self = this;
    var modelBox = $('<div class="model"></div>');
    self._opt.element.append(modelBox);
    return new BIM({
      single: true,
      element: modelBox[0],
      etag: self._opt.etag,
      tools: false
    })
  },
  addControll:function(model,container){
    var self = this;
    var list = $('<ul class="mod-list"></ul>');
    var familyType = [];
    var defaultId;
    $.each(model,function(i,item){
      if(i == 0)defaultId = item.id;
      var tmp = '<li data-id="'+item.id+'">'+name+'</li>';
      familyType.push(item.id);
      list.append(tmp);
    });
    self.model.hideScene({
      type:'typeId',
      ids:self.getFilter(familyType,defaultId)
    })
    var modBar = $('<div class="mod-bar">'+
    '  <i class="bar-item bar-fit" data-fn="fit"></i>'+
    '  <i class="bar-item bar-zoom" data-fn="zoom"></i>'+
    '  <i class="bar-item bar-fly" data-fn="fly"></i>'+
    '  <div class="mod-select">'+
    '    <span class="cur"></span>'+
    '  </div>'+
    '</div>');
    modBar.find('.mod-select').append(list);
    container.append(modBar);
    modBar.on("click",'.mod-select .cur',function(){
      $(this).toggleClass('open');
    }).on("click",'.mod-select li',function(){
      var id = $(this).data('id'),
          $cur = $(this).parent().prev();
      $cur.text(val).removeClass('open');
      self.model.hideScene({
        type:'typeId',
        ids:self.getFilter(familyType,id)
      })
    }).on('click',".bar-item",function(){
      var $this = $(this),
          fn = $this.data('fn');
      $this.not('.bar-fit').addClass('selected').siblings().removeClass('selected');
      self.model[fn]();
    });
  },
  getFilter:function(arr,id){
    var index = arr.indexOf(id);
    arr.splice(index,1);
    return arr
  }
}
