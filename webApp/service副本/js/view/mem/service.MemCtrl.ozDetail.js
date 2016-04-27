/*
 * @require  /service/js/collection/model.js
 * */
var App = App || {};
App.Service.MemCtrlozDetail=Backbone.View.extend({

    tagName :'li',

    template:_.templateUrl("/Service/tpls/mem/service.MemCtrl.ozDetail.html"),
    events:{
    },

    render:function(){
        console.log(this.model);
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        //默认根据角色权限加载  adm用户加载全部，keyMem用户只显示项目管理
    }
});

