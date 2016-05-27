/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanRuleDetailNew = Backbone.View.extend({

    tagName:"dd",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.planruledetailnew.html"),

    events:{
        "click .delRule": "delRule"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        this.listenTo(this.model,"change",this.render);
    },

    //删除
    delRule:function(){
        this.$el.remove();//删除元素
        this.model.clear();//销毁数据
    }
});