/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsTplListItem = Backbone.View.extend({

    tagName:"li",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleTemplate/resources.artifacts.tpllistitem.html"),

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
        App.ResourceArtifacts.Status.templateName = this.model.get("name");//����id

        //����״̬
        if(!App.ResourceArtifacts.Status.saved){
            alert("������û�����");
            return
        }
        this.toggleClass();



        //�����Ҳ��б�
        var detail = new App.Resources.ArtifactsTplDetail();
        var pre = new App.Resources.ArtifactsMapRule();  //���˵�
        var plans = new App.Resources.ArtifactsPlanList();   //ģ�黯�б� /�ƻ��ڵ�
        var planRule = new App.Resources.ArtifactsPlanRule();  //Ĭ�Ϲ���
        $(".tplContent").html(detail.render().el);
        detail.$(".tplDetailCon").append(pre.render().el);//�˵�
        pre.$(".plans").html(plans.render().el);//�ƻ��ڵ�
        pre.$(".rules .ruleContent").html(planRule.render().el);//ӳ�����
        $("#artifacts").addClass("tpl");

        //this. tplDetail();

    },

    //�л�
    toggleClass:function(){
        $(".tplCon li").removeClass("active");
        this.$el.addClass("active");
    },


//��ȡģ��
    tplDetail:function() {
        var _this = this;
        var pdata = {
            URLtype: "fetchArtifactsTemplateRule",
            data:{
                templateId: this.model.get("id")
            }
        };
        //App.ResourceArtifacts.loading($(".modelContent"));
        App.Comm.ajax(pdata,function(response){

            if(response.code == 0 ){

                if(response.data  &&  response.data.length){
                    App.ResourceArtifacts.PlanRules.reset();
                    $(".artifactsContent .rules ul").empty();
                    App.ResourceArtifacts.PlanRules.add(response.data);
                }else{
                    $(".ruleContent ul").html("<li><div class='ruleTitle delt'>��������</div></li>");
                }
            }
            App.ResourceArtifacts.loaded($(".modelContent"));
        });
    }
});