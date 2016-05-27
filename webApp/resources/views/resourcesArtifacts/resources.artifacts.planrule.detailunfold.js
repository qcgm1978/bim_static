/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanRuleDetailUnfold = Backbone.View.extend({

    tagName:"div",
    className:"ruleDetail",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.planruledetailunfold.html"),

    events:{
        "click .tabRule":"tabRule",
        "click .addNewRule":"addNewRule",
        "click .deleteRule":"deleteRule",
        "click .save":"save",
        "click .choose":"choose"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    initialize:function(){
        this.listenTo(this.model,"change",this.render);
    },
    //ѡ��������
    choose:function(){

    },
    //�л�����
    tabRule:function(){

    },
    //�����¹���
    addNewRule:function(){

    },
    //����
    save:function(){

    },
    //ɾ���ƻ��еĹ���
    deletePlanRule:function(){

    },
    //ɾ������
    deleteRule:function(){

    },
    //����ģ��
    legend:function(){

    },
    //У��ģ��
    check:function(){

    },
    //��ʾ��
    window:function(){

    },
    //ѡ��������
    chooseWindow:function(){

    }
});