/*
 * @require  /service/js/collection/fun.list.js
 * */
var App = App || {};
App.Service.windowFunDetail=Backbone.View.extend({

    tagName:'li',

    template:_.templateUrl("/service/tpls/window/service.window.detail.html"),
    events:{
        "click .name":"select",
    },

    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        //Service.log( this.model.get("selected"));
        //Service.log( this.$("input")[0].checked);
        this.$("input")[0].checked = this.model.get("selected");//加载完毕之后
        return this;
    },

    initialize:function(){
        this.model.set("selected",false);
        this.listenTo(this.model, 'change', this.render);
    },

    //change事件
    spread:function(){

    },

    select:function() {
        var preV = this.$("input")[0].checked;
        if (preV) {
            this.$el.addClass("active");
        } else {
            this.$el.removeClass("active");
        }
        //var status = this.$(":checked")[0].checked ? this.$(":checked")[0].checked : false;
        this.model.set("selected",true);
    }
});




