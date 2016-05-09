/*
 * @require  /services/views/auth/member/services.member.list.js
 * */
App.Services.MemberRoleDetail=Backbone.View.extend({

    tagName :'div',
    className:"roles",

    template:_.templateUrl("/services/tpls/auth/member/services.member.roledetail.html"),
    events:{},

    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    initialize:function(){
        this.listenTo(this.model,"change",this.render)
    }
});