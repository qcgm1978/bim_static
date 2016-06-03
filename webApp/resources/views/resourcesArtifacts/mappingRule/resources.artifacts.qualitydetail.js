/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsQualityDetail = Backbone.View.extend({

    tagName:"li",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/mappingRule/resources.artifacts.qualitydetail.html"),

    events:{
        "click .item":"getDetail"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        //this.listenTo(App.ResourceArtifacts.Status.presentPlan,"chang",this.getChangeAttr);    //����չ����ģ���Ƿ񱻸��ģ�������ģ��г��������ʾ����
    },

    //ȡ��ģ���޸Ĺ�������
    getChangeAttr:function(e){
        console.log("ģ���ѱ�����");
    },

    //ȡ�ù����б�
    getDetail:function(){
        var  code = this.model.get("code");
        if(!code){
            //�ж��Ƿ�Ϊ�½������½�������δ���
            return;
        }
        if(!App.ResourceArtifacts.Status.saved){
            alert("������û�����");
            return
        }
        $(".artifactsContent .rules ul").empty();

        this.toggleClass();
        this. getRules();
        //����ƻ�����
        App.ResourceArtifacts.Status.presentPlan = null;
        App.ResourceArtifacts.Status.presentPlan = this.model;
    },
//�л��ƻ�
    toggleClass:function(){
        $(".qualityMenu li").removeClass("active");
        this.$el.addClass("active");
    },

    //��ȡ������׼��ع�������Ƕ���������������׼
    getRules:function() {
        var _this = this;
        if(this.model.get("leaf")){

            //���ڣ�����������׼
            //����tree

            return
        }


        $(".artifactsContent .rules ul").html( new App.Resources.ArtifactsPlanRule().render.el);


        var code = this.model.get("code");
        if(!App.ResourceArtifacts.Status.saved){
            //��ʾ��û�б������ڵģ���Ҫ
            return
        }
        var pdata = {
            URLtype: "fetchQualityPlanQualityLevel3",
            data:{
                code:code,
                biz:2
            }
        };

        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 && response.data.length){
                App.ResourceArtifacts.PlanRules.reset();
                if(response.data  &&  response.data.length){
                    $(".artifactsContent .rules h2 i").html( "("+response.data.length + ")");
                    $(".artifactsContent .rules h2 .name").html(_this.model.get("code") + "&nbsp;" +_this.model.get("name"));
                    App.ResourceArtifacts.PlanRules.add(response.data);
                }
            }
        });
    }
});