//fetchArtifactsPlan   获取计划
//fetchArtifactsPlanRule   获取规则
App.ResourceArtifacts={
    Status:{
        presentPlan:null,
        saved : true    //创建规则后的保存状态，已保存  /  未保存
    },

    Settings: {
        delayCount:  0  //每层加载数量

    },

    openRule: null,

    rule:{
        equal :"相等",
        unequal:"不等",
        inside:"范围内",
        outside:"范围外"
    },
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

    //创建一条规则
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


    newModel : {
        "key":"", "rule":"", "value": null
    },


    //新建规则
    newRule : Backbone.Model.extend({
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
        var pre = new App.ResourcesNav.ArtifactsMapRule();
        var plans = new App.ResourcesNav.ArtifactsPlanList();
        var planRule = new App.ResourcesNav.ArtifactsPlanRule();
        _this.$el.append(pre.render().el);//菜单
        pre.$(".plans").html(plans.render().el);//计划节点
        pre.$(".rules").append(planRule.render().el);//菜单
        //插入默认为空的规则列表
        this.getPlan();
        $("#pageLoading").hide();
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
    }
};