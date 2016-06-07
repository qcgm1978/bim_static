//fetchArtifactsPlan   ��ȡ�ƻ�
//fetchArtifactsPlanRule   ��ȡ����
App.ResourceArtifacts={
    Status:{
        presentPlan:null,  //��ǰ�ƻ����������ύ����
        saved : true,    //���������ı���״̬���ѱ���  /  δ����
        presentRule : null,    //��ǰ����
        qualityProcessType:1,   //������׼ -����ѡ��  type
        delRule:null,
        qualityStandardType:"GC",   //������׼ -����ѡ��  type
        type:"", //1:��׼����2����Ŀ����
        projectId : "",//�������Ŀ���������Ŀid
        templateId:"",
        //ģ�黯
        plan:{},
        rule:{
            biz:"",//1��ģ�黯��2���ʼ��׼
            type : "", //1:��׼����2����Ŀ����
            targetCode:"",  //��Ӧģ���code
            targetName:"",
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
//�ƻ�����/��ȡ
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

    //������׼����ȡ�����б�
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
            //����ģ��
            $(".breadcrumbNav .mappingRule").show();
            var tplFrame = new App.Resources.ArtifactsTplFrame();
            var tplList = new App.Resources.ArtifactsTplList();
            _this.$el.append(tplFrame.render().el);//�˵�
            tplFrame.$(".modelListContainer").html(tplList.render().el);
            this.getTpl();



            $("#pageLoading").hide();
        }else if(optionType == "library"){
            App.ResourceArtifacts.Status.rule.biz =1;  //����Ĭ�Ϲ���Ϊģ�黯
            var pre = new App.Resources.ArtifactsMapRule();  //���˵�
            var plans = new App.Resources.ArtifactsPlanList();   //ģ�黯�б� /�ƻ��ڵ�
            var planRule = new App.Resources.ArtifactsPlanRule();  //Ĭ�Ϲ���

            _this.$el.append(pre.render().el);//�˵�
            pre.$(".plans").html(plans.render().el);//�ƻ��ڵ�
            pre.$(".rules .ruleContent").html(planRule.render().el);//ӳ�����

            //����Ĭ��Ϊ�յĹ����б�
            this.getPlan();
            $("#pageLoading").hide();
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
        });
    },
    //��ȡ�ƻ��ڵ�
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
    //��ȡ������׼
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
            console.log(response);
            if(response.code == 0 && response.data){
                if(response.data.length){
                    App.ResourceArtifacts.TplCollection.add(response.data);
                }else{

                }
            }
        });
    },


    //�ӳ�
    delay:function(data){
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
    },
    loading:function(ele){
        $(ele).addClass(".services_loading");
    },

    loaded:function(ele){
        $(ele).removeClass(".services_loading");
    },
    resetRuleList:function(){
        $(".ruleContent ul").html("<li><div class='ruleTitle delt'>��������</div></li>");
    }


};