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

    //ɾ��
    delRule:function(){
        this.$el.remove();//ɾ��Ԫ��
        this.model.clear();//��������
    }
});