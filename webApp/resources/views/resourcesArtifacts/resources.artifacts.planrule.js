/**
 * @require /resources/collection/resources.nav.es6
 */
App.Resources.ArtifactsPlanRule = Backbone.View.extend({

    tagName:"div",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.planrule.html"),

    events:{
        "click .newPlanRule":"newPlanRule"
    },

    render:function() {
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
        this.listenTo(App.ResourceArtifacts.PlanRules,"add",this.addOne);
        this.listenTo(App.ResourceArtifacts.PlanRules,"change",this.render);
        this.listenTo(App.ResourceArtifacts.PlanRules,"remove",this.render);
        //��ȡ�������

        var cdata = {
            URLtype:"fetchArtifactsCategoryRule",
            data:{}
        };
        App.Comm.ajax(cdata,function(response){
            if(response.code == 0 && response.data && response.data.length){
                App.Resources.artifactsTreeData = response.data;
            }
        });
    },


    addOne:function(model) {
        var newList = new App.Resources.ArtifactsPlanRuleDetail({model: model});
        this.$("ul").append(newList.render().el);
    },




    //��������
    newPlanRule:function(){
        var _this = this;
        var targetCode = App.ResourceArtifacts.Status.rule.targetCode;
        if(!targetCode){
            alert("����û��ѡ��ģ��/������׼");
            return;
        }//û��ѡ��ƻ��޷���������

        if( !App.ResourceArtifacts.Status.saved){
            alert("������û�����");
            //����δ�����Ԫ�ز�������ʾ���
            return
        }

        if(!$(".ruleDetail").length){
            $(".artifactsContent .rules ul").html("");
        }
        //�����ݻ��޸��ģ����ĵ�ǰ����
        $(".ruleDetail:visible").hide();
        //��������

        var model =  App.ResourceArtifacts.createPlanRules();
        App.ResourceArtifacts.PlanRules.push(model);

        var container = new App.Resources.ArtifactsPlanRuleDetailUnfold({model:model});
        $(".artifactsContent .rules ul li:last-child .ruleDetail").html(container.render().el).show();

        //���ص��¹���
        var newRuleView = new App.Resources.ArtifactsPlanRuleDetailOperator();
        container.$(".mapRule").html(newRuleView.render().el);

        var list = App.Resources.dealStr(model);
        App.ResourceArtifacts.operator.add(list);
    }
});