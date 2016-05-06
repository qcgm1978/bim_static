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
      var tmp = '<li data-id="'+item.id+'">'+item.name+'</li>';
      familyType.push(item.id);
      list.append(tmp);
    });
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
      var $this = $(this),
          id = $this.data('id'),
          val  = $this.text(),
          $cur = $this.parent().prev();
      $cur.text(val).removeClass('open');
      self.model.hideScene({
        type:'typeId',
        ids:self.getFilter(familyType,id)
      })
      self.model.pub("changType",id);
    }).on('click',".bar-item",function(){
      var $this = $(this),
          fn = $this.data('fn');
      if($this.is(".bar-fit")){
        self.model[fn]();
      }else{
        $this.toggleClass('selected').siblings().removeClass('selected');
        if(!$this.is('.selected')){
          self.model.picker();
        }else{
          self.model[fn]();
        }
      }
    });
    modBar.find(".mod-list li:last").trigger("click");
  },
  getFilter:function(arr,id){
    var tmpArr = arr.concat();
    var index = tmpArr.indexOf(id);
    tmpArr.splice(index,1);
    return tmpArr
  }
}
