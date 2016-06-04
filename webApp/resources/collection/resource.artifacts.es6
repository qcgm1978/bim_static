//fetchArtifactsPlan   获取计划
//fetchArtifactsPlanRule   获取规则
App.ResourceArtifacts={
    Status:{
        presentPlan:null,  //当前计划或质量，提交数据
        saved : true,    //创建规则后的保存状态，已保存  /  未保存
        presentRule : null,    //当前规则
        qualityProcessType:1,   //质量标准 -过程选择  type
        qualityStandardType:"GC"   //质量标准 -过程选择  type
    },

    Settings: {
        delayCount:  0 , //每层加载数量
        ruleModel: 3   //  权限入口      1 只有模块化，  2 只有质量标准  ， 3 有模块化和质量标准
    },

    openRule: null, //正在打开的规则，注意重置

//计划节点
    PlanNode : new(Backbone.Collection.extend({
        model:Backbone.Model.extend({
            defaults:function(){
                return{

                }
            }
        }),
        urlType: "fetchArtifactsPlan",
        parse: function(responese) {
            if (responese.code == 0 && responese.data.length > 0) {
                return responese.data;
            } else {
                $().html('<li>无数据</li>');
            }
        }
    })),
    //质量标准，获取二级列表
    QualityStandard : new(Backbone.Collection.extend({
        model:Backbone.Model.extend({
            defaults:function(){
                return{

                }
            }
        }),
        urlType: "fetchQualityPlanQualityLevel2",
        parse: function(responese) {
            if (responese.code == 0 && responese.data.length > 0) {
                return responese.data;
            } else {
                $().html('<li>无数据</li>');
            }
        }
    })),



    //计划规则/获取
    operator:new(Backbone.Collection.extend({
        model:Backbone.Model.extend({
            defaults:function(){
                return{

                }
            }
        })
    })),



//计划规则/获取
    PlanRules:new(Backbone.Collection.extend({
        model:Backbone.Model.extend({
            defaults:function(){
                return{

                }
            }
        }),
        urlType: "fetchArtifactsPlanRule",
        parse: function(responese) {

            if (responese.code == 0 && responese.data.length > 0) {
                return responese.data;
            } else {
                $().html('<li>无数据</li>');
            }
        }
    })),

    //创建计划规则
    newPlanRules : Backbone.Model.extend({
        defaults:function(){
            return{
                code : ""
            }
        },
        urlType: "fetchArtifactsPlanNewRule",
        parse: function(responese) {
            if (responese.code == 0 && responese.data.length > 0) {
                return responese.data;
                //保存成功
            }
        }
    }),

    //创建计划规则
    createPlanRules:function(biz,targetCode,targetName,type){
        //创建新的构件映射计划节点
        var newPlanRuleData ={
            "biz": 1,//1：模块化；2：质监标准  //新建时写入值
            "targetCode": "",//新建时写入当前计划编号
            "targetName": "",//计划名称
            "type": 1,//1:标准规则；2：项目规则  //新建时写入值
            "mappingCategory": {
                "categoryCode": "",
                "categoryName": "",
                "mappingPropertyList": [
                    {
                        "propertyKey": "",
                        "operator": "",
                        "propertyValue": ""
                    }
                ]
            }
        };
        //写入基础数据
        newPlanRuleData.biz =  biz;
        newPlanRuleData.targetCode =  targetCode;
        newPlanRuleData.targetName =  targetName || "新建映射规则";
        newPlanRuleData.type =  type;

        return new this.newPlanRules(newPlanRuleData);
    },

//保存计划规则
    SavePlanRules : Backbone.Model.extend({
            defaults:function(){
                return{
                    code : ""
                }
            },
        urlType: "",
        parse: function(responese) {
            if (responese.code == 0 && responese.data.length > 0) {
                return responese.data;
                //保存成功
            }
        }
    }),

    //新映射数据模型
    newModel : {
        "id": null,
        "propertyKey":"",
        "operator":"",
        "propertyValue": null,
        categoryId:'',
        ruleList:{
            left:'',
            right:'',
            leftValue:'',
            rightValue:''
        }
    },

    //新建规则
    newRule : Backbone.Model.extend({
        defaults:function(){
            return{
                code : ""
            }
        }
    }),
    //新建规则
    newCode : Backbone.Model.extend({
        defaults:function(){
            return{
                code : ""
            }
        }
    }),

    ArtifactsRule:new(Backbone.Collection.extend({
        model:Backbone.Model.extend({
            defaults:function(){
                return{

                }
            }
        }),
        urlType: "",
        parse: function(responese) {

            if (responese.code == 0 && responese.data.length > 0) {
                return responese.data;
            } else {
                //$().html('<li>无数据</li>');
            }
        }
    })),

    init:function(_this) {


        var pre = new App.Resources.ArtifactsMapRule();
        var plans = new App.Resources.ArtifactsPlanList();
        var planRule = new App.Resources.ArtifactsPlanRule();

        $(".breadcrumbNav .mappingRule").show();

        _this.$el.append(pre.render().el);//菜单

        pre.$(".plans").html(plans.render().el);//计划节点
        pre.$(".rules").append(planRule.render().el);//菜单

        //插入默认为空的规则列表
        this.getPlan();

        $("#pageLoading").hide();
    },


    //缺省加载
    defaultLoad:function(_this){
        var pre = new App.Resources.ArtifactsMapRule();
        _this.$el.append(pre.render().el);//菜单
        var plans = new App.Resources.ArtifactsPlanList();
        var planRule = new App.Resources.ArtifactsPlanRule();
        pre.$(".plans").html(plans.render().el);//计划节点
        pre.$(".rules").html(planRule.render().el);//菜单
    },


    getPlan:function(){
        var _this = this, pdata;

        pdata  = {
            URLtype:"fetchArtifactsPlan",
            data:{}
        };

        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 && response.data.length){
                App.ResourceArtifacts.PlanNode.add(response.data);
                //_this.delay(response);
            }
        });
    },

    getQuality:function(){
        var pdata;
        pdata  = {
            URLtype:"fetchQualityPlanQualityLevel2",
            data:{}
        };
        App.ResourceArtifacts.QualityStandard.reset();

        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 && response.data.length){
                App.ResourceArtifacts.QualityStandard.add(response.data);
                //_this.delay(response);
            }
        });
    },

    //延迟
    delay:function(data){
    var _this = this , batch , length = data.length , arr = []  , n = 1 , last;

        batch = Math.ceil(length/20); //循环次数
        last = length % 20; //余数
        if(batch > 0){
            App.ResourceArtifacts.delays = setTimeout(function(){
               // var as = ;
                App.ResourceArtifacts.PlanNode.add();

                _this.delay();

                n++;
            },100);
        }
    },
    //提示保存
    alertSave:function(){

    }
};