/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsQualityDetail = Backbone.View.extend({

    tagName:"div",

    className : "title",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/mappingRule/resources.artifacts.qualitydetail.html"),

    events:{
        "click .item":"getDetail"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        Backbone.on("resetTitle",this.changeCount,this);
    },

    //ȡ��ģ���޸Ĺ�������
    getChangeAttr:function(e){
        console.log("ģ���ѱ�����");
    },


    changeCount:function(){
        var count = App.ResourceArtifacts.Status.rule.count;
        if(this.model.get("code") ==App.ResourceArtifacts.Status.rule.targetCode ){
            this.model.set({count:count},{silent:true});
            this.$(".count").text("("+ count + ")");
        }
    },

    //ȡ�ù����б�
    getDetail:function(e){

        this.$(".fold").addClass("active");
        var hasCon =  this.$(".item").closest(".title").siblings(".childList:hidden");
        if(hasCon.length && hasCon.html()){
            hasCon.show();//��ʾ�б�
            return
        }
        var innerCon =  this.$(".item").closest(".title").siblings(".childList:visible");
        if(innerCon.html()){
            innerCon.hide();//�����б�
            this.$(".fold").removeClass("active");
            return
        }

        var item = $(e.target);
        App.ResourceArtifacts.Status.rule.targetCode = this.model.get("code");
        App.ResourceArtifacts.Status.rule.targetName = this.model.get("name");
        App.ResourceArtifacts.Status.rule.count = this.model.get("count");

        if(!App.ResourceArtifacts.Status.saved){
            alert("������û�����");
            return
        }

        this.toggleClass(item);
        this. getRules();

    },
//�л��ƻ�
    toggleClass:function(item){
        $(".item").removeClass("active");
        item.closest(".item").addClass("active");
    },

    //��ȡ������׼��ع���
    getRules:function() {
        var _this = this,pdata;
        if(!App.ResourceArtifacts.Status.saved){
            return
        }
        if(!this.model.get("leaf")){
            //���ڣ����ض�����������׼
            pdata = {
                URLtype : 'fetchArtifactsQuality',
                data : {
                    type : App.ResourceArtifacts.Status.type,
                    standardType:"GC",
                    parentCode :this.model.get("code")  //���ݸ��ڵ�
                }
            };

            App.ResourceArtifacts.PlanRules.reset();

            App.Comm.ajax(pdata,function(response){
                if(response.code == 0 && response.data){
                    if(response.data.length){
                        var list = App.Resources.artifactsQualityTree(response.data);
                        _this.$el.closest("li").find(".childList").html(list);
                    }else{
                        //������զ��
                    }
                }
            });
            return
        }



        //ˢ��������ͼ
        var code = App.ResourceArtifacts.Status.rule.targetCode;
        pdata = {
            URLtype: "fetchArtifactsPlanRule",
            data:{
                code:code,
                type:App.ResourceArtifacts.Status.type,
                projectId:App.ResourceArtifacts.Status.projectId
            }
        };
        App.ResourceArtifacts.Status.rule.biz = pdata.data.biz = 2 ;
        App.ResourceArtifacts.loading();
        App.ResourceArtifacts.PlanRules.reset();
        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 ){
                if(response.data  &&  response.data.length){
                    App.ResourceArtifacts.PlanRules.add(response.data);
                }else{
                    App.ResourceArtifacts.Status.rule.count  = response.data.length = 0;
                    Backbone.trigger("mappingRuleNoContent")
                }
                Backbone.trigger("resetTitle");
            }
            App.ResourceArtifacts.loaded($(".rules"));
        });
    }
});