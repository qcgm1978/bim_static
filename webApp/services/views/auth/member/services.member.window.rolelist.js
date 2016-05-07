/*
 * @require  /services/views/auth/member/services.member.detail.js
 */
App.Services.windowRoleList=Backbone.View.extend({

    tagName:"div",
    events:{},

    template:_.templateUrl("/services/tpls/auth/member/services.member.ozlist.html"),
    render:function(){
        this.$el.html(this.template);
        return this;
    },
    initialize:function(){
       this.listenTo(App.Services.Member.SubRoleCollection,"add",this.addOne);
       this.listenTo(App.Services.Member.SubRoleCollection,"reset",this.render);
    },
    addOne:function(model){
        var newView = new App.Services.windowRoleDetail({model:model});
        this.$("ul").append(newView.render().el);
    },
    //排序
    comparator:function(){}
});




