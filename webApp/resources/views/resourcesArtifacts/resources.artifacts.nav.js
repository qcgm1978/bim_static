/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsMapRule = Backbone.View.extend({

    tagName:"div",

    id: "artifacts",

    events:{
        "click .sele": "select",
        "click .newPlanRule":"newPlanRule"
    },

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.nav.html"),

    render:function() {
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
        this.getCategoryCode(); //��ȡ�������
    },

    select:function(e){
        var pre = $(e.target),_this =this;
        if(pre.hasClass("active")){
            return
        }

        //�������ݣ�����ÿ�����»�ȡӳ�����
        //��Ҫ��յ�ǰ�б�
        this.$(".ruleContent ul").html("<li><div class='ruleTitle delt'>û��ѡ��ģ��/������׼</div></li>");


        if(pre.hasClass("modularization")){//ģ�黯

            App.ResourceArtifacts.Status.rule.biz = 2 ;

            this.$(".qualifyC").empty().hide();
            var plans = new App.Resources.ArtifactsPlanList();
            $(".breadcrumbNav .mappingRule").show();
            this.$(".plans").html(plans.render().el);//�ƻ��ڵ�
            App.ResourceArtifacts.getPlan();
            this.$(".plans").show();

        }else if(pre.hasClass("quality")){//����

            App.ResourceArtifacts.Status.rule.biz = 1 ;

            this.$(".plans").empty().hide();

            var quality = new App.Resources.ArtifactsQualityList().render().el;
            this.$(".qualifyC").html(quality);

            var pdata = {
                URLtype:'fetchQualityPlanQualityLevel1',
                data:{
                    type:App.ResourceArtifacts.Status.type,
                    standardType: "GC"
                }
            };
            App.ResourceArtifacts.getQuality(pdata,_this);
            this.$(".qualifyC").show();
        }
        pre.addClass("active").siblings("li").removeClass("active");
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

        var container = new App.Resources.ArtifactsPlanRuleDetail({model:model}).render();

        //���ص��¹���
        var operatorData = App.Resources.dealStr(model);//��������
        container.$(".mapRule dl").html("");
        _.each(operatorData,function(item){
            var model = new App.ResourceArtifacts.operator(item);
            var view = new App.Resources.ArtifactsPlanRuleDetailNew({model:model}).render().el;
            container.$(".mapRule dl").append(view);
        });


        $(".artifactsContent .rules ul li:last-child").html(container.el).show();
        $(".artifactsContent .rules ul li:last-child .ruleDetail").show();

        App.ResourceArtifacts.Status.saved = false;
    }
});