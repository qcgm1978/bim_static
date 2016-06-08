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
        this.listenTo(this.model,"remove",this.render);
    },

    //ȡ��ģ��
    getTpl:function(){
        App.ResourceArtifacts.Status.templateId = this.model.get("id");//����id
        App.ResourceArtifacts.Status.templateName = this.model.get("name");//����name

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

        //�޸�����
        $(".tplDetailTitle h2").text(this.model.get("name"));
        $(".tplDetailTitle .tplName").val(this.model.get("name"));
    },

    //�л�
    toggleClass:function(){
        $(".tplCon li").removeClass("active");
        this.$el.addClass("active");
    }
});