/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsTplDetail = Backbone.View.extend({

    tagName:"li",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleTemplate/resources.artifacts.tpldetail.html"),

    events:{
        "click .item":"getTpl"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        this.listenTo(this.model,"change",this.render);
    },

    //ȡ��ģ��
    getTpl:function(){
        App.ResourceArtifacts.Status.templateId = this.model.get("id");//����id

        //����״̬
        if(!App.ResourceArtifacts.Status.saved){
            alert("������û�����");
            return
        }
        this.toggleClass();

        //�����Ҳ��б�
        //this. getRules();

    },

    //�л�
    toggleClass:function(){
        $(".tplCon li").removeClass("active");
        this.$el.addClass("active");
    },


//��ȡģ��
    getRules:function() {
        var _this = this;
        var pdata = {
            URLtype: "fetchArtifactsPlanRule",
            data:{
                code:App.ResourceArtifacts.Status.rule.targetCode,
                biz :App.ResourceArtifacts.Status.rule.biz,
                type:App.ResourceArtifacts.Status.type,
                projectId:App.ResourceArtifacts.Status.projectId
            }
        };
        App.ResourceArtifacts.loading();
        App.Comm.ajax(pdata,function(response){

            console.log(response);
            if(response.code == 0 ){

                $(".artifactsContent .rules h2 .name").html(_this.model.get("code") + "&nbsp;" +_this.model.get("name"));
                $(".artifactsContent .rules h2 i").html( "("+response.data.length + ")");

                if(response.data  &&  response.data.length){
                    App.ResourceArtifacts.PlanRules.reset();
                    $(".artifactsContent .rules ul").empty();
                    App.ResourceArtifacts.PlanRules.add(response.data);
                }else{
                    $(".ruleContent ul").html("<li><div class='ruleTitle delt'>��������</div></li>");
                }
            }
            App.ResourceArtifacts.loaded($(".rules"));
        });
    }
});