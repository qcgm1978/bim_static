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

    initialize:function(){},

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

    //当模板为空时触发
    reset:function(){
        this.$(".tplDetailInfo h2").empty();
    },

    //保存，要重写
    resourcesSure:function(){
        var _this = this;
        //如果不存在模板id则无法保存
        if(!App.ResourceArtifacts.Status.templateId){
            return
        }
        App.ResourceArtifacts.modelRuleSaveData.templateId = App.ResourceArtifacts.Status.templateId;
        App.ResourceArtifacts.modelRuleSaveData.templateName = App.ResourceArtifacts.Status.templateName = this.$(".tplDetailEdit .tplName").val();

        //模块化
        var plan = _.filter($(".artifactsContent .plans li"),function(item){
            return $(item).attr("data-check") == "1";
        });

        //
        for(var i = 0  ; i < plan.length ; i++){
            App.ResourceArtifacts.modelRuleSaveData.codeIdsIn.push($(plan[i]).attr("data-code"));
        }
        //质量标准
        var qualifyC = _.filter($(".qualifyC .qualityMenuList ul li"),function(item){
            return $(item).attr("data-check") == "1" && $(item).attr("data-leaf") == "1";
        });
        _.each(qualifyC,function(item){
            App.ResourceArtifacts.modelRuleSaveData.codeIdsIn.push($(item).attr("data-code"));
        });
        //要查找两级看是否是叶子节点
   /*     var allQuality = App.ResourceArtifacts.allQuality;
        var father  = _.filter(plan,function(item){

        });

        var grandFather  = _.filter(plan,function(item){

        });*/

        console.log(App.ResourceArtifacts.modelRuleSaveData);

        var pdata = {
            URLtype: "saveArtifactsTemplateRule",
            type:"PUT",
            data:JSON.stringify(App.ResourceArtifacts.modelRuleSaveData),
            contentType: "application/json"
        };

        App.ResourceArtifacts.loading($(".modelContent"));
        App.Comm.ajax(pdata,function(response){
            console.log(response);
            if(response.code == 0 ){


                //更改模板名称
                _this.$(".tplDetailTitle h2").text(App.ResourceArtifacts.Status.templateName);

                Backbone.trigger("resourcesChangeMappingRuleModelName");
                _this.resourcesCancel();
            }else{
            //提交失败
            alert("提交失败");
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