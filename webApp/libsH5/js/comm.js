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
      }else{
        $.each(list,function(i,item){
          var $item = $(item),
              isChecked = $item.find('input').prop('checked'),
              userData = $item.data('userData').toString().split(",");
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
    }
  }
})($);
