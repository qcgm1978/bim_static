/*
 * @require  /service/js/view//window/service.window.roleDetail.js
 */
var App = App || {};
App.Service.windowRoleList=Backbone.View.extend({

    tagName:"ul",

    events:{
    },

    template:_.templateUrl("/service/tpls/window/service.window.roleList.html"),
    render:function(){
        this.$el.html(this.template);
        return this;
    },
    initialize:function(){
       this.listenTo(App.Service.ozRole.collection,"add",this.addOne);
    },
    addOne:function(model){
        var newView = new App.Service.window.roleDetail({model:model});
        this.$el.append(newView.render().el);
    },

    //排序
    comparator:function(){

    }
});




