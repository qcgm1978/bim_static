/*
 * @require  /services/collections/auth/member/role.list.js
 */
App.Services.roleWindowFunDetail=Backbone.View.extend({

    tagName:'li',

    template:_.templateUrl("/services/tpls/auth/windows/services.role.window.detail.html"),
    events:{
        "click .funName":"choose"
    },

    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        this.listenTo(this.model,"change:checked",this.checked);
    },
    checked:function(){
        if(this.model.get("checked")){
            this.$el.addClass("active");
        }
    },


    choose:function() {
        var preV = this.model.get("checked");
        if (!preV) {
            this.$el.addClass("active");
            this.$(".memCheck").addClass("checked");
        } else {
            this.$el.removeClass("active");
            this.$(".memCheck").removeClass("checked");
        }
        this.model.set("checked",!preV);
    }
});




