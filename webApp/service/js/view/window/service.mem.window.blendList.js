/*
 * @require  /service/js/collection/memCtrl.blendList.js
 */
var App = App || {};
App.Service.window.blendList=Backbone.View.extend({

    tagName:"div",

    events:{},

    template:_.templateUrl("/service/tpls/mem/service.MemCtrl.blendList.html"),

    render:function(){
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
       this.listenTo(App.Service.memCtrlBlend.collection,"add",this.addOne);
        //$el为包含模板的元素，el为元素节点
        //默认根据角色权限加载  adm用户加载全部，keyMem用户只显示项目管理
    },
    //数据加载
    addOne:function(model){
        var newView = new App.Service.MemCtrlBlendDetail({model:model});
        this.$("#blendList").append(newView.render().el);
    },

    //创建一个collection，

    //排序
    comparator:function(){

    }


});




