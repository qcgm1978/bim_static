/**
  * @require /libsH5/js/bimView.js
*/
'use strict'
;(function($){
  bimView.comm = {
    ajax:function(data,callback){
      //封装ajax
      data = bimView.comm.getUrl(data);
      return $.ajax(data).done(function(data) {
        if ($.isFunction(callback)) {
          //回调
          callback(data);
        }
      });
    },
    getUrl: function(data) {
      // 根据API获取对应url
      var self = this;
      var result = data;
      //url 是否有参数
      var urlPars = data.url.match(/\{([\s\S]+?(\}?)+)\}/g);
      if (urlPars) {
        for (var i = 0; i < urlPars.length; i++) {
          var rex = urlPars[i],
            par = rex.replace(/[{|}]/g, ""),
            val = data[par];
            result.url = result.url.replace(rex, val);
        }
      }
      result.url = bimView.API.baseUrl + result.url
      return result;
    },
    removeById:function(arr,id){
      var tmpArr = arr.concat();
      var index = tmpArr.indexOf(id);
      tmpArr.splice(index,1);
      return tmpArr
    },
    getFilters:function(element,select){
      var type = element.data('type'),
          list = element.find('.itemNode').length==0 ? element:element.find('.itemNode'),
          result = {
            type:type,
            ids:[]
          };
      if(type == 'classCode'){
        var regData = [],
            classCodeData = bimView.sidebar.classCodeData;
        $.each(list,function(i,item){
          var $item = $(item),
              isChecked = $item.find('input').prop('checked'),
              userData = $item.data('userData')?$item.data('userData').toString():'';
          if(select == 'ckecked' && !isChecked || select == 'all'){
            regData.push(userData);
          }
        });
        var str = regData.toString().replace(/,/g,"|");
        var reg = new RegExp("^("+str+")");
        $.each(classCodeData,function(i,item){
          if(regData.length == 0)return
          if(item.parentCode == -1){
            if(regData.indexOf("-1")!=-1){
              result.ids.push(item.code);
            }
          }
          if(reg.test(item.code)){
            result.ids.push(item.code);
          }
        });
      }else if(type == 'sceneId'){
        result.total = [];
        $.each(list,function(i,item){
          var $item = $(item),
              isChecked = $item.find('input').prop('checked'),
              userData = $item.data('userData') ? $item.data('userData').toString().split(","):[];
          if(select == 'ckecked' && !isChecked || select == 'all'){
            result.ids = result.ids.concat(userData);
          }
          result.total = result.total.concat(userData);
        });
        result.total = result.total.unique();
        result.total = result.total.minus(result.ids);
      }else{
        $.each(list,function(i,item){
          var $item = $(item),
              isChecked = $item.find('input').prop('checked'),
              userData = $item.data('userData') ? $item.data('userData').toString().split(","):[];
          if(select == 'ckecked' && !isChecked || select == 'all'){
            result.ids = result.ids.concat(userData);
          }
        });
      }
      return result;
    },
    bindEvent:{// 绑定事件
      sub:{},
      on:function(key,element){
        this.sub[key]?this.sub[key].push(element):(this.sub[key] = [])&&this.sub[key].push(element);
      },
      pub:function(key){
        if(this.sub[key]){
          for (var i=0,len = this.sub[key].length;i<len;i++) {
            this.sub[key][i].click();
          }
        }
      },
      keyPress:function(e){
        var e = e || event,
            currKey = e.keyCode || e.which || e.charCode;
        bimView.comm.bindEvent.pub(currKey);
      },
      keyboardEvent:function(){
        var self = this;
        $(document).on('keypress',self.keyPress);
      },
      removeEvent:function(){
        $(document).off('keypress',self.keyPress);
      },
      init:function(){
        this.keyboardEvent();
      }
    },
    viewTree:function(options){
      var defualts = {
        arr:[],
        name:'',
        code:'',
        type:'',
        dataType:'arr',
        children:'',
        childrenName:'',
        childrenType:'arr',
        data:'',
        id:'',
        isChecked:true
      },
      _opt = $.extend({},defualts,options);
      return renderTree(_opt.arr,_opt.name,_opt.dataType);
      function renderTree(arr,name,dataType,prefix){
        if(arr.length == 0) return;
        var tree = $('<div class="tree"></div>');
        $.each(arr,function(i,item){
          var type = _opt.type,
              itemName,data,iconStatus,input;
          if(dataType == 'arr'){
            itemName = item[name];
            data = item[_opt.data] ? item[_opt.data].toString() :'';
          }else{
            itemName = item;
            if(prefix!=null){
              data = prefix +"_"+ i;
            }else{
              data = i;
            }
          };
          if(item[_opt.children]){
            iconStatus = 'm-openTree';
          }else{
            iconStatus = 'noneSwitch';
          }
          if(_opt.isChecked){
           input = '<input type="checkbox" checked="checkde" />'
          }else{
            input = '<input type="checkbox" />'
          }
          var tmpHtml = $('<li class="itemNode" data-type="'+type+'">\
            <div class="itemContent">\
            <i class="'+iconStatus+'"></i>\
            <label class="treeCheckbox">'+input+'<span class="m-lbl"></span></label>\
            <span class="treeText">'+itemName+'</span>\
          </div></li>');
          tmpHtml.data('userData',data);
          if(item[_opt.children]&&typeof item[_opt.children] =="object"){
            var children = renderTree(item[_opt.children],_opt.childrenName,_opt.childrenType,item[_opt.code]);
            tmpHtml.append(children);
          }
          tree.append(tmpHtml);
        });
        return tree;
      }
    },
    dialog:function(options){
      var defaults = {
        title:"系统提示",
        content:"",
        okText:"确定",
        callback:null
      };
      var _opt = $.extend({},defaults,options);
      var dialog = $('<div class="modelDialog"><div class="dialogBody"><div class="dialogHeader">'+_opt.title+'<span class="dialogClose"></span></div><div class="dialogContent"></div><div class="dialogFooter"><input type="button" class="dialogOk dialogBtn" value="'+_opt.okText+'"/></div></div></div>');
      dialog.find(".dialogContent").append(_opt.content);
      dialog.find(".dialogFooter").prepend(_opt.footer);
      $('body').append(dialog);
      dialog.on('click','.dialogClose',function(){
        dialog.remove();
      }).on('click','.dialogOk',function(){
        if (_opt.callback && _opt.callback.call(this) !== false) {
          dialog.remove();
        }
      })
    },
    getModelBgColor:function(){
      if(window.localStorage){
        return localStorage.getItem('modelBgColor') || 'color-1';
      }else{
        return 'color-1'
      }
    },
    setModelBgColor:function(color){
      if(window.localStorage){
        localStorage.setItem('modelBgColor',color);
      }
    }
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
      if (this[i] == item){
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
  Array.prototype.minus = function(arr){
    var result = [];
    var self = this;
    for(var i=0,len = self.length;i<len;i++){
      var flag = true;
      for(var j=0,arrLen = arr.length;j<arrLen;j++){
        if (arr[j] == self[i]) {
          flag = false;
        }
      }
      if(flag){
        result.push(self[i]);
      }
    }
    return result;
  }
})($);
