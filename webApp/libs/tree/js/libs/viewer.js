/**
 * @require /libs/tree/js/libs/inflate.min.js
  * @require /libs/tree/js/libs/three.min.js
   * @require /libs/tree/js/libs/WebViewer.min.js
 */


'use strict';
var BIM = function(option){
  var defaults = {
    element:'',
    cameraInfo:'',
    controll:true,
    projectId:'',
    resize:true,
    loading:null,
    loaded:null,
    tools:false,
    toolsClass:'mod-bar'
  };
  var subscribers = [];
  this.on = function(event,fn){
    subscribers[event]?subscribers[event].push(fn):(subscribers[event] = [])&&subscribers[event].push(fn);
    return '{"event":"' + event +'","fn":"' + (subscribers[event].length - 1) + '"}';
  }
  var pub = function(event,args){
    if(subscribers[event]){
      for (var i in subscribers[event]) {
        if(typeof(subscribers[event][i]) === 'function'){
          subscribers[event][i](args);
        }
        return this;
      }
      return false;
    }
  }
  this.off = function(subId){
    try{
      var id = JSON.parse(subId);
      this.subscribers[id.event][id.fn] = null;
      delete this.subscribers[id.event][id.fn];
    }catch(err){
      console.log(err);
    }
  }
  var _extend = function(target,source){
    for (var p in source) {
      if (source.hasOwnProperty(p)) {
        target[p] = source[p];
      }
    }
    return target;
  }
  var toggleClass = function(element,className,curr){
    var el = element,
        siblings = el.parentNode.getElementsByClassName(className);
    var reg = new RegExp('[ ]*'+curr,'g')
    for(var i=0,len=siblings.length;i<len;i++){
      var _cl = siblings[i].getAttribute('class');
      _cl = _cl.replace(reg,'')
      siblings[i].className = _cl;
      if(siblings[i] == el){
        el.className = _cl + ' ' + curr;
      }
    }
  }
  var listener = function(element,type,fn){
    if(typeof document.addEventListener != "undefined"){
      element.addEventListener(type,fn)
    }else{
      element.attachEvent('on'+type,fn)
    }
  }
  var self = this;
  var viewBox = document.createElement('div');
  var _opt = this._option = _extend(defaults,option);
  if(!_opt.element){
    console.error('element is not found!')
    return false;
  }
  var serverUrl = 'http://172.16.233.158/graph-srv-v2?';
  var viewer = new CloudViewer();
  viewer.onObjectSelected = function(objId){
    pub('click',objId);
    self.selectedObj = objId;
  }
  var loading = function(res){
    var total = res.totalModels,
        loaded = res.loadedModels,
        progress = loaded/total*100
    if(progress == 100){
    }
  }
  var loaded = function(res){
    viewer.render();
    if(!!_opt.loaded){
      _opt.loaded()
    }
  }
  var cameraBar = function(type){
    var cameraBar = _opt.element.getElementsByClassName('sub-bar camera-bar')
    if(type == 'hide' && cameraBar.length > 0){
      cameraBar[0].parentNode.removeChild(cameraBar[0])
      return false;
    }
    if(!cameraBar.length && type !='hide'){
      var cameraBar = document.createElement('div');
      var cameraMenu = ['southEast','top','bottom','left','right','front','behind']
      var cameraHtml = '';
      for(var i=0,len=cameraMenu.length;i<len;i++){
        var item = cameraMenu[i];
        cameraHtml+='<i class="bar-item bar-camera-'+item+'" data-id="'+ item +'"></i>';
      }
      cameraBar.className = 'sub-bar camera-bar'
      cameraBar.innerHTML = cameraHtml;
      _opt.element.appendChild(cameraBar);
      var barItem = cameraBar.getElementsByClassName('bar-item');
      for(var i=0,len=barItem.length;i<len;i++){
        barItem[i].onclick = function(){
          toggleClass(this,'bar-item','selected');
          var fn = this.getAttribute('data-id');
          self[fn]();
        }
      }
    }
  }
  var sectionTmp ='<div class="cross-section-head">剖面<span class="close"></span></div>\
    <div class="cross-section-body">\
        <div class="tab-content">\
          <div class="slider-box">\
            <i class="bar-section-offset"></i>\
            <input class="slider" data-type="offset" type="range" min="-100" max="100" >\
          </div>\
          <div class="slider-box">\
            <i class="bar-section-rotatex"></i>\
            <input class="slider" data-type="rotateX" type="range" min="-314" max="314" >\
          </div>\
          <div class="slider-box last">\
            <i class="bar-section-rotatey"></i>\
            <input class="slider" data-type="rotateY" type="range" min="-314" max="314" >\
          </div>\
      </div>\
  </div>';
  var setSectionBar = function(type){
    var sectionBar = _opt.element.getElementsByClassName('sub-bar cross-panel')
    if(type == 'hide' && sectionBar.length > 0){
      sectionBar[0].parentNode.removeChild(sectionBar[0])
      viewer.clipToggle(false,false);
      viewer.clipVisible(false)
      return false;
    }
    if(!sectionBar.length && type !='hide'){
      var sectionBar = document.createElement('div');
      var sectionHtml = sectionTmp;
      sectionBar.className = 'sub-bar cross-panel'
      sectionBar.innerHTML = sectionHtml;
      _opt.element.appendChild(sectionBar);
      viewer.clipToggle(true,false);
      viewer.clipVisible(true)
      var itemBar = sectionBar.getElementsByClassName('slider');
      var close = sectionBar.getElementsByClassName('close');
      close[0].onclick = function(){
        setSectionBar('hide');
      }
      for(var i=0,len=itemBar.length;i<len;i++){
        listener(itemBar[i],'input',function(){
          var el = this,
              type = this.getAttribute('data-type'),
              val = this.value;
          switch(type){
            case 'offset':
              viewer.clipSetPlane(val/10);
              break;
            case 'rotateX':
              viewer.clipRotPlaneX(val/100);
              break;
            case 'rotateY':
              viewer.clipRotPlaneY(val/100);
              break;
          }
        });
      }
    }
  }
  self.zoomIn = function () {
    pub('zoomIn');
    viewer.zoomIn();
  };
  self.zoomOut = function () {
    pub('zoomOut');
    viewer.zoomOut();
  };
  self.home = function () {
    pub('home');
    viewer.setStandardView(EnumStandardView.ISO);
    _opt.element.className = 'normal';
  };
  self.select = function () {
    pub('select');
    viewer.setPickMode();
    _opt.element.className = 'select';
  };
  self.handle = function () {
    pub('handle');
    viewer.setPanMode();
    _opt.element.className = 'move';
  };
  self.rotate = function () {
    pub('rotate');
    viewer.setOrbitMode();
    _opt.element.className = 'normal';
  };
  self.fly = function () {
    pub('fly');
    viewer.setFlyMode(false);
    _opt.element.className = 'fly';
  };
  self.resize = function(width,height){
    pub('resize');
    viewer.resize(width,height)
  };
  self.front = function () {
    pub('front');
    viewer.setStandardView(EnumStandardView.Front);
  };
  self.behind = function () {
    pub('behind');
    viewer.setStandardView(EnumStandardView.Back);
  };
  self.left = function () {
    pub('left');
    viewer.setStandardView(EnumStandardView.Left);
  };
  self.right = function () {
    pub('right');
    viewer.setStandardView(EnumStandardView.Right);
  };
  self.top = function () {
    pub('top');
    viewer.setStandardView(EnumStandardView.Top);
  };
  self.bottom = function () {
    pub('bottom');
    viewer.setStandardView(EnumStandardView.Bottom);
  };
  self.southEast = function () {
    pub('southEast');
    viewer.setStandardView(EnumStandardView.SouthEast);
  };
  self.southWest = function () {
    pub('southWest');
    viewer.setStandardView(EnumStandardView.SouthWest);
  };
  self.northEast = function () {
    pub('northEast');
    viewer.setStandardView(EnumStandardView.NorthEast);
  };
  self.northWest = function () {
    pub('northWest');
    viewer.setStandardView(EnumStandardView.NorthWest);
  };
  self.controll = function(type){
    var bar = _opt.element.getElementsByClassName('mod-bar')
    if(type == 'hide' && bar.length > 0){
      cameraBar('hide');
      setSectionBar('hide');
      _opt.element.removeChild(bar[0]);
      return false;
    }
    if(!bar.length && type !='hide'){
      var arr = ['home','zoomIn','zoomOut','select','handle','rotate','camera','section', 'fly'];
      var bar = document.createElement('div');
      bar.className = _opt.toolsClass;
      pub('controll');
      var html =''
      for(var i=0,len=arr.length;i<len;i++){
        var item = arr[i];
        if(item == 'handle'){
          html+='<i class="bar-item bar-'+item+' selected" data-id="'+ item +'"></i>';
        }else{
          html+='<i class="bar-item bar-'+item+'" data-id="'+ item +'"></i>';
        }
      }
      bar.innerHTML = html;
      _opt.element.appendChild(bar);
      var barItem = bar.getElementsByClassName('bar-item');
      for(var i = 0,len = barItem.length;i<len;i++){
        barItem[i].onclick = function(){
          var fn = this.getAttribute('data-id');
          switch(fn){
            case 'select':
            case 'handle':
            case 'rotate':
            case 'fly':
              cameraBar('hide');
              toggleClass(this,'bar-item','selected');
              self[fn]();
              break;
            case 'camera':
              cameraBar();
              toggleClass(this,'bar-item','selected');
              break;
            case 'section':
              setSectionBar();
              break;
            default:
              cameraBar('hide');
              self[fn]();
              break;
          }
        }
      }
    }
  }
  var init = function(){
    viewBox.style.width="100%";
    viewBox.style.height="100%";
    _opt.element.appendChild(viewBox)
    viewer.init(viewBox);
    viewer.load(_opt.projectId,serverUrl,loading,loaded);
    self.handle();
    if(_opt.tools){
      self.controll()
    }
    if(_opt.resize){
      listener(window,'resize',function(){
        var _width = _opt.element.clientWidth,
            _height = _opt.element.clientHeight;
        self.resize(_width,_height)
      });
    }
  }
  init();
}
BIM.prototype = {

}








