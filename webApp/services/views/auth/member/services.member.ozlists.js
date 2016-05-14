/*
 * @require  /services/views/auth/member/services.member.ozDetail.js
 * */
App.Services.MemberozList = Backbone.View.extend({

    tagName :'ul',

    template:_.templateUrl("/services/tpls/auth/member/services.member.ozlist.html"),

    events:{},

    render:function(){
        this.collection.each(function(item){
            this.addOrg(item);
        },this);
        return this;
    },

    addOrg :function(item){
        var view = new App.Services.MemberozDetail({model:item});
        this.$el.append(view.render().el);
    },

    initialize:function(models){
        this.collection = new App.Services.Member.collection(models);
        //App.Comm.initScroll(this.$el.find(".fileContainerScrollContent"),"y");滚动条
    }
});

