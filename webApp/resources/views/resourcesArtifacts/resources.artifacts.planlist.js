/**
 * @require /resources/collection/resource.nav.es6
 */
App.ResourcesNav.ArtifactsPlanList = Backbone.View.extend({

    tagName:"div",

    id: "artifactsList",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.planlist.html"),

    render:function() {
        var _this = this;
        this.collection.each(function(item){
            _this.addOne(item);
        });
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
        this.collection = App.ResourceArtifacts.PlanNode;
        this.listenTo(App.ResourceArtifacts.PlanNode,"change",this.render);
    },

    addOne:function(item){
        var newList = new App.Resources.ArtifactsPlanDetail({model : item});
        this.$("#planList").append(newList.render().el);
    },

    asd:function(){

    }
});