/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsQualityDetail = Backbone.View.extend({

    tagName:"div",

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
    getDetail:function(e){
        var item = $(e.target);
        var  code = this.model.get("code");
        if(!code){
            //�ж��Ƿ�Ϊ�½������½�������δ���
            return;
        }
        if(!App.ResourceArtifacts.Status.saved){
            alert("������û�����");
            return
        }
        this.toggleClass(item);
        this. getRules();
        //����ƻ�����
        App.ResourceArtifacts.Status.presentPlan = null;
        App.ResourceArtifacts.Status.presentPlan = this.model;
    },
//�л��ƻ�
    toggleClass:function(item){
        $(".qualityMenu li").removeClass("active");
        item.closest("li").addClass("active");
    },

    //��ȡ������׼��ع���
    getRules:function() {
        var _this = this,pdata;
        if(!App.ResourceArtifacts.Status.saved){
            //��ʾ��û�б������ڵģ���Ҫ
            return
        }
        if(this.model.get("leaf")){


            //���ڣ����ض�����������׼
            pdata = {
                URLtype : 'fetchQualityPlanQualityLevel2',
                data : {
                    type : App.ResourceArtifacts.Status.type,
                    standardType:"GC",
                    parentCode :this.model.get("code")
                }
            };
            App.Comm.ajax(pdata,function(response){
                if(response.code == 0 && response.data.length){
                    var list = App.Resources.artifactsQualityTree(response.data);
                    _this.$el.closest("li").find(".childList").html(list);
                }
            });
            return
        }

        this.

        $(".artifactsContent .rules ul").empty();
        //ˢ��������ͼ
        var code = this.model.get("code");
        pdata = {
            URLtype: "fetchArtifactsPlanRule",
            data:{
                code:code,
                biz:App.ResourceArtifacts.Status.rule.biz,
                type:App.ResourceArtifacts.Status.type
            }
        };
        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 && response.data.length){
                App.ResourceArtifacts.PlanRules.reset();
                //�޸��Ҳ�����
                $(".artifactsContent .rules h2 .name").html(_this.model.get("code") + "&nbsp;" +_this.model.get("name"));
                $(".artifactsContent .rules h2 i").html( "("+response.data.length + ")");
                $(".artifactsContent .rules ul").empty();
                App.ResourceArtifacts.PlanRules.add(response.data);
            }
        });
    }
});