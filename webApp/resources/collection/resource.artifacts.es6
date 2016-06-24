//fetchArtifactsPlan   ��ȡ�ƻ�
//fetchArtifactsPlanRule   ��ȡ����
App.ResourceArtifacts={
    Status:{
        saved : true,    //���������ı���״̬���ѱ���  /  δ����
        qualityProcessType:1,   //������׼ -����ѡ��  type
        delRule:"",
        qualityStandardType:"GC",   //������׼ -����ѡ��  type
        type:"", //1:��׼����2����Ŀ����
        projectId : "",//�������Ŀ���������Ŀid
        templateId:"",
        modelEdit:false,
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
            } else {}
        },
        comparator:function(item){
            return item.get("mappingCategory").categoryCode
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
    //�½���Ŀ
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
        _this.$(".breadcrumbNav .breadItem").hide();
        _this.$(".breadcrumbNav .fileNav").hide();
        _this.$(".breadcrumbNav .breadItem.project").show();

        this.loaddeaprt();//�������

        if(optionType == "library" ||  optionType == "template"){
            App.ResourceArtifacts.Status.projectId = "";
            App.ResourceArtifacts.Status.projectName = "";
            this.ArtifactsIndexNav = new App.Resources.ArtifactsIndexNav();//ģ�黯/������׼�˵�
            _this.$el.append(this.ArtifactsIndexNav.render().el);
        }else{
            //��Ŀ
            App.ResourceArtifacts.Status.projectId  = optionType;
            this.ArtifactsProjectBreadCrumb = new App.Resources.ArtifactsProjectBreadCrumb();
            _this.$el.html(this.ArtifactsProjectBreadCrumb.render().el);
            //��Ŀӳ���������
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
            _this.$(".resourcesMappingRule .template").addClass("active").siblings("a").removeClass("active");
            App.ResourceArtifacts.Status.qualityStandardType = "GC";
            if(App.ResourceArtifacts.Settings.ruleModel  ==2){
                App.ResourceArtifacts.Status.rule.biz =2
            }

            this.tplFrame = new App.Resources.ArtifactsTplFrame();
            this.tplList = new App.Resources.ArtifactsTplList();
            this.detail = new App.Resources.ArtifactsTplDetail();

            _this.$el.append(this.tplFrame.render().el);//�˵�
            this.tplFrame.$(".tplListContainer").html(this.tplList.render().el);//�Ҳ���
            this.tplFrame.$(".tplContent .content").html(this.detail.render().el);
            this.detail.$(".tplDetailCon").append(this.menu.render().el);//�˵�
            this.menu.$(".plans").html(this.plans.render().el);//�ƻ�
            this.menu.$(".rules").append(this.planRuleTitle.render().el);//����
            this.planRuleTitle.$(".ruleContentRuleList").append(this.planRule.render().el);//�����б�
            this.menu.$(".qualifyC").append(this.quality.render().el);//����

            this.detail.$(".artifactsContent").addClass("explorer");
            $("#artifacts").addClass("services_loading");
            this.getTpl();




        }else{//�����
            App.ResourceArtifacts.modelEdit = false;
            _this.$(".resourcesMappingRule .library").addClass("active").siblings("a").removeClass("active");
            _this.$el.append(this.menu.render().el);//�˵�
            this.menu.$(".plans").html(this.plans.render().el);//�ƻ��ڵ�
            this.menu.$(".qualifyC").hide().html(this.quality.render().el);
            this.menu.$(".rules").html(this.planRuleTitle.render().el);//ӳ�����
            this.planRuleTitle.$(".ruleContentRuleList").html(this.planRule.render().el);//ӳ�����
            //д����Ŀ����
            if(App.ResourceArtifacts.Status.projectId){
               this.getProjectName(_this,App.ResourceArtifacts.Status.projectId)
            }

            $("#artifacts").addClass("services_loading");

            //��������
            this.getPlan();
            this.getAllQuality(function(data){
                App.ResourceArtifacts.departQuality(App.ResourceArtifacts.menu.$(".qualityMenuListGC"),App.ResourceArtifacts.allQualityGC,null,"0");
                App.ResourceArtifacts.menu.$(".qualityMenuListGC").show();
                App.ResourceArtifacts.departQuality(App.ResourceArtifacts.menu.$(".qualityMenuListKY"),App.ResourceArtifacts.allQualityKY,null,"0");
            });
        }
        $(".resourcesMappingRule").show();
    },

    loadTplRelateContent:function(n){

    },
    //��ȡ��Ŀ����
    getProjectName:function(_this,projectId){
        var pdata = {
            URLtype: "fetchArtifactsProjectName",
            data:{
                projectId:projectId
            }
        };
        App.Comm.ajax(pdata,function(response){
            if(response.code == 0){
                _this.$(".projectName").html( response.data.name);
            }
        });
    },
    // ��ȡ�������
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
            }
        });
    },
    //����
    modelSaving:{
        templateId: "",
        templateName: "",
        codeIds:[]
    },
    allQualityGC: [],
    allQualityKY: [],
    //��ȡȫ��������׼
    getAllQuality:function(fn){
        var _this = this;
        var pdata = {
            URLtype:'fetchArtifactsQuality',
            data:{
                parentCode: "all",
                type:App.ResourceArtifacts.Status.type
            }
        };

        if(App.ResourceArtifacts.Status.templateId){
            pdata.data.templateId = App.ResourceArtifacts.Status.templateId;
        }else if(App.ResourceArtifacts.Status.projectId){
            pdata.data.projectId = App.ResourceArtifacts.Status.projectId;
        }

        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 && response.data.length){
                App.ResourceArtifacts.allQualityKY = _.filter(response.data,function(item){
                    return item.type == "KY"
                });
                App.ResourceArtifacts.allQualityGC = _.filter(response.data,function(item){
                    return item.type == "GC"
                });
                if(fn && typeof fn == "function"){
                    fn(response.data);
                }
            }
            $("#artifacts").removeClass("services_loading");
        });
    },

    //��ȡ�Ѿ����ز���Ҫ�洢����Ч����
    getValid:function(obj){
        return  {
                code : obj.code,
                ruleIds : obj.ruleIds || []
            };
    },


    //������׼�������࣬Ҫ����Ԫ�أ����ݣ��Ƿ��и��ڵ㣬ruleContain
    // ֵ�Ƿ����
    departQuality:function(ele,cdata,parentCode,ruleContain){
        var data = cdata , levelData;

        if(!parentCode){

            levelData = _.filter(data,function(item){
                return !item.parentCode
            });

        }else{
            levelData = _.filter(data,function(item){
                return item.parentCode == parentCode
            });
        }
        if(levelData.length){
            $(ele).html(App.Resources.artifactsQualityTree(levelData,ruleContain));
        }
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
        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 && response.data){
                if(response.data.length){
                    App.ResourceArtifacts.TplCollection.add(response.data);
                }else{}
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
    },
    //���ù���
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
    //����Ҫ�洢��ģ��
    resetModelRuleSaveData:function(){
        App.ResourceArtifacts.modelRuleSaveData.templateId ="";
        App.ResourceArtifacts.modelRuleSaveData.templateName = "";
        App.ResourceArtifacts.modelRuleSaveData.ruleIdsIn = [];
        App.ResourceArtifacts.modelRuleSaveData.ruleIdsDel = [];
        App.ResourceArtifacts.modelRuleSaveData.codeIdsIn = [];
        App.ResourceArtifacts.modelRuleSaveData.codeIdsDel = [];
    }
};