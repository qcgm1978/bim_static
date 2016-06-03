/**
 * @require /resources/collection/resources.nav.es6
 */
App.Resources.ArtifactsPlanRuleDetailOperator = Backbone.View.extend({

    tagName:"div",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.planruledetailoperator.html"),

    events:{},

    render:function() {
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
        this.listenTo(App.ResourceArtifacts.operator,"add",this.addOne);
    },

    addOne:function(model) {
        var newList = new App.Resources.ArtifactsPlanRuleDetailNew({model: model});
        this.$("dl").append(newList.render().el);
    }
});