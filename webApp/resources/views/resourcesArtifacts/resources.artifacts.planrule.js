/**
 * @require /resources/collection/resource.nav.es6
 */
App.ResourcesNav.ArtifactsPlanRule = Backbone.View.extend({

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
    },

    addOne:function(model) {
        var newList = new App.Resources.ArtifactsPlanRuleDetail({model: model});
        this.$("ul").append(newList.render().el);
    },
    //��������
    newPlanRule:function(){
        var _this = this;
        if(!App.ResourceArtifacts.Status.saved){
            //��ʾ��û�б������ڵģ���Ҫ
            return
        }
        if(!App.ResourceArtifacts.Status.presentPlan){
            //û��ѡ���κμƻ�
            return
        }

        var model =  App.ResourceArtifacts.createPlanRules("1",App.ResourceArtifacts.Status.presentPlan.get("targetCode"),"�½�ӳ�����","1");
        App.ResourceArtifacts.PlanRules.push(model);
        

        //���β���һ���µĹ���
        //App.ResourceArtifacts.SavePlanRules  ���model  ������jsonģ��
        //�����ڵ�collection    App.ResourceArtifacts.PlanRules  ĩβ���model
    }

});