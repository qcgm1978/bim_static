/**
 * @require /bodyContent/js/views/monthStart.js
 */
var App = App || {};
App.BodyContent.monthStartList = Backbone.View.extend({

    tagName:'tbody',
    id:"monthStart",

    events:{
    //无事件，预留
    },
    render:function(){
        this.$el.html(this.template);
        return this;
    },

    initialize : function(){
        this.listenTo(App.BodyContent.control.monthStartCollection,"add",this.addOne);
    },
    //数据加载
    addOne:function(item){
        var newView = new App.BodyContent.monthStartView({model : item});
        this.$el.append(newView.render().el);
    }
});