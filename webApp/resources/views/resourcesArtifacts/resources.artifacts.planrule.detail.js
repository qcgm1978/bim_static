/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanDetail = Backbone.View.extend({

    tagName:"li",
    className : "planItem",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.planruledetail.html"),

    events:{
        "click .getDetailt":"getDetailt"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    initialize:function(){}
});