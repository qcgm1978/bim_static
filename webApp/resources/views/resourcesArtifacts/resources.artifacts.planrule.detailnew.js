/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanRuleDetailNew = Backbone.View.extend({

    tagName:"dd",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.planruledetailnew.html"),

    events:{

    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    initialize:function(){},



    reset:function(){//÷ÿ÷√ƒ£–Õ

    }
});