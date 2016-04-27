/*
 * @require  /service/js/collection/model.js
 * */
var App = App || {};
App.Service.MemCtrlChildList=Backbone.View.extend({

    tagName :'div',

    template:_.templateUrl("/Service/tpls/mem/service.memCtrl.oz.childList.html"),
    events:{
    },

    render:function(){
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
        //默认根据角色权限加载  adm用户加载全部，keyMem用户只显示项目管理
    }
});

