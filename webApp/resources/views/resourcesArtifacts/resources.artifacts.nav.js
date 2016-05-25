/**
 * @require /resources/collection/resource.nav.es6
 */
App.ResourcesNav.ArtifactsMapRule = Backbone.View.extend({

    tagName:"div",

    id: "artifacts",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.nav.html"),

    render:function() {
        this.$el.html(this.template);
        return this;
    },
    initialize:function(){
        //this.listenTo(collection,"add",this.addOne);
    },

    addOne:function(item){
        var newList = new App.Resources.ArtifactsPlanDetail({model : item});
        this.$(".artifactsContent ul").append(newList);
    }
});