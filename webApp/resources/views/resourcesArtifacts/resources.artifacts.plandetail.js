/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanDetail = Backbone.View.extend({

    tagName:"li",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.plandetail.html"),

    events:{
        "click .planItem":"getPlanId"
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
        var  planId = this.model.get("planId");
        if(!planId){
            //�ж��Ƿ�Ϊ�½������½�������δ���
            return;
        }

        if(!App.ResourceArtifacts.Status.saved){

            //��ʾ����
         /*   $.tip({
                type:'success',
                message:'������û�����',
                timeout:2000
            });*/

            alert("������û�����");
            //���Ĳ����ж�
            //���Ĳ��ֱ��
            //��ʾ��û�б������ڵģ���Ҫ
            return
        }

        $(".artifactsContent .rules ul").empty();

        this.toggleClass();
        this. getRules(planId);

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
    getRules:function(planId) {

        if(!App.ResourceArtifacts.Status.saved){
            //��ʾ��û�б������ڵģ���Ҫ
            return
        }


        var _this = this ;
        var pdata = {
            URLtype: "fetchArtifactsPlanRule",
            data:{
                planId:planId
            }
        };
        App.Comm.ajax(pdata,function(response){
           if(response.code == 0 ){
               App.ResourceArtifacts.PlanRules.reset();
               if(response.data  &&  response.data.length){
                    $(".artifactsContent .rules h2 i").html( "("+response.data.length + ")");
                    $(".artifactsContent .rules h2 .name").html(_this.model.get("planId") + "&nbsp;" +_this.model.get("desc"));
                   App.ResourceArtifacts.PlanRules.add(response.data);
               }
           }
        });
    }
});