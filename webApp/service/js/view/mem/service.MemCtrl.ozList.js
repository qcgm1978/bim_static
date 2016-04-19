/*
 * @require  /service/js/view/mem/service.MemCtrl.ozDetail.js
 * */
var App = App || {};
App.Service.MemCtrl=Backbone.View.extend({

    tagName :'div',

    template:_.templateUrl("/service/tpls/mem/service.MemCtrl.html"),
    events:{
        "click .outer":'outer',
        "click .inner":'inner'
    },

    render:function(){
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
        //默认根据角色权限加载  adm用户加载全部，keyMem用户只显示项目管理
    },

    //外部用户
    outer:function(){
        //清空右面视图
        //reset数据
        //App.Service.memCtrlBlend.collection.reset();
        //获取 人员数据，如果无人员return，添加到collection，设置类型为员工
        //获取 组织数据，如果无组织return，添加到collection，设置类型为组织
        App.Comm.ajax({urlType:"fetchServiceMCBlendList",outer:true},function(response){

            console.log(response);
        });
        //App.Service.memCtrlBlend.loadData(App.Service.memCtrlBlend.collection,{outer:true})
    },
    //内部用户
    inner:function(){
        //App.Service.memCtrlBlend.loadData(App.Service.memCtrlBlend.collection,{outer:false})
    }
});
