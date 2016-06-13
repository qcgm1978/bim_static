/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsTplDetail = Backbone.View.extend({

    tagName:"div",
    className:"cont",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleTemplate/resources.artifacts.tpldetail.html"),

    events:{
        "click .delete":"delete",
        "click .edit":"edit",
        "click #resourcesSure":"resourcesSure",
        "click #resourcesCancel":"resourcesCancel"
    },

    render:function() {
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
        //this.listenTo(App.ResourceArtifacts.TplCollectionRule,"reset",this.render);
    },

    delete:function(){
        var _this = this;
        var frame = new App.Resources.ArtifactsTplAlert();
        App.Resources.ArtifactsAlertWindow = new App.Comm.modules.Dialog({
            title: "",
            width: 280,
            height: 180,
            isConfirm: false,
            isAlert: false,
            message: frame.render().el
        });
        $(".mod-dialog .wrapper .header").hide();//隐藏头部
        frame.$(".alertInfo").html('确认删除 “'+ App.ResourceArtifacts.Status.templateName   +' "?');
    },

//编辑
    edit:function() {
        this.$(".tplDetailInfo").hide();
        this.$(".tplDetailEdit").show();
        Backbone.trigger("checkedChange");
    },

    //保存
    resourcesSure:function(){
        var baseData = {};
        //查找所有的ruleId存储成数组形式，格式如下
        /*
         {
         templateId:841085297156448,
         templateName:"全标项目模板",
         ruleIds:[841085297156448,841085297156448,841085297156448]
         }
        */

        var pdata = {
            URLtype: "saveArtifactsTemplateRule",
            type:"POST",
            data:JSON.stringify(baseData),
            contentType: "application/json"
        };
        //App.ResourceArtifacts.loading($(".modelContent"));
        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 ){
                if(response.data  &&  response.data.length){
                    //提交成功
                }else{
                    //提交失败
                }
            }
            App.ResourceArtifacts.loaded($(".modelContent"));
        });
    },
    //取消
    resourcesCancel:function(){
        this.$(".tplDetailInfo").show();
        this.$(".tplDetailEdit").hide();
        Backbone.trigger("projectMappingRuleCheckedClose");
    }
});