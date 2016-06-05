/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanRuleDetail = Backbone.View.extend({

    tagName:"li",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.planruledetail.html"),

    events:{
        "click .desc":"getDetail",
        "click .tabRule":"tabRule",
        "click .addNewRule":"addNewRule",
        "click .deleteRule":"deleteRule",
        "click .saveRule":"saveRule",
        "click .choose":"choose",
        "click .delRule": "delRule",
        "focus .categoryCode": "legend"
    },

    render:function() {

        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    initialize:function(){
        this.listenTo(this.model,"change",this.render);
        this.listenTo(this.model,"mappingCategoryChange",this.render);
    },

    getDetail:function(){
        var _this = this;
        this.tabRule();
        //ӳ�����
        var operator = new App.Resources.ArtifactsPlanRuleDetailOperator().render().el;
        this.$(".mapRule").html(operator);//�����б�
        var operatorData = App.Resources.dealStr(_this.model);//��������
        App.ResourceArtifacts.operator.reset();
        App.ResourceArtifacts.operator.add(operatorData);
    },
    //����״̬
    tabRule:function(){
        if(this.$(".ruleDetail:visible").length){    //��ʾ
            this.$(".ruleDetail").hide();
        }else{
            $(".ruleDetail").hide();
            this.$(".ruleDetail").show();
        }
    },


    //ѡ��������
    choose:function(){
        var tree  = new App.Resources.ArtifactsWindowRule().render().el;
        this.window(tree);
        App.Resources.ArtifactsMaskWindow.find(".content").css({"position":"relative"});
        var contain = App.Resources.artifactsTree(App.Resources.artifactsTreeData);
        $("#resourcesArtifactTree").html(contain);
        App.ResourceArtifacts.presentRule = this.model;
    },
    //�����¹���
    addNewRule:function(){
        var model = new App.ResourceArtifacts.newRule(App.ResourceArtifacts.newModel);
        App.ResourceArtifacts.operator.add(model);
    },

    //����
    saveRule:function(){
        //У��
        /*var  check = this.check();
        if(!check){return}*/

        var _this =this;

        //�����������ݣ�ƴ�ӳ��ַ���
        var title =  this.$(".ruleTitle");
        var id = title.data("id");

        var categoryCode = App.ResourceArtifacts.Status.rule.mappingCategory.categoryCode  ||  this.$(".categoryCode").val();
        var categoryName = App.ResourceArtifacts.Status.rule.mappingCategory.categoryName || this.$(".chide i").text();

        if(!categoryCode){
            alert("������벻��Ϊ��!");
            return
        }

        if(!categoryName){
            alert("�������Ʋ���Ϊ��!");
            return
        }


        var model = App.ResourceArtifacts.saveRuleModel();
        var dd =  this.$("dd");
        var Rulist = [];


        for(var i =0 ; i < dd.length ; i++){
            Rulist[i]  ={};
            var propertyKey = dd.eq(i).find(".leftten input");
            if(!propertyKey.val()){
                propertyKey.focus();
                alert("�������Ʋ���Ϊ�գ�");
                return
            }
            Rulist[i].propertyKey = propertyKey.val();



            Rulist[i].operator = dd.eq(i).find(".leftten .myDropDown").attr("data-operator");


            if(dd.eq(i).find(".eIn").hasClass("active")){
                var name = dd.eq(i).find(".eIn input");
                if(!name.val()){
                    name.focus();
                    alert("�������ݲ���Ϊ��");
                    return
                }
                Rulist[i].propertyValue = name.val();

            }else if(dd.eq(i).find(".ioside").hasClass("active")){
                if(!dd.eq(i).find(".ioside.active").length && !dd.eq(i).find(".eIn.active").length){
                    alert("����ѡһ�����");
                    return
                }
                var left = dd.eq(i).find(".ioside .myDropDown").eq(0);
                var leftValue = dd.eq(i).find(".ioside input").eq(0);
                var right = dd.eq(i).find(".ioside .myDropDown").eq(1);
                var rightValue = dd.eq(i).find(".ioside input").eq(1);

                if(!leftValue.val() && !rightValue.val()){
                    leftValue.focus();
                    alert("��������дһ������");
                    //�趨����
                    return
                }

           /*     if(!leftValue.val()){
                    left = ""
                }
                if(!rightValue.val()){
                    right = ""
                }*/

                var str = left.data("operator")  + leftValue.val() +","+ rightValue.val()+ right.data("operator") ;
                Rulist[i].propertyValue = str;
            }
        }

        model.mappingCategory.categoryCode = categoryCode;
        model.mappingCategory.categoryName = categoryName;
        model.mappingCategory.mappingPropertyList = Rulist;



        this.model.set({"targetCode":App.ResourceArtifacts.Status.rule.targetCode},{silent:true});
        this.model.set({"targetName":App.ResourceArtifacts.Status.rule.targetName},{silent:true});
        this.model.set({"biz":App.ResourceArtifacts.Status.rule.biz},{silent:true});
        this.model.set({"type":App.ResourceArtifacts.Status.type},{silent:true});
        this.model.set({"mappingCategory": model.mappingCategory},{silent:true});


        var baseData = this.model.toJSON();


        var cdata = {
            URLtype : '',
            type:"POST",
            data : JSON.stringify(baseData),
            contentType: "application/json",
            projectId : App.ResourceArtifacts.Status.projectId
        };



        if(this.model.get("id")){
            cdata.URLtype = "modifyArtifactsPlanRule";
            cdata.type ="PUT";
            //����
        }else{
            cdata.URLtype = "createArtifactsPlanNewRule";
        }


        $(".artifactsContent .rules").addClass("services_loading");
        App.Comm.ajax(cdata,function(response){
            if(response.code == 0 && response.data){
                _this.$el.closest(".ruleDetail").hide();
                //����
                if(cdata.URLtype == "createArtifactsPlanNewRule"){
                    _this.model.set({"id":response.data.id},{silent:true});
                    title.data("id",response.data.id);
                    App.ResourceArtifacts.Status.delRule = response.data.id;
                    //����
                    $(".artifactsContent .rules h2 .name").html(App.ResourceArtifacts.Status.rule.targetCode+ "&nbsp;" +App.ResourceArtifacts.Status.rule.targetName);
                    var count = parseInt(App.ResourceArtifacts.Status.presentPlan.get("count"));
                    $(".artifactsContent .rules h2 i").html( "("+Rulist.length + ")");

                }
                _this.reset();
                $(".artifactsContent .rules").removeClass("services_loading");
            }
        });

    },

    //���ñ���״̬
    reset:function(){
        App.ResourceArtifacts.Status.saved = true ;
    },

    //ɾ���ƻ��е���������
    deleteRule:function(){
        App.ResourceArtifacts.Status.delRule = this.model.get("id");

        var _this = this;
        //�½���δ�޸�
        if(!_this.model.get("id") && App.ResourceArtifacts.Status.saved){//���δ�޸�����գ�ע���½�ʱ���޸�   App.ResourceArtifacts.Status.saved ֵ�����
            _this.$el.closest("li").hide().empty();
            _this.reset();
            return
        }
        var frame = new App.Resources.ArtifactsPlanRuleAlert().render().el;
        App.Resources.ArtifactsAlertWindow = new App.Comm.modules.Dialog({
            title: "",
            width: 280,
            height: 180,
            isConfirm: false,
            isAlert: false,
            message: frame
        });
        $(".mod-dialog .wrapper .header").hide();//����ͷ��
        $(".alertInfo").html('ȷ��ɾ�� ��'+ _this.model.get("targetName") + '����');
    },
    //ɾ����������
    delRule:function(e){
        var rule = $(e.target),_this = this;
        var id  = rule.siblings(".leftten").data("id");
        var mappingCategory = _this.model.get("mappingCategory");
        var list = mappingCategory["mappingPropertyList"];
        for(var i = 0 ; i < list.length ; i ++){
            if(list[i].id == id){
                list.splice(i,1)
            }
        }

        mappingCategory["mappingPropertyList"] = list;
        _this.model.set({"mappingCategorymappingCategory":mappingCategory},{silent:true});
        var operatorData = App.Resources.dealStr(_this.model);
        App.ResourceArtifacts.operator.reset();
        App.ResourceArtifacts.operator.add(operatorData);
    },
    //����ģ��
    legend:function(e){
        var _this = this;
        _this.$(".chide").css({"visibility":"hidden"});
        var ac = _.map(App.Resources.artifactsTreeData,function(item){return item.code}); //����-����
        var pre = $(e.target);
        $(e.target).addClass("active");
        pre.css({"opacity":"1"});
        //���벻�Ϸ����޷��ҵ�
        var list = pre.closest("div").siblings("ul");
        list.html();

        if(pre.val()){
            list.show();
        }
        //���
        pre.on("keydown",function(){
            list.show();
            pre.removeClass("alert");
        });

        pre.on("keyup",function(e){
            App.Resources.cancelBubble(e);
            var val = pre.val(),test, count = 5,str = '',index,arr = [],unResult = "<li>��������ƥ����</li>";  //��ʾ5��
            list.html("");
            val = val.replace(/\s+/,'');
            if(!val){list.hide();return}
            val = val.replace(/\u3002+/,'.');
            //��ֹ��������֣���Ǿ�����
            test = /[^\d\.]+/.test(val);
            if(test){
                list.html(unResult);
                return;
            }

            str = val;
            var x = str.length%3;
            if(x ==0){
                if(_.last(str) != "."){ list.html(unResult);return}
                str = _.initial(str);
                str = str.join('');
                index = _.indexOf(ac,str,true);
            }else if(x == 1){
                for(var s = 0 ; s< 9 ; s++){
                    var sd = str + s + '';
                    index = _.indexOf(ac,sd);
                    if(index >= 0){
                        break
                    }
                }
            }else{
                index = _.indexOf(ac,str,true);
            }

            if(index < 0 ){
                list.html(unResult);
                return
            }
            for(var j = index  ;  j < App.Resources.artifactsTreeData.length  ; j++){
                if(App.Resources.artifactsTreeData[j].length <= val.length ||  j - index  + 1 >count) {
                    break
                }
                var newRule = new App.ResourceArtifacts.newCode(App.Resources.artifactsTreeData[j]);
                list.append(new App.Resources.ArtifactsRuleLegend({model:newRule}).render().el);
            }
        });
    },

    //У��ģ��
    check:function(){
        var vals = this.$(".categoryCode");
        if(!vals.val()){
            vals.focus();
            this.redAlert(vals);
            return false;
        }
        return true
    },
    //��ʼ������
    window:function(frame){
        App.Resources.ArtifactsMaskWindow = new App.Comm.modules.Dialog({
            title:"ѡ��������",
            width:600,
            height:500,
            isConfirm:false,
            isAlert:false,
            closeCallback:function(){
                App.Resources.ArtifactsMaskWindow.close();
            },
            message:frame
        });
    },
    //��ɫ��ʾ����
    redAlert:function(ele){
        ele.addClass("alert");
    }

});