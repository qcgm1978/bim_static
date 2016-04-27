/*
 * @require /service/views/mem/service.MemCtrl.body.blendList.js
 * */
var App = App || {};
App.Service.window = {};
App.Service.window = {
    view : Backbone.View.extend({
            tagName:"div",
            className:"serviceWindow",
            template:_.templateUrl("/service/tpls/window/service.window.html",true),
            events:{
                "click .windowClose":"close",
                "click #mask" :"close"
            },
            render:function(){
                this.$el.html(this.template);
                return this;
            },
            //关闭，清理数据
            close:function(){
                $("#mask").hide().empty();//外层
            },
            initialize:function(){
            }
        }),

    init :function(){
        $("#mask").html(new App.Service.window.view().render().$el);
    }
};
