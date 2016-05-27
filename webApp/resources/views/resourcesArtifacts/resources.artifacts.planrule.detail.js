/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanRuleDetail = Backbone.View.extend({

    tagName:"li",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.planruledetail.html"),

    events:{
        "click .desc":"getDetail"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    initialize:function(){},

    getDetail:function(){
        var _this = this ;
        $(".ruleDetail").empty().hide();
       this.reset();
        //¥Ê¥¢model
        App.ResourceArtifacts.openRule = this.model;
        this.$(".ruleDetail").html( new App.Resources.ArtifactsPlanRuleDetailUnfold({model:App.ResourceArtifacts.openRule}).render().el);
        this.$(".ruleDetail").show();
    },

    reset:function(){//÷ÿ÷√ƒ£–Õ
        if(App.ResourceArtifacts.openRule){App.ResourceArtifacts.openRule=null;}
    }
});