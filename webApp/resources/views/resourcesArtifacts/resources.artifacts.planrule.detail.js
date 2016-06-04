/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanRuleDetail = Backbone.View.extend({

    tagName:"li",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.planruledetail.html"),

    events:{
        "click .desc":"getDetail"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    initialize:function(){},

    getDetail:function(){
        if(App.ResourceArtifacts.Status.presentPlan){//������
            if( !App.ResourceArtifacts.Status.saved){
                if(App.ResourceArtifacts.openRule == this.model){  //��ǰ
                    this.tabRule();
                    return ;
                }else{
                    alert("������û�����");
                    //����δ�����Ԫ�ز�������ʾ���
                    return;
                }
            }else if(App.ResourceArtifacts.Status.presentRule == this.model){
                this.tabRule();
                return ;
            }
        }
        //�����ݻ��޸��ģ����ĵ�ǰ����
        $(".ruleDetail").empty().hide();
        this.reset();
        //�洢model
        App.ResourceArtifacts.Status.presentRule = this.model;
        var rule = new App.Resources.ArtifactsPlanRuleDetailUnfold({model:App.ResourceArtifacts.Status.presentRule});
        var operator = new App.Resources.ArtifactsPlanRuleDetailOperator().render().el;
        this.$(".ruleDetail").html(rule.render().el);
        rule.$(".mapRule").html(operator);//�����б�
        var operatorData = App.Resources.dealStr(App.ResourceArtifacts.Status.presentRule);//��������

        App.ResourceArtifacts.operator.reset();
        App.ResourceArtifacts.operator.add(operatorData);
        this.$(".ruleDetail").show();
    },
    //����״̬
    tabRule:function(){
        if(this.$(".ruleDetail:hidden").length){    //δ��ʾ
            this.$(".ruleDetail").show();
        }else{
            this.$(".ruleDetail").hide();
        }
    },

    reset:function(){//����ģ��
        if(App.ResourceArtifacts.Status.presentRule){App.ResourceArtifacts.Status.presentRule=null;}
    }
});