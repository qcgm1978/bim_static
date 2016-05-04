/**
 * author: kanghz
 * description: comment
 */
(function($){
  'use strict';
  var comment = function(options){
    var self = this;
    var defaults = {
      element:'',
      color:"#f00",
      width:"",
      height:"",
      lineWidth:2,
      fontSize:14,
      callback:null,
      autoResize:true
    };
    self._opt = $.extend({},defaults,options);
    self._opt.$el = $('<div class="comment"></div>');
    self._opt.$canvas = $('<div class="canvas"></div>');
    self._opt.$el.append(self._opt.$canvas);
    self.type = 'rect';
    self._opt.debugger = true;
    self.init();
  }
  comment.prototype = {
    _debug:function(){
      var self = this;
      if(!self._opt.debugger){
        if ('console' in window) {
          window.console = {
            log: function() {},
            error: function() {}
          };
        }
      }
    },
    sub:{},
    on:function(key,fn){
      var self = this;
      self.sub[key]?self.sub[key].push(fn):(self.sub[key] = [])&&self.sub[key].push(fn);
    },
    off:function(subId){
      try{
        var id = JSON.parse(subId);
        this.sub[id.key][id.fn] = null;
        delete this.sub[id.key][id.fn];
      }catch(err){
        console.log(err);
      }
    },
    pub:function(key,args){
      var self = this;
      if(self.sub[key]){
        for (var i in self.sub[key]) {
          self.sub[key][i](args);
          return self;
        }
        return false;
      }
    },
    init:function(){
      var self = this;
      var canvas = self.canvas = document.createElement("canvas");
      var viewCanvas = self.viewCanvas = document.createElement('canvas');
      $(viewCanvas).addClass("viewCanvas");
      self._opt.element.append(self._opt.$el);
      self._opt.$canvas.append(canvas);
      self._debug();
      if(self._opt.width && self._opt.height){
        self.resize(self._opt.width,self._opt.height);
        self._opt.autoResize = false;
      }else{
        self.resize();
      }
      self._topBar();
      self._footBar();
      self._bindEvent();
      self.consotroll();
    },
    resize:function(w,h){
      var self = this;
      self.canvas.width = self.viewCanvas.width = w || self._opt.$el.width();
      self.canvas.height = self.viewCanvas.height = h || self._opt.$el.height();
    },
    _topBar:function(){
      var self = this;
      var $el = self._opt.$el;
      var bar = $('<div class="topBar"><div class="context">请添加批注或直接保存快照<span class="saveBtn"><i class="iconOk"></i>保存</span><span class="cancelBtn">取消</span></div></div>');
      $el.append(bar);
    },
    _footBar:function(){
      var self = this;
      var $el = self._opt.$el;
      var bar = $('<div class="footBar"><i class="iconArrow" data-fn="arrow"></i><i class="iconRect selected" data-fn="rect"></i><i class="iconEllipse" data-fn="ellipse"></i><i class="iconMark" data-fn="mark"></i><i class="iconText" data-fn="text"></i><div class="fontSize"><select id="fontSize"><option value="12">12</option><option value="14">14</option><option value="16">16</option></select></div></div>');
      bar.on('click','i',function(){
        var $this = $(this),
            fn = $this.data('fn');
        $this.addClass("selected").siblings().removeClass("selected");
        self.type = fn;
        return false;
      }).on("change",'#fontSize',function(){
        var $this = $(this),
            fontSize = $this.val();
        console.log(fontSize);
      })
      $el.append(bar);
    },
    consotroll:function(){
      var self = this;
      var context = self.canvas.getContext("2d");
      var viewCtx = self.viewCanvas.getContext("2d");
      self.on("start",function(data){
        if(self.type == 'text'){
          var $el = self._opt.$el
          var _width = $el.width() - data.x;
          var _height = $el.height() - data.y;
          var textView = $('<div class="textView" style="left:'+data.x+'px;top:'+data.y+'px;"><div class="textContext"></div><textarea autofocus="true" style="width:'+_width+'px;height:'+_height+'px;"></textarea></div>');
          if($('.textView').length==0){
            $el.append(textView);
          }
          textView.on('input','textarea',function(){
            var $this = $(this),
                context = $('.textContext'),
                text = $this.val();
            text = text.replace(/\n/g,'<br />');
            console.log(text)
            context.html(text);
          })
        }else{
          self._opt.$el.append(self.viewCanvas);
        }
      })
      self.on("move",function(data){
        viewCtx.clearRect(0,0,self.canvas.width,self.canvas.height);
        self._canvas({
          context:viewCtx,
          type:self.type,
          startX:data.startX,
          startY:data.startY,
          endX:data.endX,
          endY:data.endY
        });
      });
      self.on("end",function(data){
        viewCtx.clearRect(0,0,self.canvas.width,self.canvas.height);
        self.viewCanvas.remove();
        self._canvas({
          context:context,
          type:self.type,
          startX:data.startX,
          startY:data.startY,
          endX:data.endX,
          endY:data.endY
        });
      })
    },
    _bindEvent:function(){
      var self = this;
      var $el = self._opt.$canvas;
      var topBar = $el.find("topBar");
      var footBar = $el.find("footBar");
      if(self._opt.autoResize) self.resize();
      $el.on("mousedown",function(e){
        var event = e || event;
        var deviation = self._opt.$el.offset();
        var deviation = $el.offset();
        var startPoint = {
          x : event.clientX - deviation.left,
          y : event.clientY - deviation.top
        };
        self.pub("start",startPoint);
        var data;
        if(self.type == "text") return false;
        $(document).on('mousemove',function(e){
          var event = e || event;
          var movePoint={
            x : event.clientX - deviation.left > $el.width() ? $el.width():event.clientX - deviation.left < 0 ? 0:event.clientX - deviation.left,
            y : event.clientY - deviation.top > $el.height() ? $el.height():event.clientY - deviation.top < 0 ? 0:event.clientY - deviation.top
          }
          data = {
            startX:startPoint.x,
            startY:startPoint.y,
            endX:movePoint.x,
            endY:movePoint.y
          }
          self.pub("move",data)
        }).one("mouseup",function(e){
          if(data){
            self.pub("end",data);
          }
          $(document).off('mousemove');
        });
      });
    },
    _canvas:function(options){
      var self = this;
      var defaults = {
        context:"",
        type:"rect",
        text:'',
        startX:0,
        startY:0,
        endX:0,
        endY:0
      },
      _opt = $.extend({},defaults,options);
      _opt.context.strokeStyle = self._opt.color;
      _opt.context.fillStyle = self._opt.color;
      _opt.context.lineWidth = self._opt.lineWidth;
      _opt.context.fontSize = self._opt.fontSize;
      switch(_opt.type){
        case "rect":
          rect(_opt.context,_opt.startX,_opt.startY,_opt.endX,_opt.endY)
          break;
        case "ellipse":
          ellipse(_opt.context,_opt.startX,_opt.startY,_opt.endX,_opt.endY)
          break;
        case "arrow":
          arrow(_opt.context,_opt.startX,_opt.startY,_opt.endX,_opt.endY)
          break;
        case "mark":
          mark(_opt.context,_opt.startX,_opt.startY,_opt.endX,_opt.endY)
          break;
        case "text":
          text(_opt.context,_opt.startX,_opt.startY,_opt.text)
          break;
      }
      function rect(ctx,startX,startY,endX,endY){
        var x = startX > endX ? endX : startX + self._opt.lineWidth,
            y = startY > endY ? endY : startY + self._opt.lineWidth,
            w = Math.abs(startX - endX) - self._opt.lineWidth*2,
            h = Math.abs(startY - endY) - self._opt.lineWidth*2
        // 画矩形
        ctx.beginPath();
        ctx.strokeRect(x,y,w,h);
        ctx.closePath();
      };
      function ellipse(ctx, startX, startY,endX,endY){
        // 画圆形
        var a = Math.abs(startX - endX)/2 + self._opt.lineWidth,
            b = Math.abs(startY - endY)/2 + self._opt.lineWidth,
            x = (startX + endX)/2 - self._opt.lineWidth*2,
            y = (startY + endY)/2 - self._opt.lineWidth*2;
        var step = (a > b) ? 1 / a : 1 / b;
        ctx.beginPath();
        for (var i = 0; i < 2 * Math.PI; i += step) {
          ctx.lineTo(x + a * Math.cos(i), y + b * Math.sin(i));
        }
        ctx.closePath();
        ctx.stroke();
      };
      function arrow(ctx,startX,startY,endX,endY) {
        ctx.beginPath();
        ctx.moveTo(startX,startY);
        ctx.lineTo(endX,endY);
        ctx.fill();
        ctx.stroke();
        ctx.save();
        ctx.translate(endX,endY);
        var ang = (endX - startX)/(endY - startY);
        ang = Math.atan(ang);
        if(endY - startY >= 0){
          ctx.rotate(-ang);
        }else{
          ctx.rotate(Math.PI-ang);
        }
        ctx.lineTo(-10,-20);
        ctx.lineTo(0,-10);
        ctx.lineTo(10,-20);
        ctx.lineTo(0,0);
        ctx.fill();
        ctx.restore();
        ctx.closePath();
      }
      function mark(ctx,startX,startY,endX,endY){
        ctx.beginPath();
        ctx.moveTo(startX,startY);
        ctx.lineTo(endX,endY);
        ctx.closePath();
        ctx.moveTo(startX,endY);
        ctx.lineTo(endX,startY);
        ctx.closePath();
        ctx.stroke();
      }
      function text(startX,startY,endX,endY,isText){
        var x = startX > endX ? endX : startX + self._opt.lineWidth,
            y = startY > endY ? endY : startY + self._opt.lineWidth,
            w = Math.abs(startX - endX) - self._opt.lineWidth*2,
            h = Math.abs(startY - endY) - self._opt.lineWidth*2
        // 画矩形
        ctx.beginPath();
        ctx.strokeRect(x,y,w,h);
        ctx.closePath();
      }
    }
  }
  App.Comm.modules.Comment = comment;
})(jQuery);
