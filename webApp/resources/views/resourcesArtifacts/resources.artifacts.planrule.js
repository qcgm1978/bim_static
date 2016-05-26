/**
 * @require /resources/collection/resource.nav.es6
 */
App.ResourcesNav.ArtifactsPlanRule = Backbone.View.extend({

    tagName:"div",

    className: "rules",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.planrule.html"),

    render:function() {
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
        this.listenTo(App.ResourceArtifacts.PlanRules,"add",this.addOne);
    },

    addOne:function(model) {
        var newList = new App.Resources.ArtifactsPlanDetail({model: model});
        this.$("ul").append(newList.render().el);
    }
});