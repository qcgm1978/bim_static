/**
  * @require /libsH5/js/bimView.js
*/
'use strict'
;(function($){
  bimView.sidebar = function(options,viewer){
    var self = this,
        _opt = options,
        viewer = viewer,
        bimBox = _opt._dom.bimBox,
        sidebar = $('<div class="modelSidebar"><div class="modelMap"></div><div class="modelFilter"></div></div>');
    bimBox.append(sidebar);
  }
})($);
