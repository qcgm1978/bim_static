/**
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
    etag:'',
    resize:true,
    tools:false,
    toolsClass:'mod-bar',
    single:false
  };
  var _util = BIM.util;
  var bimBox = BIM.common.bimBox = BIM.util.createDom('div','bim');
  var _opt = BIM.common._option = _util._extend(defaults,option);
  if(!_opt.element){
    console.error('element is not found!')
    return false;
  }else if((typeof _opt.element) == 'string'){
    _opt.element = document.getElementById(_opt.element);
  }
  _opt.element.innerHTML = '';
  if(_opt.single){
    CLOUD.GlobalData.CellVisibleLOD= 0;
    CLOUD.GlobalData.SubSceneVisibleLOD= 100;
  }
  var start = function(res){
    BIM.util.pub('start',res);
    _opt.loading = BIM.util.createDom('div','bim-loading');
    _opt.progress = BIM.util.createDom('div','bim-progress');
    _opt.loading.appendChild(_opt.progress);
    bimBox.appendChild(_opt.loading);
  }
  var loading = function(res){
    var total = res.progress.total,
        loaded = res.progress.loaded,
        progress = loaded/total*100;
    _opt.progress.style.width = progress+'%';
    if(progress == 100){
      bimBox.removeChild(_opt.loading);
    }
    BIM.util.pub('loading',progress)
  }
  var loaded = function(res){
    viewer.render();
    if(_opt.tools){
      BIM.util.controll();
    }
    BIM.util.pub('loaded',res);
  }
  var changed = function(res){
    BIM.util.pub('click',res);
  }
  var viewer = BIM.common.viewer = new CloudViewer();
  viewer.registerEventListener(CLOUD.EVENTS.ON_SELECTION_CHANGED, changed);
  viewer.registerEventListener(CLOUD.EVENTS.ON_LOAD_PROGRESS, loading);
  viewer.registerEventListener(CLOUD.EVENTS.ON_LOAD_COMPLETE, loaded);
  viewer.registerEventListener(CLOUD.EVENTS.ON_LOAD_START, start);
  var init = function(){
    var viewBox = self.viewBox = document.createElement('div');
    viewBox.className = "view";
    bimBox.appendChild(viewBox);
    _opt.element.appendChild(bimBox);
    viewer.init(viewBox);
    // self.client = viewer.load(_opt.etag,BIM.common.severModel);
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
  severModel:'http://bim.wanda-dev.cn/model/',
  severView:'http://bim.wanda-dev.cn/view/',
  menu : {
    nav:[
      {
        id:'fit',
        icon:'bar-fit',
        title:'适应窗口(I)',
        fn:'fit',
        key:'I',
        type:'click'
      },
      {
        id:'zoom',
        icon:'bar-zoom',
        title:'缩放(Z)',
        fn:'zoom',
        key:'Z',
        type:'selected'
      },
      {
        id:'fly',
        icon:'bar-fly',
        title:'漫游(Space)',
        fn:'fly',
        key:' ',
        type:'selected'
      }
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
          <div class="slider-box last">\
            <span class="reset">恢复初始剖面</span>\
            <label class="switch">启用剖面<input type="checkbox" class="input-checkbox" checked="checked" id="clip" /><span class="lbl"></span></label>\
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
  createDom:function(type,className){
    var dom = document.createElement(type);
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
    if(!el)return false
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
  ajax:function(option){
    var defaults= {
      type:'get',
      url:'',
      success:null
    }
    var _opt = BIM.util._extend(defaults,option);
    var xhr = null;
     if (window.ActiveXObject) {
       xhr = new ActiveXObject("Microsoft.XMLHTTP");
     } else if (window.XMLHttpRequest) {
       xhr = new XMLHttpRequest();
     }
     if (xhr != null) {
      xhr.open(_opt.type, _opt.url, true);
      xhr.send(null);
      xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
          if(xhr.status == 200){
            _opt.success&&_opt.success(xhr.responseText);
          }
        }
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
          this.sub[key][i].click();
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
    var _class = el.className;
    var reg = new RegExp('[ ]*'+curr,'g');
    if(_class.indexOf(curr)>=0){
      _class = _class.replace(reg,'');
      el.className = _class;
    }else{
      el.className = _class+" "+curr;
    }
  },
  removeClass:function(element,className,exclude){
    var reg = new RegExp('[ ]*'+className,'g');
    for(var i = 0,len = element.length;i<len;i++){
      var _self = element[i]
      if(!exclude || _self != exclude){
        var _className = _self.className;
        _className = _className.replace(reg,"");
        _self.className = _className;
      }
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
  parents:function(element,className){
    function getParent(element,className){
      var parents = element.parentNode;
      if(parents.className.indexOf(className)>-1){
        return parents;
      }else{
        return getParent(parents,className);
      }
    }
    return getParent(element,className);
  },
  next:function(element){
    return element.nextSibling.nodeType == 1 ? element.nextSibling : element.nextSibling.nextSibling;
  },
  prev:function(element){
    return element.previousSibling.nodeType == 1 ? element.previousSibling : element.previousSibling.previousSibling;
  },
  selectAll:function(element,pClass,sClass,fn){
    var parents = BIM.util.parents(element,pClass);
    var siblings = parents.parentNode.childNodes;
    var children = parents.getElementsByClassName(sClass);
    for(var i=0,len=children.length;i<len;i++){
      fn(children[i]);
    }
  },
  getAttr:function(element,pClass,cClass,dataType){
    var parents;
    if(pClass){
      parents = BIM.util.parents(element,pClass);
    }else{
      parents = element;
    }
    var checkboxs = parents.getElementsByClassName(cClass);
    if(checkboxs.length==0){
      return {
        type:"",
        ids:[]
      };
    }
    var obj = {
      type:checkboxs[0].getAttribute('data-type'),
      ids:[]
    };
    for(var i=0,len=checkboxs.length;i<len;i++){
      var attr = checkboxs[i].getAttribute(dataType);
      if(attr){
        obj.ids = obj.ids.concat(attr.split(','));
      }
    }
    return obj;
  },
  getFiles:function(element){
    var checkboxs  = element.getElementsByClassName('input'),
        files = []
    for(var i=0,len=checkboxs.length;i<len;i++){
      var that = checkboxs[i];
      if(!that.checked){
        var attr = checkboxs[i].getAttribute('data-files');
        if(attr){
          files = files.concat(attr.split(','));
        }
      }
    }
    return files;
  },
  getFilter:function(ids,fn){
    for(var i=0,len=ids.length;i<len;i++){
      fn(ids[i]);
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
  isEmptyObject: function(obj){
    for (var name in obj) {
      return false;
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
      var checkBox = sectionBar.getElementsByClassName('input-checkbox')[0];
      BIM.common.viewer.clipToggle(checkBox.checked,false);
      BIM.common.viewer.clipVisible(checkBox.checked);
      BIM.util.listener(checkBox,'change',function(){
        var that = this,
            flag = that.checked;
        BIM.common.viewer.clipToggle(flag,false);
        BIM.common.viewer.clipVisible(flag);
      });
      var itemBar = sectionBar.getElementsByClassName('slider');
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
      var reset = sectionBar.getElementsByClassName('reset');
      BIM.util.listener(reset[0],'click',function(){
        var j = 0;
        for(;j<len;j++){
          itemBar[j].value = 0;
        }
        BIM.common.viewer.clipHorizon(false);
      })
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
      for(var i=0,len=toolsBar.length;i<len;i++){
        var item = toolsBar[i];
        var tmp
        if(item.id == 'divide'){
          tmp = BIM.util.createDom('span',"bar-item "+item.icon);
        }else{
          tmp = BIM.util.createDom('i',"bar-item "+item.icon);
          tmp.title = item.title;
          tmp.setAttribute('data-id',item.fn);
          tmp.setAttribute('data-type',item.type)
        }
        bar.appendChild(tmp);
        if(item.key){
          BIM.util.bindKeyboard.on(item.key,tmp);
        }
      }
      BIM.common.bimBox.appendChild(bar);
      var barItem = bar.getElementsByClassName('bar-item');
      for(var i = 0,len = barItem.length;i<len;i++){
        barItem[i].onclick = function(){
          var fn = this.getAttribute('data-id'),
              type = this.getAttribute('data-type'),
              _className = this.className;
          if(type == "selected"){
            BIM.util.removeClass(barItem,"selected",this);
            BIM.util.toggleClass(this,"selected");
          }
          if(_className.indexOf("selected") ==-1){
            BIM.common.self[fn]();
          }else{
            BIM.common.self.picker();
          }
        }
      }
    }
  }
}
BIM.prototype = {
  on:function(key,callback){
    BIM.util.on(key,callback);
    return this;
  },
  off:function(key,callback){
    BIM.util.off(key,callback);
    return this;
  },
  subscribers:BIM.util.subscribers,
  zoom : function () {
    BIM.common.bimBox.className = 'bim';
    BIM.util.pub('zoom');
    BIM.common.viewer.setZoomMode();
  },
  zoomIn : function () {
    BIM.util.pub('zoomIn');
    BIM.common.viewer.zoomIn();
  },
  zoomOut : function () {
    BIM.util.pub('zoomOut');
    BIM.common.viewer.zoomOut();
  },
  zoomSelected : function () {
    BIM.common.viewer.zoomToSelection();
  },
  fit : function (id) {
    BIM.util.pub('fit');
    BIM.common.viewer.zoomToSelection(id);
  },
  home : function () {
    BIM.util.pub('home');
    BIM.common.viewer.setStandardView(CLOUD.EnumStandardView.ISO);
  },
  select : function () {
    BIM.util.pub('select');
    BIM.common.viewer.setPickMode();
    BIM.common.bimBox.className = 'bim select';
    BIM.util.toggleSectionBar('hide');
    BIM.util.toggleCameraToolsBar('hide');
  },
  handle : function () {
    BIM.util.pub('handle');
    BIM.common.viewer.setPanMode();
    BIM.common.bimBox.className = 'bim';
    BIM.util.toggleSectionBar('hide');
    BIM.util.toggleCameraToolsBar('hide');
  },
  rotate : function () {
    BIM.util.pub('rotate');
    BIM.common.viewer.setOrbitMode();
    BIM.common.bimBox.className = 'bim normal';
    BIM.util.toggleSectionBar('hide');
    BIM.util.toggleCameraToolsBar('hide');
  },
  fly : function () {
    BIM.util.pub('fly');
    BIM.common.viewer.setFlyMode();
    BIM.common.bimBox.className = 'bim fly';
    BIM.util.toggleSectionBar('hide');
    BIM.util.toggleCameraToolsBar('hide');
  },
  picker:function(){
    BIM.common.bimBox.className = 'bim';
    BIM.common.viewer.setPickMode();
  },
  resize : function(){
    BIM.util.pub('resize');
    var _viewBox = BIM.common.self.viewBox,
        _width = _viewBox.clientWidth,
        _height = _viewBox.clientHeight;
    BIM.common.viewer.resize(_width,_height);
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
  },
  getCamera : function(){
    return window.btoa(BIM.common.viewer.getCamera());
  },
  setCamera : function(json){
    BIM.common.viewer.setCamera(window.atob(json));
  },
  viewpoint : function(){
    var self = this;
    BIM.util.pub('viewpoint',self.getCamera());
  },
  section : function(){
    BIM.util.toggleSectionBar();
    BIM.util.toggleCameraToolsBar('hide');
  },
  fullScreen : function(){
    BIM.util.fullScreen(BIM.common.bimBox);
  },
  hide:function(obj){
    var viewer = BIM.common.viewer;
    var filter = viewer.getFilters();
    BIM.util.getFilter(obj.ids,function(id){
      filter.addUserFilter(obj.type,id);
    });
    viewer.render();
  },
  show:function(obj){
    var viewer = BIM.common.viewer;
    var filter = viewer.getFilters();
    BIM.util.getFilter(obj.ids,function(id){
      filter.removeUserFilter(obj.type,id);
    });
    viewer.render();
  },
  hideScene:function(obj){
    var viewer = BIM.common.viewer;
    var filter = viewer.getFilters();
    filter.removeUserFilter(obj.type);
    BIM.util.getFilter(obj.ids,function(id){
      filter.addUserFilter(obj.type,id);
    });
    viewer.render();
  },
  showScene:function(client,flag){
    var viewer = BIM.common.viewer;
    viewer.showScene(client,flag);
    viewer.render();
  },
  highlight:function(obj){
    var viewer = BIM.common.viewer;
    var filter = viewer.getFilters();
    BIM.util.getFilter(obj.ids,function(id){
      filter.setUserOverrider(obj.type,id);
    });
    viewer.render();
  },
  downplay:function(obj){
    var viewer = BIM.common.viewer;
    var filter = viewer.getFilters();
    BIM.util.getFilter(obj.ids,function(id){
      filter.removeUserOverrider(obj.type,id);
    });
    viewer.render();
  },
  selectIds:function(ids){
    var viewer = BIM.common.viewer;
    var filter = viewer.getFilters();
    filter.setSelectedIds(ids);
    viewer.render();
  },
  unSelected:function(){
    var viewer = BIM.common.viewer;
    var filter = viewer.getFilters();
    filter.setSelectedIds();
    viewer.render();
  },
  setFloorMap:function(obj,name){
    var viewer = BIM.common.viewer;
    viewer.setFloorPlaneData(obj);
    viewer.generateFloorPlane(name);
  },
  setAxisGrid:function(obj,name){
    var viewer = BIM.common.viewer;
    viewer.setAxisGridData(obj);
    viewer.generateAxisGrid(name);
  },
  toggleAxisGrid:function(){
    var that = this,
        self = BIM.common.self;
    if(that.axisGrid){
      self.hideAxisGrid();
      that.axisGrid = false;
    }else{
      self.showAxisGrid();
      that.axisGrid = true;
    }
  },
  showAxisGrid:function(name){
    var viewer = BIM.common.viewer;
    viewer.showAxisGrid(name,true);
  },
  hideAxisGrid:function(name){
    var viewer = BIM.common.viewer;
    viewer.showAxisGrid(name,false);
  },
  zoomBox:function(box){
    var viewer = BIM.common.viewer;
    viewer.zoomToBBox(CLOUD.Utils.computeBBox(box));
    viewer.render();
  },
  collision:function(ids){
    var viewer = BIM.common.viewer;
    var filter = viewer.getFilters();
    filter.setSelectedIds(ids);
    filter.enableSceneOverrider(true);
    viewer.render();
  },
  setGlobalTransparent:function(flag){
    var viewer = BIM.common.viewer;
    var filter = viewer.getFilters();
    filter.enableSceneOverrider(flag);
    viewer.render();
  },
  load:function(etag){
    var viewer = BIM.common.viewer;
    var client = viewer.load(etag,BIM.common.severModel);
    viewer.render();
    return client;
  },
  initMap:function(name,element){
    var viewer = BIM.common.viewer,
        _el = element,
        _width = _el.clientWidth,
        _height = _el.clientHeight,
        _css={
          left:'0px',
          bottom:'0px',
          outline:'none'
        };
    viewer.createMiniMap(name,_el,_width,_height,_css,function(res){
      BIM.util.pub('changeGrid',res);
    });
    viewer.generateFloorPlane(name);
    viewer.generateAxisGrid(name);
  },
  getImage:function(){
    var viewer = BIM.common.viewer;
    return viewer.canvas2image();
  },
  registerEvent:function(){
    var viewer = BIM.common.viewer;
    viewer.registerDomEventListeners();
  },
  unregisterEvent:function(){
    var viewer = BIM.common.viewer;
    viewer.unregisterDomEventListeners();
  }
}



