//fetchArtifactsPlan   ��ȡ�ƻ�
//fetchArtifactsPlanRule   ��ȡ����
App.ResourceArtifacts={
    resetPreRule:function(){

        App.ResourceArtifacts.Status.templateId = "";
        App.ResourceArtifacts.Status.templateName = "";
        App.ResourceArtifacts.Status.rule.biz = "";
        App.ResourceArtifacts.Status.rule.targetCode = "";
        App.ResourceArtifacts.Status.rule.targetName = "";
    },

    modelRuleSaveData:{
        templateId: "",
        templateName:"",
        ruleIdsIn:[],//����Ĺ���id
        ruleIdsDel:[],//ɾ���Ĺ���id
        codeIdsIn:[],//�����Ŀ�����
        codeIdsDel:[]//ɾ����Ŀ�����
    },

    resetModelRuleSaveData:function(){
        App.ResourceArtifacts.modelRuleSaveData.templateId ="";
        App.ResourceArtifacts.modelRuleSaveData.templateName = "";
        App.ResourceArtifacts.modelRuleSaveData.ruleIdsIn = [];
        App.ResourceArtifacts.modelRuleSaveData.ruleIdsDel = [];
        App.ResourceArtifacts.modelRuleSaveData.codeIdsIn = [];
        App.ResourceArtifacts.modelRuleSaveData.codeIdsDel = [];
    },


    Status:{
        presentPlan:null,  //��ǰ�ƻ����������ύ����
        saved : true,    //���������ı���״̬���ѱ���  /  δ����
        presentRule : null,    //��ǰ����
        qualityProcessType:1,   //������׼ -����ѡ��  type
        delRule:"",
        qualityStandardType:"GC",   //������׼ -����ѡ��  type
        type:"", //1:��׼����2����Ŀ����
        projectId : "",//�������Ŀ���������Ŀid
        templateId:"",
        templateName:"",
        rule:{
            biz:"",//1��ģ�黯��2���ʼ��׼
            type : "", //1:��׼����2����Ŀ����
            targetCode:"",  //��Ӧģ���code
            targetName:"",
            count:"",
            "mappingCategory": {
                "categoryCode": "",
                "categoryName": "",
                "mappingPropertyList":[]
            }
        },
        openRule: null, //���ڴ򿪵Ĺ���ע������
        quality:{
            standardType:"GC",
            parentCode:""
        }
    },
    Settings: {
        delayCount:  0 , //ÿ���������
        ruleModel: 3,   //  Ȩ�����      1 ֻ��ģ�黯��  2 ֻ��������׼  �� 3 ��ģ�黯��������׼
        model : ""
    },
//�ƻ��ڵ�
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
                $().html('<li>������</li>');
            }
        }
    })),
    //������׼����ȡ�����б�
    QualityStandard : new(Backbone.Collection.extend({
        model:Backbone.Model.extend({
            defaults:function(){
                return{

                }
            }
        })
    })),
    //�ƻ�����/��ȡ
    operator:Backbone.Model.extend({
        defaults:function(){
            return{
                code : ""
            }
        }}),
