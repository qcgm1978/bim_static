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

    },

    delete:function(){
        var _this = this;
        var frame = new App.Resources.ArtifactsPlanRuleAlert();
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

        //查找collection
        var checkCollection  = App.ResourceArtifacts.TplCollectionRule ; //已有
        var allCollection  = App.ResourceArtifacts.ArtifactsRule ;//所有
        var arr = [];

        _.each(checkCollection,function(item){
            arr.push(item.get("id"))
        });

        _.each(allCollection,function(item){
            for(var i = 0 ;i < arr.length ; i++){
                if(item.get("id") == arr[i]){
                    item.set("checked", true);
                }
            }
        });



    },

    //保存
    resourcesSure:function(){

        //查找所有的ruleId存储成数组形式，格式如下
        /*[{
            "templateId": "843148603580768",
            "ruleId": "840358391034212"
        },
            {
                "templateId": "843148603580768",
                "ruleId": "841085297156426"
            },
            {
                "templateId": "843148603580768",
                "ruleId": "841085297156448"
            }]
        */

        var pdata = {
            URLtype: "saveArtifactsTemplateRule",
            data:{
                templateId: App.ResourceArtifacts.Status.templateId
            }
        };
        //App.ResourceArtifacts.loading($(".modelContent"));
        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 ){
                if(response.data  &&  response.data.length){

                }else{

                }
            }
            App.ResourceArtifacts.loaded($(".modelContent"));
        });
    },
    //取消
    resourcesCancel:function(){
        this.$(".tplDetailInfo").show();
        this.$(".tplDetailEdit").hide();
    }
});