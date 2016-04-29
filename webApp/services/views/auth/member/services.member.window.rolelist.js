/*
 * @require  /services/views/auth/index.es6
 */
App.Services.windowRoleList=Backbone.View.extend({

    tagName:"ul",
    events:{},

    template:_.templateUrl("/services/tpls/auth/windows/services.member.window.detail.html"),
    render:function(){
        this.$el.html(this.template);
        return this;
    },
    initialize:function(){
       this.listenTo(App.Services.ozRole.collection,"add",this.addOne);
    },
    addOne:function(model){
        var newView = new App.Services.windowRoleDetail({model:model});
        this.$el.append(newView.render().el);
    },

    //排序
    comparator:function(){

    }
});




