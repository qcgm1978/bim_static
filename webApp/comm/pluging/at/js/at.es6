  ;
  (function($) {

      $.fn.at = function(opts) {

          $(this).each(function() {
              new at($(this), opts);
          });

      }

      function at($el, opts) {

          var defaults = {
              $el: $el, //当前元素
              ePos: 0, //光标位置
              data: null
          }

          this.Settings = $.extend(defaults, opts);

          this.Settings.id = $el.attr("id");

          //绑定过不用再次绑定    
          if ($el.parent().hasClass("atBox")) {
              return;
          }

          //初始化
          this.init();
      }

      //初始化
      at.prototype.init = function() {
          //构建html
          this.buildHtml();
          //初始化事件
          this.initEvent();
      }

      at.prototype.buildHtml = function() {


          //包裹            
          this.Settings.atBox = this.Settings.$el.wrap('<div class="atBox"></div>').parent();

          this.Settings.atDiv =
              $('<div  class="atDiv" contenteditable="true"></div>');

          this.Settings.atList =
              $('<ul class="atList"><li class="loadingUser item">加载中……</li></ul>');

          this.Settings.atBox.append(this.Settings.atDiv);
          this.Settings.atBox.append(this.Settings.atList);

          //样式设置
          this.Settings.atBox.css("display", this.Settings.$el.css("display"));
          this.Settings.atDiv.css({
              width: this.Settings.$el.width(),
              height: this.Settings.$el.height()
          });

      }

      at.prototype.initEvent = function() {

          var that = this;
          //keyup
          this.Settings.$el.on("keyup", function() {

              var keyCode = event.keyCode;

              if (keyCode == 50) {

                  var index = that.Settings.ePos = that.getCursortPosition(),
                      val = that.Settings.$el.val().substring(0, index);

                  //替换空格 回车
                  val = val.replace(/[\n\r]/gi, "<br/>").replace(/[ ]/g, "a");

                  val += '<span class="at"></span>'; //标示列

                  that.Settings.atDiv.html(val);

                  var paddingWidth = parseInt($(this).css("padding-left")) + parseInt($(this).css("padding-right")),
                   
                      paddingHeight = parseInt($(this).css("padding-top")) + parseInt($(this).css("padding-bottom")),
                   
                      pos = that.Settings.atDiv.height($(this).height() + paddingHeight).width($(this).width() + paddingWidth).find(".at").position();

                  that.Settings.atList.css({
                      top: pos.top + 20,
                      left: pos.left + 6
                  }).show();

              } else if (keyCode == 32 || keyCode == 13) {
                  //回车 空格
                  that.Settings.atList.hide();

              } else if (keyCode == 8) {
                  //回退
                  var index = ePos = that.getCursortPosition(),

                      val = that.Settings.$el.val().substring(0, index),

                      valArr = val.split(' '),

                      len = valArr.length;

                  if (valArr[len - 1].indexOf('@') < 0) {

                      that.Settings.atList.hide();
                  }

              }
          });

          this.Settings.$el.on("click", function() {

              var index = that.Settings.ePos = that.getCursortPosition(),

                  val = that.Settings.$el.val().substring(0, index),

                  valArr = val.split(' '),

                  len = valArr.length;
              //点击了 at
              if (valArr[len - 1].indexOf('@') > -1) {

                  val = val.replace(/[\n\r]/gi, "<br/>").replace(/[ ]/g, "a");

                  val += '<span class="at"></span>';

                  that.Settings.atDiv.html(val);

                  var pos = that.Settings.atDiv.find(".at").position();

                  that.Settings.atList.css({
                      top: pos.top + 20,
                      left: pos.left + 6
                  }).show();

                  event.stopPropagation();
              }
          });

          that.Settings.atList.on("click", ".item", function() {

              var text = $(this).text(),

                  val = that.Settings.$el.val(),

                  before = val.substring(0, that.Settings.ePos),

                  beforeCount = before.length,

                  lastIndex = val.substring(0, that.Settings.ePos).lastIndexOf('@'),

                  after = val.substring(that.Settings.ePos);

              that.Settings.$el.val(before.substring(0, lastIndex + 1) + text + after);
              that.Settings.ePos += text.length;
              that.setCaretPosition(that.Settings.ePos);

          });


          $(document).on("click", function() {
              that.Settings.atList.hide();
          });

      }

      //at list 位置
      at.prototype.atListPosition=function(){

      }

      //获取光标位置
      at.prototype.getCursortPosition = function() {
          var ctrl = this.Settings.$el[0];
          //获取光标位置函数 
          var CaretPos = 0; // IE Support
          if (document.selection) {
              ctrl.focus();
              var Sel = document.selection.createRange();
              Sel.moveStart('character', -ctrl.value.length);
              CaretPos = Sel.text.length;
          }
          // Firefox support 
          else if (ctrl.selectionStart || ctrl.selectionStart == '0')
              CaretPos = ctrl.selectionStart;
          return (CaretPos);
      }

      //设置光标位置
      at.prototype.setCaretPosition = function(pos) {
          var ctrl = this.Settings.$el[0];
          if (ctrl.setSelectionRange) {
              ctrl.focus();
              ctrl.setSelectionRange(pos, pos);
          } else if (ctrl.createTextRange) {
              varrange = ctrl.createTextRange();
              range.collapse(true);
              range.moveEnd('character', pos);
              range.moveStart('character', pos);
              range.select();
          }
      }

  })(jQuery);