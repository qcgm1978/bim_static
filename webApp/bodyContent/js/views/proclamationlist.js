/**
 * @require /bodyContent/js/view/proclamation.js
 */
var App = App || {};
App.BodyContent.proclamationList = Backbone.View.extend({

    events:{
    //无事件，预留
    },
    render:function(){
        this.$el.html(this.template);
        return this;
    },

    initialize : function(){
        this.listenTo(App.BodyContent.control.proCollection,"add",this.addOne);
    },
    //数据加载
    addOne:function(item){
        var newView = new App.BodyContent.proclamationView({model : item});
        this.$el.append(newView.render().el);
    }
});