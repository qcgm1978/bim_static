/*
 * @require  /service/collection/role.list.js
 * */
var App = App || {};
App.Service.window.roleDetail=Backbone.View.extend({

    tagName:'li',

    template:_.templateUrl("/service/tpls/window/service.window.roleDetail.html"),
    events:{
        "click .name":"memCheck"
    },
    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    initialize:function(){
        this.listenTo(this.model,"change:checked",this.checked);
    },

    //加载判断
    checked:function(){
        if(this.model.get("checked")){
            this.$el.addClass("active");
        }
    },
    //点选
    memCheck:function(){
        var checkEle = this.model.get("checked");
        if(!checkEle){
            this.$el.addClass("active");
            this.model.set({"checked":true});
        }else{
            this.$el.removeClass("active");
            this.model.unset("checked");
        }
    }
});




