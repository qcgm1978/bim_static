/*
 * @require  /service/views/mem/service.MemCtrl.ozDetail.js
 * */
var App = App || {};
App.Service.MemCtrlChildList=Backbone.View.extend({

    tagName :'ul',

    template:_.templateUrl("/service/tpls/mem/service.memCtrl.oz.childList.html"),
    events:{

    },

    render:function(){
        this.collection.each(function(item){
            this.renderOg(item);
        },this);
        return this;
    },

    renderOg :function(item){
        var view = new App.Service.MemCtrlozDetail({model:item});
        this.$el.append(view.render().el);
    },

    initialize:function(models){
        this.collection = new App.Service.memCtrlBlend.outerCollection(models);
    }
});

