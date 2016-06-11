/**
 * @require /resources/collection/resources.nav.es6
 */
App.Resources.ArtifactsPlanRule = Backbone.View.extend({

    tagName:"div",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleModel/resources.artifacts.planrule.html"),

    events:{
        "click .newPlanRule":"newPlanRule"
    },

    render:function() {
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
        this.listenTo(App.ResourceArtifacts.PlanRules,"add",this.addOne);
        this.listenTo(App.ResourceArtifacts.PlanRules,"remove",this.render);
    },

    addOne:function(model) {
        var newList = new App.Resources.ArtifactsPlanRuleDetail({model: model});
        this.$el.append(newList.render().el);   /*Ϊʲô����this.$(".ruleContentRuleList ul")�ͻ������������*/
    },
    //��������
    newPlanRule:function(){
        var _this = this;
        var targetCode = App.ResourceArtifacts.Status.rule.targetCode;



        if(!targetCode){
            alert("��ѡ��ģ��/������׼");
            return;
        }//û��ѡ��ƻ��޷���������
        if( !App.ResourceArtifacts.Status.saved){
            alert("������û�����");
            //����δ�����Ԫ�ز�������ʾ���
            return
        }

        //����ɾ��״̬
        App.ResourceArtifacts.Status.delRule ="";


        if(!$(".ruleDetail").length){
            $(".artifactsContent .rules ul").html("");
        }
        //�����ݻ��޸��ģ����ĵ�ǰ����
        $(".ruleDetail:visible").hide();


        //��������
        var model =  App.ResourceArtifacts.createPlanRules();
        //���ص��¹���
        var operatorData = App.Resources.dealStr2(model);//��������
        model.set({mappingCategory:operatorData},{silent:true});
        var container = new App.Resources.ArtifactsPlanRuleDetail({model:model});

        $(".rules>div").append(container.render().el).show();
        $(".rules>div>li:last-child .ruleDetail").show();
        App.ResourceArtifacts.Status.saved = false;
    }

});