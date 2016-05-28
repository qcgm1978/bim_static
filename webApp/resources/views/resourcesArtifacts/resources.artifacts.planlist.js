/**
 * @require /resources/collection/resource.nav.es6
 */
App.ResourcesNav.ArtifactsPlanList = Backbone.View.extend({

    tagName:"div",

    className: "artifactsList",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.planlist.html"),

    render:function() {
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
        this.listenTo(App.ResourceArtifacts.PlanNode,"add",this.addOne);
    },

    addOne:function(model) {
        var newList = new App.Resources.ArtifactsPlanDetail({model: model});
        this.$("ul").append(newList.render().el);
    }
});