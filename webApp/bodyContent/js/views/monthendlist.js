/**
 * @require /bodyContent/js/view/monthEnd.js
 */
App.BodyContent.monthEndList = Backbone.View.extend({

    tagName:'tbody',

    id:"monthEnd",
    events:{
    //无事件，预留
    },
    render:function(){
        this.$el.html(this.template);
        return this;
    },

    initialize : function(){
        this.listenTo(App.BodyContent.control.monthEndCollection,"add",this.addOne);
    },
    //数据加载
    addOne:function(item){
        var newView = new App.BodyContent.monthEndView({model : item});
        this.$el.append(newView.render().el);
    }
});