//�ƻ�����/��ȡ�ڵ����
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
                $().html('<li>������</li>');
            }
        }
    })),

    //�����ƻ�����
    newPlanRules : Backbone.Model.extend({
        defaults:function(){
            return{
                code : ""
            }
        }
    }),

    saveRuleModel:function(){
        return   {
            "biz": 1,//1��ģ�黯��2���ʼ��׼  //�½�ʱд��ֵ
            "targetCode": "",//�½�ʱд�뵱ǰ�ƻ����
            "targetName": "",//�ƻ�����
            "type": 1,//1:��׼����2����Ŀ����  //�½�ʱд��ֵ
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
    //�����ƻ�����ģ��
    createPlanRules:function(){
        //�����µĹ���ӳ��ƻ��ڵ�
        var newPlanRuleData = {
            "biz": "",//1��ģ�黯��2���ʼ��׼  //�½�ʱд��ֵ
            "targetCode": "",//�½�ʱд�뵱ǰ�ƻ����
            "targetName": "",//�ƻ�����
            "type": "",//1:��׼����2����Ŀ����  //�½�ʱд��ֵ
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
        //д���������
        newPlanRuleData.biz =  App.ResourceArtifacts.Status.biz;
        newPlanRuleData.targetCode =  App.ResourceArtifacts.Status.rule.targetCode;
        newPlanRuleData.targetName =  "";
        newPlanRuleData.type =  App.ResourceArtifacts.Status.type;

        return new this.newPlanRules(newPlanRuleData);
    },

//����ƻ�����
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
                //����ɹ�
            }
        }
    }),
    //��ӳ������ģ��
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
    //�½�����
    newRule : Backbone.Model.extend({
        defaults:function(){
            return{
                code : ""
            }
        }
    }),
    //�½�����
    newCode : Backbone.Model.extend({
        defaults:function(){
            return{
                code : ""
            }
        }
    }),
    //����collection
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
                //$().html('<li>������</li>');
            }
        }
    })),

    //����ģ���б�
    TplCollection : new(Backbone.Collection.extend({
        model:Backbone.Model.extend({
            defaults:function(){
                return{

                }
            }
        })
    })),

    //����ģ������б�
    TplCollectionRule : new(Backbone.Collection.extend({
        model:Backbone.Model.extend({
            defaults:function(){
                return{

                }
            }
        })
    })),

    init:function(_this,optionType) {
        _this.$(".breadcrumbNav span").eq(3).hide();
        _this.$(".breadcrumbNav span").eq(4).hide();
        $("#artifacts").addClass("services_loading");

        this.ArtifactsIndexNav = new App.Resources.ArtifactsIndexNav();//ģ�黯/������׼�˵�
        if(optionType == "library" ||  optionType == "template"){
            App.ResourceArtifacts.Status.projectId = "";
            App.ResourceArtifacts.Status.projectName = "";
            _this.$el.append(this.ArtifactsIndexNav.render().el);
        }else{
            this.ArtifactsProjectBreadCrumb = new App.Resources.ArtifactsProjectBreadCrumb();
            _this.$el.html(this.ArtifactsProjectBreadCrumb.render().el);
            //��Ŀӳ�����
            App.ResourceArtifacts.Status.projectName = App.Comm.publicData.services.project.projectName;
        }

        //�������
        this.menu = new App.Resources.ArtifactsMapRule();  //���˵�
        this.plans = new App.Resources.ArtifactsPlanList();   //ģ�黯�б� /�ƻ��ڵ�
        this.planRuleTitle = new App.Resources.ArtifactsPlanRuleTitle();  //����ͷ��
        this.planRule = new App.Resources.ArtifactsPlanRule();  //�����б�
        this.quality = new App.Resources.ArtifactsQualityList();//������׼�����
        this.plans.planRule = this.menu;
        this.menu.quality = this.quality;
        this.menu.plans = this.plans;

        App.ResourceArtifacts.Status.rule.biz = 1;
        App.ResourceArtifacts.Status.templateId = "";

        if(optionType == "template" ){//����ģ��

            _this.$(".mappingRule .template").addClass("active").siblings("a").removeClass("active");

            App.ResourceArtifacts.Status.qualityStandardType = "GC";

            if(App.ResourceArtifacts.Settings.ruleModel  ==2){
                App.ResourceArtifacts.Status.rule.biz =2
            }

            this.tplFrame = new App.Resources.ArtifactsTplFrame();
            this.tplList = new App.Resources.ArtifactsTplList();

            _this.$el.append(this.tplFrame.render().el);//�˵�
            this.tplFrame.$(".tplListContainer").html(this.tplList.render().el);

            this.getTpl();
        }else{//�����
            if(optionType != "library" ){

            }
            _this.$(".mappingRule .library").addClass("active").siblings("a").removeClass("active");
            _this.$el.append(this.menu.render().el);//�˵�
            _this.$(".projectName").html( App.ResourceArtifacts.Status.projectName);
            this.menu.$(".plans").html(this.plans.render().el);//�ƻ��ڵ�
            this.menu.$(".qualifyC").hide().html(this.quality.render().el);
            this.menu.$(".rules").html(this.planRuleTitle.render().el);//ӳ�����
            this.planRuleTitle.$(".ruleContentRuleList").html(this.planRule.render().el);//ӳ�����

            //����Ĭ��Ϊ�յĹ����б�
            this.getPlan();
            this.getQuality();
            this.loaddeaprt();
            $(".mappingRule").show();
        }
    },

    //��ȡ�������
    loaddeaprt:function(){
        //��ȡ�������
        var cdata = {
            URLtype:"fetchArtifactsCategoryRule",
            data:{}
        };
        App.Comm.ajax(cdata,function(response){
            if(response.code == 0 && response.data && response.data.length){
                App.Resources.artifactsTreeData = response.data;
            }
            $("#artifacts").removeClass("services_loading");
        });
    },
    //��ȡ�ƻ��ڵ�
    getPlan:function(){
        var _this = App.ResourceArtifacts, pdata;
        pdata  = {
            URLtype:"fetchArtifactsPlan",
            data:{
                type : App.ResourceArtifacts.Status.type
            }
        };

        if(App.ResourceArtifacts.Status.templateId){
            pdata.data.templateId = App.ResourceArtifacts.Status.templateId;
        }else if(App.ResourceArtifacts.Status.projectId){
            pdata.data.projectId = App.ResourceArtifacts.Status.projectId;
        }
        App.ResourceArtifacts.PlanRules.reset();
        App.ResourceArtifacts.PlanNode.reset();
        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 && response.data){
                if(response.data.length){
                App.ResourceArtifacts.PlanNode.add(response.data);
                }else{
                    Backbone.trigger("mappingRuleNoContent");
                }
                $("#artifacts").removeClass("services_loading");
            }
        });
    },
    //��ȡ������׼
    getQuality:function(){
        var pdata = {
            URLtype:'fetchArtifactsQuality',
            data:{
                parentCode: "",
                type:App.ResourceArtifacts.Status.type,
                standardType: App.ResourceArtifacts.Status.qualityStandardType
            }
        };

        if(App.ResourceArtifacts.Status.templateId){
            pdata.data.templateId = App.ResourceArtifacts.Status.templateId;
        }else if(App.ResourceArtifacts.Status.projectId){
            pdata.data.projectId = App.ResourceArtifacts.Status.projectId;
        }

        App.ResourceArtifacts.PlanRules.reset();
        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 && response.data.length){
                var list = App.Resources.artifactsQualityTree(response.data);
                this.$(".qualityMenuList").html(list);
            }
            $("#artifacts").removeClass("services_loading");
        });
    },

    //��ȡ����ģ��
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
            if(response.code == 0 && response.data){
                if(response.data.length){
                    App.ResourceArtifacts.TplCollection.add(response.data);
                }else{
                }
            }
            $("#artifacts").removeClass("services_loading");
        });
    },


    //�ӳ�
   /* delay:function(data){
    var _this = this , batch , length = data.length , arr = []  , n = 1 , last;
        batch = Math.ceil(length/20); //ѭ������
        last = length % 20; //����
        if(batch > 0){
            App.ResourceArtifacts.delays = setTimeout(function(){
               // var as = ;
                App.ResourceArtifacts.PlanNode.add();
                _this.delay();
                n++;
            },100);
        }
    },*/
    loading:function(ele){
        $(ele).addClass("services_loading");
    },

    loaded:function(ele){
        $(ele).removeClass("services_loading");
    }
};