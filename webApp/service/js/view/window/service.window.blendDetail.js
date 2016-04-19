/*
 * @require  /service/js/collection/memCtrl.blendList.js
 * */
var App = App || {};
App.Service.window.BlendDetail=Backbone.View.extend({
    tagName:'li',

    template:_.templateUrl("/service/tpls/window/service.window.blendDetail.html"),
    events:{

    },
    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){

        this.listenTo(this.model, 'change', this.render);
    }
});




