//fetchArtifactsPlan   获取计划
//fetchArtifactsPlanRule   获取规则
App.ResourceArtifacts={
    Status:{
        presentPlan:null,  //当前计划或质量，提交数据
        saved : true,    //创建规则后的保存状态，已保存  /  未保存
        presentRule : null,    //当前规则
        qualityProcessType:1,   //质量标准 -过程选择  type
        delRule:null,
        qualityStandardType:"GC",   //质量标准 -过程选择  type
        type:"", //1:标准规则；2：项目规则
        projectId : "",//如果有项目规则就有项目id
        templateId:"",
        //模块化
        plan:{},
        rule:{
            biz:"",//1：模块化；2：质监标准
            type : "", //1:标准规则；2：项目规则
            targetCode:"",  //对应模块的code
            targetName:"",
            "mappingCategory": {
                "categoryCode": "",
                "categoryName": "",
                "mappingPropertyList":[]
            }
        },
        openRule: null, //正在打开的规则，注意重置
        quality:{
            standardType:"GC",
            parentCode:""
        }
    },
    Settings: {
        delayCount:  0 , //每层加载数量
        ruleModel: 3,   //  权限入口      1 只有模块化，  2 只有质量标准  ， 3 有模块化和质量标准
        model : ""
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
    //质量标准，获取二级列表
    QualityStandard : new(Backbone.Collection.extend({
        model:Backbone.Model.extend({
            defaults:function(){
                return{

                }
            }
        })
    })),
    //计划规则/获取
    operator:Backbone.Model.extend({
        defaults:function(){
            return{
                code : ""
            }
        }}),
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
        }
    }),

    saveRuleModel:function(){
        return   {
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
        }
    },
    //创建计划规则，模板
    createPlanRules:function(){
        //创建新的构件映射计划节点
        var newPlanRuleData = {
            "biz": "",//1：模块化；2：质监标准  //新建时写入值
            "targetCode": "",//新建时写入当前计划编号
            "targetName": "",//计划名称
            "type": "",//1:标准规则；2：项目规则  //新建时写入值
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
        newPlanRuleData.biz =  App.ResourceArtifacts.Status.biz;
        newPlanRuleData.targetCode =  App.ResourceArtifacts.Status.rule.targetCode;
        newPlanRuleData.targetName =  "";
        newPlanRuleData.type =  App.ResourceArtifacts.Status.type;

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
    //规则collection
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

    //质量标准，获取二级列表
    TplCollection : new(Backbone.Collection.extend({
        model:Backbone.Model.extend({
            defaults:function(){
                return{

                }
            }
        })
    })),

    init:function(_this,optionType) {
        if(optionType == "template" ){
            //规则模板
            $(".breadcrumbNav .mappingRule").show();
            var tplFrame = new App.Resources.ArtifactsTplFrame();
            var tplList = new App.Resources.ArtifactsTplList();
            _this.$el.append(tplFrame.render().el);//菜单
            tplFrame.$(".modelListContainer").html(tplList.render().el);
            this.getTpl();



            $("#pageLoading").hide();
        }else if(optionType == "library"){
            App.ResourceArtifacts.Status.rule.biz =1;  //设置默认规则为模块化
            var pre = new App.Resources.ArtifactsMapRule();  //外层菜单
            var plans = new App.Resources.ArtifactsPlanList();   //模块化列表 /计划节点
            var planRule = new App.Resources.ArtifactsPlanRule();  //默认规则

            _this.$el.append(pre.render().el);//菜单
            pre.$(".plans").html(plans.render().el);//计划节点
            pre.$(".rules .ruleContent").html(planRule.render().el);//映射规则

            //插入默认为空的规则列表
            this.getPlan();
            $("#pageLoading").hide();
            this.loaddeaprt();
            $(".mappingRule").show();
        }
    },
    //获取分类编码
    loaddeaprt:function(){
        //获取分类编码
        var cdata = {
            URLtype:"fetchArtifactsCategoryRule",
            data:{}
        };
        App.Comm.ajax(cdata,function(response){
            if(response.code == 0 && response.data && response.data.length){
                App.Resources.artifactsTreeData = response.data;
            }
        });
    },
    //获取计划节点
    getPlan:function(){
        var _this = this, pdata;
        App.ResourceArtifacts.Status.type =1 ;
        pdata  = {
            URLtype:"fetchArtifactsPlan",
            data:{
                type : App.ResourceArtifacts.Status.type
            }
        };
        App.ResourceArtifacts.PlanRules.reset();
        App.ResourceArtifacts.PlanNode.reset();
        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 && response.data){
                if(response.data.length){
                App.ResourceArtifacts.PlanNode.add(response.data);
                }else{
                    _this.resetRuleList();
                }
            }
        });
    },
    //获取质量标准
    getQuality:function(pdata,_this){

        App.ResourceArtifacts.PlanRules.reset();
        App.ResourceArtifacts.Status.quality.type = 1 ;
        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 && response.data.length){
                var list = App.Resources.artifactsQualityTree(response.data);
                _this.$(".qualityMenuList").html(list);
            }
        });
    },

    //获取规则模板
    getTpl:function(){
        var _this = this, pdata;
        //App.ResourceArtifacts.Status.type =1 ;
        pdata  = {
            URLtype:"fetchArtifactsTemplate",
            data:{}
        };
        App.ResourceArtifacts.TplCollection.reset();
        App.ResourceArtifacts.PlanRules.reset();
        App.Comm.ajax(pdata,function(response){
            console.log(response);
            if(response.code == 0 && response.data){
                if(response.data.length){
                    App.ResourceArtifacts.TplCollection.add(response.data);
                }else{

                }
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
    loading:function(ele){
        $(ele).addClass(".services_loading");
    },

    loaded:function(ele){
        $(ele).removeClass(".services_loading");
    },
    resetRuleList:function(){
        $(".ruleContent ul").html("<li><div class='ruleTitle delt'>暂无内容</div></li>");
    }


};