/*
 * @require /bodyContent/js/app.js
 */
var App = App || {};
App.BodyContent.App.TipDialogV = Backbone.View.extend({
    el:$("#contains"),
    template:_.templateUrl("/bodyContent/tpls/bodyContent.tipDialog.html",true),
    render:function(){
        this.$el.html(this.template);
        this.getTipDataHandle();//获取提示信息的方法
        return this;
    },
    getTipDataHandle:function(){//获取提示信息的方法
        
    }
});