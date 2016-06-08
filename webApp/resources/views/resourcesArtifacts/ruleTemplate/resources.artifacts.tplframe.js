/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsTplFrame = Backbone.View.extend({

    tagName:"div",

    className: "artifactsTplFrame",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleTemplate/resources.artifacts.tplframe.html"),

    render:function() {
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
    }
});