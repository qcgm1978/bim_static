/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsTplList = Backbone.View.extend({

    tagName:"div",

    className: "artifactsList",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleTemplate/resources.artifacts.tpllist.html"),

    render:function() {
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
        this.listenTo(App.ResourceArtifacts.TplCollection,"add",this.addOne);
    },

    addOne:function(model) {
        var newList = new App.Resources.ArtifactsTplDetail({model: model});
        this.$("ul").append(newList.render().el);
        App.Comm.initScroll($(".list"),"y");
    }
});