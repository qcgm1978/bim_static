/**
 * @require /libs/tree/js/libs/inflate.min.js
  * @require /libs/tree/js/libs/three.min.js
   * @require /libs/tree/js/libs/WebViewer.min.js
 */

;/* BIM viewer */
'use strict';
var BIM = function(option){
  var self = BIM.common.self = this;
  var defaults = {
    element:'',
    cameraInfo:'',
    controll:true,
    projectId:'',
    resize:true,
    tools:false,
    toolsClass:'mod-bar'
  };
  var serverUrl = 'http://172.16.233.187:8888/';
  // var serverUrl = '/local/bim/';
  var _util = BIM.util;
  var bimBox = BIM.common.bimBox = BIM.util.createDom('bim');
  var _opt = BIM.common._option = _util._extend(defaults,option);
  if(!_opt.element){
    console.error('element is not found!')
    return false;
  }else if((typeof _opt.element) == 'string'){
    _opt.element = document.getElementById(_opt.element)
  }
  _opt.element.innerHTML = '';
  var start = function(res){
    BIM.util.pub('start',res)
  }
  var loading = function(res){
    var total = res.totalModels,
        loaded = res.loadedModels,
        progress = loaded/total*100
    if(progress == 100){
    }
    BIM.util.pub('loading',progress)
  }
  var loaded = function(res){
    viewer.render();
    if(_opt.tools){
      BIM.util.controll()
    }
    self.handle();
    BIM.util.pub('loaded',res)
  }
  var changed = function(res){
    BIM.util.pub('changed',res)
  }
  var viewer = BIM.common.viewer = new CloudViewer();
  viewer.registerEventListener(CLOUD.EVENTS.ON_SELECTION_CHANGED, changed);
  viewer.registerEventListener(CLOUD.EVENTS.ON_LOAD_PROGRESS, loading);
  viewer.registerEventListener(CLOUD.EVENTS.ON_LOAD_COMPLETE, loaded);
  viewer.registerEventListener(CLOUD.EVENTS.ON_LOAD_START, start);
  var init = function(){
    var viewBox = document.createElement('div');
    viewBox.className = "view";
    bimBox.appendChild(viewBox);
    _opt.element.appendChild(bimBox);
    viewer.init(viewBox);
    viewer.load(_opt.projectId,serverUrl);
    if(_opt.resize){
      _util.listener(window,'resize',function(){
        var _width = viewBox.clientWidth,
            _height = viewBox.clientHeight;
        self.resize(_width,_height);
      });
    }
    BIM.util.bindKeyboard.init();
  }
  init();
}
BIM.common = {
  menu : {
    nav:[
      {
        id:'home',
        icon:'bar-home',
        title:'初始',
        fn:'home'
      },
      {
        id:'fit',
        icon:'bar-fit',
        title:'适应窗口(I)',
        fn:'fit',
        key:'I'
      },
      /*{
        id:'zoomIn',
        icon:'bar-zoomIn',
        title:'放大(X)',
        fn:'zoomIn',
        key:'X'
      },
      {
        id:'zoomOut',
        icon:'bar-zoomOut',
        title:'缩小(Z)',
        fn:'zoomOut',
        key:'Z'
      },*/
      {
        id:'divide'
      },
      {
        id:'select',
        icon:'bar-select',
        title:'选择(V)',
        fn:'select',
        key:'V'
      },
      {
        id:'handle',
        icon:'bar-handle',
        title:'平移(H)',
        fn:'handle',
        key:'H'
      },
      {
        id:'rotate',
        icon:'bar-rotate',
        title:'旋转(R)',
        fn:'rotate',
        key:'R'
      },
      {
        id:'camera',
        icon:'bar-camera',
        title:'视角(C)',
        fn:'camera',
        key:'C'
      },
      {
        id:'section',
        icon:'bar-section',
        title:'切面(P)',
        fn:'section',
        key:'P'
      },
      {
        id:'fly',
        icon:'bar-fly',
        title:'漫游(F)',
        fn:'fly',
        key:'F'
      },
      /*{
        id:'divide'
      },*/
      /*{
        id:'fullScreen',
        icon:'bar-fullScreen',
        title:'全屏',
        fn:'fullScreen'
      },*/
    ],
    camera:[
      {
        id:'southEast',
        icon:'bar-camera-southWest',
        title:'西南方向',
        fn:'southWest'
      },
      {
        id:'top',
        icon:'bar-camera-top',
        title:'上方',
        fn:'top'
      },
      {
        id:'bottom',
        icon:'bar-camera-bottom',
        title:'下方',
        fn:'bottom'
      },
      {
        id:'left',
        icon:'bar-camera-left',
        title:'左方',
        fn:'left'
      },
      {
        id:'right',
        icon:'bar-camera-right',
        title:'右方',
        fn:'right'
      },
      {
        id:'front',
        icon:'bar-camera-front',
        title:'前方',
        fn:'front'
      },
      {
        id:'behind',
        icon:'bar-camera-behind',
        title:'后方',
        fn:'behind'
      },
    ],
    section:'<div class="cross-section-head">剖面</div>\
      <div class="cross-section-body">\
        <div class="tab-content">\
          <div class="section-tabs">\
            <span data-index="0" class="section-tab-item selected">\
              <i class="bar-section-vertical"></i>\
            </span> \
            <span data-index="1" class="section-tab-item">\
              <i class="bar-section-horizontal"></i>\
            </span> \
          </div>\
          <div class="slider-box">\
            <i class="bar-section-offset"></i>\
            <input class="slider" data-type="offset" type="range" min="-100" max="100" >\
          </div>\
          <div class="slider-box">\
            <i class="bar-section-rotatex"></i>\
            <input class="slider" data-type="rotateX" type="range" min="-314" max="314" >\
          </div>\
          <div class="slider-box">\
            <i class="bar-section-rotatey"></i>\
            <input class="slider" data-type="rotateY" type="range" min="-314" max="314" >\
          </div>\
          <div class="slider-box">\
            <span class="reset">恢复初始</span>\
            <label class="switch">启用剖面<input type="checkbox" class="input-checkbox" /><span class="checkbox"></span></label>\
          </div>\
        </div>\
      </div>'
  }
}
BIM.util = {
  _extend : function(target,source){
    for (var p in source) {
      if (source.hasOwnProperty(p)) {
        target[p] = source[p];
      }
    }
    return target;
  },
  createDom:function(className){
    var dom = document.createElement('div');
    dom.className = className;
    return dom;
  },
  changeClass : function(element,className,curr){
    var el;
    if((typeof element) == 'object'){
      el = element
    }else{
      el = BIM.common._option.element.getElementsByClassName(element)[0];
    }
    var siblings = el.parentNode.getElementsByClassName(className);
    var reg = new RegExp('[ ]*'+curr,'g')
    for(var i=0,len=siblings.length;i<len;i++){
      var _cl = siblings[i].getAttribute('class');
      _cl = _cl.replace(reg,'')
      siblings[i].className = _cl;
      if(siblings[i] == el){
        el.className = _cl + ' ' + curr;
      }
    }
  },
  bindKeyboard : {
    sub:{},
    on:function(key,fn){
      this.sub[key]?this.sub[key].push(fn):(this.sub[key] = [])&&this.sub[key].push(fn);
    },
    pub:function(key,args){
      if(this.sub[key]){
        for (var i in this.sub[key]) {
          if(typeof(this.sub[key][i]) === 'function'){
            this.sub[key][i](args);
          }
          return this;
        }
        return false;
      }
    },
    init:function(){
      var self = this;
      document.addEventListener('keydown',function(e){
        var currKey=0,e=e||event;
        currKey=e.keyCode||e.which||e.charCode;
        var keyName = String.fromCharCode(currKey);
        self.pub(keyName)
      })
    }
  },
  toggleClass : function(element,curr){
    var el;
    if((typeof element) == 'string'){
      el = BIM.common._option.element.getElementsByClassName(element)[0];
    }else{
      el = element;
    }
    var _class = el.getAttribute('class');
    var reg = new RegExp('[ ]*'+curr,'g');
    if(_class.indexOf(curr)>=0){
      _class = _class.replace(reg,'');
      el.className = _class;
    }else{
      el.className = _class+" "+curr;
    }
  },
  listener : function(element,type,fn){
    if(typeof document.addEventListener != "undefined"){
      element.addEventListener(type,fn)
    }else{
      element.attachEvent('on'+type,fn)
    }
  },
  fullScreen : function(element){
    if(element.requestFullscreen){
      element.requestFullscreen();
    }else if(element.mozRequestFullScreen){
      element.mozRequestFullScreen();
    }else if(element.webkitRequestFullScreen){
      element.webkitRequestFullScreen();
    }else if(element.msRequestFullscreen){
      element.msRequestFullscreen();
    }
  },
  subscribers : [],
  on : function(event,fn){
    this.subscribers[event]?this.subscribers[event].push(fn):(this.subscribers[event] = [])&&this.subscribers[event].push(fn);
    return '{"event":"' + event +'","fn":"' + (this.subscribers[event].length - 1) + '"}';
  },
  pub : function(event,args){
    if(this.subscribers[event]){
      for (var i in this.subscribers[event]) {
        if(typeof(this.subscribers[event][i]) === 'function'){
          this.subscribers[event][i](args);
        }
        return this;
      }
      return false;
    }
  },
  off : function(subId){
    try{
      var id = JSON.parse(subId);
      this.subscribers[id.event][id.fn] = null;
      delete this.subscribers[id.event][id.fn];
    }catch(err){
      console.log(err);
    }
  },
  isEqual:function(x,y){
    if ( x === y ) {
      return true;
    }
    if (!(x instanceof Object) || !(y instanceof Object) || (x.constructor !== y.constructor) ) {
      return false;
    }
    for ( var p in x ) {
      if (x.hasOwnProperty(p)) {
        if (!y.hasOwnProperty(p)) {  
          return false; 
        }
        if (x[p] === y[p]) {  
          continue; 
        }
        if (typeof(x[p]) !== "object") {  
          return false; 
        }
        if (!Object.equals(x[p], y[p])) {  
          return false; 
        } 
      }
    }
    for ( p in y ) {
      if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) ) {
        return false;
      }
    }
    return true;
  },
  toggleCameraToolsBar : function(type){
    var subBar = BIM.common.bimBox.getElementsByClassName('sub-bar camera-bar');
    if(type == 'hide'){
      if(subBar.length>0){
        subBar[0].style.display = 'none';
      }
      return false;
    }
    if(subBar.length == 0){
      var cameraBar = BIM.common.menu.camera;
      subBar = document.createElement('div');
      var cameraHtml = '';
      for(var i=0,len=cameraBar.length;i<len;i++){
        var item = cameraBar[i];
        cameraHtml+='<i class="bar-item '+item.icon+'" data-id="'+ item.id +'" title="'+item.title+'"></i>';
      }
      subBar.className = 'sub-bar camera-bar'
      subBar.innerHTML = cameraHtml;
      BIM.common.bimBox.appendChild(subBar);
      var barItem = subBar.getElementsByClassName('bar-item');
      for(var i=0,len=barItem.length;i<len;i++){
        barItem[i].onclick = function(){
          BIM.util.changeClass(this,'bar-item','selected');
          var fn = this.getAttribute('data-id');
          BIM.common.self[fn]();
        }
      }
    }else{
      var flag = subBar[0].style.display;
      if(flag == 'none'){
        subBar[0].style.display = '';
      }else{
        subBar[0].style.display = 'none';
      }
    }
  },
  toggleSectionBar : function(type){
    var sectionBar = BIM.common.bimBox.getElementsByClassName('sub-bar cross-panel');
    if(type == 'hide'){
      if(sectionBar.length>0){
        sectionBar[0].style.display = 'none';
      }
      return false;
    }
    if(sectionBar.length == 0){
      sectionBar = document.createElement('div');
      sectionBar.className = 'sub-bar cross-panel'
      sectionBar.innerHTML = BIM.common.menu.section;
      BIM.common.bimBox.appendChild(sectionBar);
      BIM.common.viewer.clipToggle(true,false);
      BIM.common.viewer.clipVisible(true)
      var itemBar = sectionBar.getElementsByClassName('slider');
      var close = sectionBar.getElementsByClassName('close');
      close[0].onclick = function(){
        BIM.util.toggleSectionBar();
      }
      for(var i=0,len=itemBar.length;i<len;i++){
        BIM.util.listener(itemBar[i],'input',function(){
          var el = this,
              type = this.getAttribute('data-type'),
              val = this.value;
          switch(type){
            case 'offset':
              BIM.common.viewer.clipSetPlane(val/10);
              break;
            case 'rotateX':
              BIM.common.viewer.clipRotPlaneX(val/100);
              break;
            case 'rotateY':
              BIM.common.viewer.clipRotPlaneY(val/100);
              break;
          }
        });
      }
    }else{
      var flag = sectionBar[0].style.display;
      if(flag == 'none'){
        sectionBar[0].style.display = '';
      }else{
        sectionBar[0].style.display = 'none';
      }
    }
  },
  controll : function(type){
    var toolsBar = BIM.common.menu.nav;
    var bar = BIM.common.bimBox.getElementsByClassName('mod-bar')
    if(type == 'hide' && bar.length > 0){
      setSectionBar('hide');
      BIM.common.bimBox.removeChild(bar[0]);
      return false;
    }
    if(!bar.length && type !='hide'){
      var bar = document.createElement('div');
      bar.className = BIM.common._option.toolsClass;
      BIM.util.pub('controll');
      var html =''
      for(var i=0,len=toolsBar.length;i<len;i++){
        var item = toolsBar[i];
        if(item.id == 'divide'){
          html+='<span class="'+item.id+'"></span>'
        }else{
          html+='<i class="bar-item '+item.icon+'" data-id="'+ item.fn +'" title="'+item.title+'"></i>';
        }
        if(item.key){
          BIM.util.bindKeyboard.on(item.key,BIM.common.self[item.fn]);
        }
      }
      bar.innerHTML = html;
      BIM.common.bimBox.appendChild(bar);
      var barItem = bar.getElementsByClassName('bar-item');
      for(var i = 0,len = barItem.length;i<len;i++){
        barItem[i].onclick = function(){
          var fn = this.getAttribute('data-id');
          BIM.common.self[fn]();
        }
      }
    }
  }
}
BIM.prototype = {
  on:BIM.util.on,
  off:BIM.util.off,
  subscribers:BIM.util.subscribers,
  zoomIn : function () {
    BIM.util.pub('zoomIn');
    BIM.common.viewer.zoomIn();
  },
  zoomOut : function () {
    BIM.util.pub('zoomOut');
    BIM.common.viewer.zoomOut();
  },
  fit : function (id) {
    BIM.util.pub('fit');
    BIM.common.viewer.zoomToSelection(id);
  },
  home : function () {
    BIM.util.pub('home');
    BIM.common.viewer.setStandardView(CLOUD.EnumStandardView.ISO);
    BIM.common.bimBox().className = 'bim normal';
  },
  select : function () {
    BIM.util.pub('select');
    BIM.common.viewer.setPickMode();
    BIM.common.bimBox.className = 'bim select';
    BIM.util.changeClass('bar-select','bar-item','selected');
    BIM.util.toggleSectionBar('hide');
    BIM.util.toggleCameraToolsBar('hide');
  },
  handle : function () {
    BIM.util.pub('handle');
    BIM.common.viewer.setPanMode();
    BIM.common.bimBox.className = 'bim move';
    BIM.util.changeClass('bar-handle','bar-item','selected');
    BIM.util.toggleSectionBar('hide');
    BIM.util.toggleCameraToolsBar('hide');
  },
  rotate : function () {
    BIM.util.pub('rotate');
    BIM.common.viewer.setOrbitMode();
    BIM.common.bimBox.className = 'bim normal';
    BIM.util.changeClass('bar-rotate','bar-item','selected');
    BIM.util.toggleSectionBar('hide');
    BIM.util.toggleCameraToolsBar('hide');
  },
  fly : function () {
    BIM.util.pub('fly');
    BIM.common.viewer.setFlyMode();
    BIM.common.bimBox.className = 'bim fly';
    BIM.util.changeClass('bar-fly','bar-item','selected');
    BIM.util.toggleSectionBar('hide');
    BIM.util.toggleCameraToolsBar('hide');
  },
  resize : function(width,height){
    BIM.util.pub('resize');
    BIM.common.viewer.resize(width,height)
  },
  front : function () {
    BIM.util.pub('front');
    BIM.common.viewer.setStandardView(CLOUD.EnumStandardView.Front);
  },
  behind : function () {
    BIM.util.pub('behind');
    BIM.common.viewer.setStandardView(CLOUD.EnumStandardView.Back);
  },
  left : function () {
    BIM.util.pub('left');
    BIM.common.viewer.setStandardView(CLOUD.EnumStandardView.Left);
  },
  right : function () {
    BIM.util.pub('right');
    BIM.common.viewer.setStandardView(CLOUD.EnumStandardView.Right);
  },
  top : function () {
    BIM.util.pub('top');
    BIM.common.viewer.setStandardView(CLOUD.EnumStandardView.Top);
  },
  bottom : function () {
    BIM.util.pub('bottom');
    BIM.common.viewer.setStandardView(CLOUD.EnumStandardView.Bottom);
  },
  southEast : function () {
    BIM.util.pub('southEast');
    BIM.common.viewer.setStandardView(CLOUD.EnumStandardView.SouthEast);
  },
  southWest : function () {
    BIM.util.pub('southWest');
    BIM.common.viewer.setStandardView(CLOUD.EnumStandardView.SouthWest);
  },
  northEast : function () {
    BIM.util.pub('northEast');
    BIM.common.viewer.setStandardView(CLOUD.EnumStandardView.NorthEast);
  },
  northWest : function () {
    BIM.util.pub('northWest');
    BIM.common.viewer.setStandardView(CLOUD.EnumStandardView.NorthWest);
  },
  camera : function(){
    BIM.util.toggleCameraToolsBar();
    BIM.util.toggleSectionBar('hide');
    BIM.util.changeClass('bar-camera','bar-item','selected');
  },
  getCamera : function(){
    return BIM.common.viewer.getCamera();
  },
  setCamera : function(json){
    BIM.common.viewer.setCamera(json);
  },
  section : function(){
    BIM.util.toggleSectionBar();
    BIM.util.toggleCameraToolsBar('hide');
    BIM.util.changeClass('bar-section','bar-item','selected');
  },
  fullScreen : function(){
    BIM.util.fullScreen(BIM.common.bimBox);
    BIM.util.toggleClass('bar-fullScreen','bar-exit');
  }
}
BIM.createTree = function(element,data){
  var _self = this;
    _self.el = element;
    var tree = document.createElement('ul');
    tree.className = 'tree-view';
    var speciality = data.speciality,
        floor = data.floor,
        specialityTemp = document.createElement('li'),
        floorTemp = document.createElement('li');
    specialityTemp.className = floorTemp.className = 'rootNode';
    floorTemp.className = 'rootNode';
    specialityTemp.setAttribute('data-type','speciality');
    specialityTemp.innerHTML = getJson(speciality)
    function getJson(obj){
      var template = '<div class="item-content"> <i class="nodeSwitch"></i> <label class="checkbox"><input type="checkbox"><span class="box"></span></label><span class="text-field overflowEllipsis">专业</span> </div><ul class="treeViewSub mIconOrCk">';
      for(i in obj){
        template += '<li class="itemNode"> <div class="item-content"> <i class="nodeSwitch"></i> <label class="checkbox"><input type="checkbox"><span class="box"></span></label><span class="text-field overflowEllipsis">'+ i +'</span> </div> <ul class="treeViewSub mIconOrCk">'+ getSpeciality(obj[i]) +'</ul></li>'
      }
      template+="</ul>";
      return template;
    }
    floorTemp.setAttribute('data-type','floor');
    floorTemp.innerHTML = getFloor(floor);
    function getSpeciality(obj){
      var template = '',len=obj.length;
      for(var i = 0;i<len;i++){
        template +='<li class="itemNode"> <div class="item-content"> <i class="noneSwitch"></i> <label class="checkbox"><input type="checkbox" data-files="'+obj[i].fileEtag+'" data-id="'+obj[i].fileId+'"><span class="box"></span></label><span class="text-field overflowEllipsis">'+obj[i].fileName+'</span> </div> </li>';
      }
      return template;
    }
    function getFloor(obj){
      var template = '<div class="item-content"> <i class="nodeSwitch"></i> <label class="checkbox"><input type="checkbox" checked="checked"><span class="box"></span></label><span class="text-field overflowEllipsis">楼层</span> </div><ul class="treeViewSub mIconOrCk">';
      var len=obj.length;
      for(var i = 0;i<len;i++){
        var dataFiles = obj[i].fileEtags.join(',');
        template +='<li class="itemNode"> <div class="item-content"> <i class="noneSwitch"></i> <label  class="checkbox"><input type="checkbox" checked="checked" data-files="'+ dataFiles +'"><span class="box"></span></label><span class="text-field overflowEllipsis">'+obj[i].floor+'</span> </div> </li>';
      }
      return template;
    }
    addControl = function(element){
      var arr = [];
      BIM.util.listener(element,'change',function(event){
        var result = getFiles(specialityTemp).intersect(getFiles(floorTemp));
        console.log(result);
      });
      BIM.util.listener(element,'click',function(event){
        var e = event || event,
            that = e.target,
            cl = that.getAttribute('class');
        if('nodeSwitch' == cl){
          var parent = that.parentNode;
          BIM.util.toggleClass(parent,'open');
        }
      });
      function getFiles(element){
        var _input = element.getElementsByTagName('input'),
            nArr = [];
        for(var i=0,len=_input.length;i<len;i++){
          var that = _input[i]
          if(that.type == 'checkbox' && that.checked){
            var files = that.getAttribute('data-files');
            files = files ?files.split(',') : [];
            nArr = nArr.concat(files);
          }
        }
        return nArr.unique();
      }
    }
    tree.appendChild(specialityTemp);
    tree.appendChild(floorTemp);
    addControl(tree);
    _self.el.appendChild(tree);
}
Array.prototype.remove = function(item){
  var _self = this;
  if((typeof item) == 'object'){
    for(var i=0,len=item.length;i<len;i++){
      remove(item[i]);
    }
  }else{
    remove(item);
  }
  function remove(x){
    var index = _self.indexOf(x);
    if (index > -1) {
      _self.splice(index, 1);
    }
  }
}
Array.prototype.indexOf = function(item) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == item || BIM.util.isEqual(this[i],item)){
      return i;
    }
  }
  return -1;
}
Array.prototype.intersect = function(x){
  var arr = [];
  var that = this;
  var i=0;
  var len = that.length;
  for(;i<len;i++){
    if(x.indexOf(that[i]) > -1){
      arr.push(that[i]);
    }
  }
  return arr;
}
Array.prototype.unique = function(){
  var n = {},r=[];
  for(var i = 0; i < this.length; i++){
    if (!n[this[i]]){
      n[this[i]] = true;
      r.push(this[i]);
    }
  }
  return r;
}



