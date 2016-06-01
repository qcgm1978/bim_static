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
        this.getCategoryCode();
        //��ȡ�������

    },

    addOne:function(model) {
        var newList = new App.Resources.ArtifactsPlanRuleDetail({model: model});
        this.$("ul").append(newList.render().el);
    },


    getCategoryCode:function(){
        var cdata  = {
            URLtype:'fetchArtifactsCategoryRule',
            data :{
            }
        };
        App.Comm.ajax(cdata,function(response){
            if(response.code == 0 && response.data.length){
                App.Resources.artifactsTreeData = response.data;
            }
        });
    },

    //��������
    newPlanRule:function(){
        var _this = this;

        if(!App.ResourceArtifacts.Status.presentPlan){return;}//û��ѡ��ƻ��޷���������

        if( !App.ResourceArtifacts.Status.saved){
            alert("������û�����");
            //����δ�����Ԫ�ز�������ʾ���
            return
        }
        //�����ݻ��޸��ģ����ĵ�ǰ����
        $(".ruleDetail").empty().hide();
        //��������
        var model =  App.ResourceArtifacts.createPlanRules("1",App.ResourceArtifacts.Status.presentPlan.get("targetCode"),"�½�ӳ�����","1");

        App.ResourceArtifacts.PlanRules.push(model);

        if(!App.ResourceArtifacts.Status.presentPlan){
            //û��ѡ���κμƻ�
            App.ResourceArtifacts.Status.presentPlan = model;
        }
        $(".artifactsContent .rules ul li:last-child .ruleDetail").html( new App.Resources.ArtifactsPlanRuleDetailUnfold({model:model}).render().el).show();
        //����״̬
        //App.ResourceArtifacts.Status.saved = false;
    }

});