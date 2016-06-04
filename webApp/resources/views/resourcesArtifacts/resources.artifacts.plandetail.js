/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanDetail = Backbone.View.extend({

    tagName:"li",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.plandetail.html"),

    events:{
        "click .item":"getPlanId"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        //����չ����ģ���Ƿ񱻸��ģ�������ģ��г��������ʾ����
        if(App.ResourceArtifacts.Status.presentPlan){
            this.listenTo(App.ResourceArtifacts.Status.presentPlan,"chang",this.getChangeAttr);    //previous    model.previous(attribute)
        }
    },

    //ȡ��ģ���޸Ĺ�������
    getChangeAttr:function(e){
        console.log(e);
    },

    //ȡ�ù����б�
    getPlanId:function(){
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
        $(".artifactsList li").removeClass("active");
        this.$el.addClass("active");
    },
//��ȡ�ƻ��ڵ���ع���
    getRules:function() {
        var _this = this;
        var code = this.model.get("code");
        if(!App.ResourceArtifacts.Status.saved){
            //��ʾ��û�б������ڵģ���Ҫ
            return
        }
        var pdata = {
            URLtype: "fetchArtifactsPlanRule",
            data:{
                code:code
            }
        };
        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 ){
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