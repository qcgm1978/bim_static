/*
 * @require  /services/views/auth/member/services.member.ozDetail.js
 * */
App.Services.MemberType = "inner";//默认加载类型
App.Services.MemberozList = Backbone.View.extend({

    tagName :'ul',

    template:_.templateUrl("/services/tpls/auth/member/services.member.ozList.html"),

    events:{},

    render:function(){
        this.collection.each(function(item){
            this.renderOg(item);
        },this);
        return this;
    },

    renderOg :function(item){
        var view = new App.Services.MemberozDetail({model:item});
        this.$el.append(view.render().el);
    },

    initialize:function(models){

        this.collection = new App.Services.Member.collection(models);
    }
});

